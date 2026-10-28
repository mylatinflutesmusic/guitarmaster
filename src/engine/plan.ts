import { WARMUPS, technique as getTechnique } from "../data/library";
import { PASS_MINUTES, methodFor } from "../data/methods";
import { REP_STATUSES } from "../types";
import type {
  Block,
  BlockKind,
  DayPlan,
  Level,
  LogEntry,
  MethodId,
  Phase,
  Piece,
  Profile,
  RepMethod,
  RepStatus,
  Session,
  SessionTotals,
  Technique,
  WeekPlan,
} from "../types";
import { addDaysKey, daysBetween, fromKey, shortDate, startOfWeek, toKey, todayKey } from "./dates";

/* ------------------------------------------------------------------ tuning */

/**
 * How much of a session goes to technique rather than repertoire. The more
 * advanced the player, the more the repertoire *is* the technique work; a
 * performance week strips technique back to maintenance.
 */
const TECHNIQUE_SHARE: Record<Level, number> = {
  beginner: 0.46,
  intermediate: 0.4,
  advanced: 0.32,
  conservatoire: 0.22,
};

const PHASE_TECHNIQUE_FACTOR: Record<Phase, number> = {
  foundation: 1,
  consolidation: 0.85,
  deload: 0.75,
  performance: 0.45,
};

const PASS_WEIGHT: Record<RepStatus, number> = {
  new: 3,
  learning: 3,
  memorising: 4,
  polishing: 4,
  maintenance: 1,
};

/** Value of each focus area when the player has not said what limits them. */
const DEFAULT_FOCUSES: Record<Level, string[]> = {
  beginner: ["tone", "arpeggios", "rhythm"],
  intermediate: ["arpeggios", "scales", "barre", "rhythm"],
  advanced: ["speed", "tremolo", "memory", "tone"],
  conservatoire: ["memory", "phrasing", "speed"],
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function loadStatusPasses(status: RepStatus): number {
  return REP_STATUSES.find((s) => s.id === status)?.passes ?? 3;
}

/* ------------------------------------------------------------- rotation */

export interface RotationState {
  cursor: number;
  techniquePasses: Record<string, number>;
  lastHighLoad: Record<string, string>;
}

export function newRotationState(log: LogEntry[]): RotationState {
  const techniquePasses: Record<string, number> = {};
  const lastHighLoad: Record<string, string> = {};
  for (const entry of log) {
    for (const block of entry.blocks) {
      if (block.techniqueId) {
        techniquePasses[block.techniqueId] = (techniquePasses[block.techniqueId] ?? 0) + 1;
      }
      if (block.kind === "technique") {
        lastHighLoad[block.techniqueId ?? "?"] = entry.date;
      }
    }
  }
  return { cursor: 0, techniquePasses, lastHighLoad };
}

/* ------------------------------------------------------- focus selection */

function focusList(profile: Profile): Technique[] {
  const ids = profile.focuses.length ? profile.focuses : DEFAULT_FOCUSES[profile.level];
  return ids.map((id) => getTechnique(id)).filter((t): t is Technique => Boolean(t));
}

/**
 * What the repertoire asks of the technique work, focus piece first. Reading a
 * score counts even when that piece is not the one the plan is built around —
 * otherwise analysing a score would change nothing about the week.
 */
function demandsForPlan(pieces: Piece[], focusPiece?: Piece): Technique[] {
  const ordered = focusPiece ? [focusPiece, ...pieces.filter((piece) => piece.id !== focusPiece.id)] : pieces;
  const seen = new Set<string>();
  const out: Technique[] = [];
  for (const piece of ordered) {
    for (const id of piece.demands ?? []) {
      if (seen.has(id)) continue;
      const found = getTechnique(id);
      if (!found) continue;
      seen.add(id);
      out.push(found);
    }
  }
  return out;
}

/**
 * The heart of "fit the technique to the time you have": when the session is
 * short, only the work with the highest value per minute survives.
 */
function minPriorityFor(minutes: number): 1 | 2 | 3 {
  if (minutes < 20) return 3;
  if (minutes < 35) return 2;
  return 1;
}

function eligibleTechniques(profile: Profile, minutes: number): Technique[] {
  const all = focusList(profile);
  const floor = minPriorityFor(minutes);
  const kept = all.filter((t) => t.priority >= floor);
  if (kept.length) return kept;
  return all.slice(0, 1);
}

/** Weighted rotation so the top-ranked weakness gets the most blocks overall. */
/**
 * Weighted rotation so the top-ranked weakness gets the most blocks overall.
 * `demands` are the needs of the piece the plan is built around: they earn a
 * place in the rotation even when the player did not list them as weaknesses.
 */
function weightedRotation(list: Technique[], demands: Technique[] = []): Technique[] {
  const weighted: Technique[] = [];
  list.forEach((t, i) => {
    const copies = i === 0 ? 3 : i === 1 ? 2 : 1;
    for (let c = 0; c < copies; c++) weighted.push(t);
  });
  for (const demand of demands) {
    if (list.some((t) => t.id === demand.id)) continue;
    weighted.push(demand, demand);
  }
  return weighted.length ? weighted : list;
}

function pickTechniques(
  profile: Profile,
  minutes: number,
  count: number,
  rotation: RotationState,
  dateKey: string,
  demands: Technique[] = [],
): Technique[] {
  const list = eligibleTechniques(profile, minutes);
  const weighted = weightedRotation(list, demands);
  const chosen: Technique[] = [];
  let guard = 0;
  while (chosen.length < count && guard < weighted.length * 2) {
    const candidate = weighted[rotation.cursor % weighted.length];
    rotation.cursor += 1;
    guard += 1;
    if (chosen.some((c) => c.id === candidate.id)) continue;
    const yesterday = addDaysKey(dateKey, -1);
    if (candidate.highLoad && rotation.lastHighLoad[candidate.id] === yesterday) continue;
    chosen.push(candidate);
  }
  if (!chosen.length && list.length) chosen.push(list[0]);
  if (!chosen.length && demands.length) chosen.push(demands[0]);
  for (const t of chosen) {
    if (t.highLoad) rotation.lastHighLoad[t.id] = dateKey;
  }
  return chosen;
}

/* ----------------------------------------------------------- warm-up */

function pickWarmup(profile: Profile, minutes: number, dateKey: string) {
  const order = { beginner: 0, intermediate: 1, advanced: 2, conservatoire: 3 };
  const allowed = WARMUPS.filter((w) => order[profile.level] >= order[w.minLevel]);
  const pool = allowed.length ? allowed : [WARMUPS[0]];
  const index = Math.abs(hash(dateKey + profile.level)) % pool.length;
  const chosen = pool[index];
  const cap = minutes <= 15 ? 3 : minutes <= 25 ? 4 : 6;
  return { warmup: chosen, minutes: clamp(chosen.minutes, 3, Math.min(cap, Math.max(3, Math.round(minutes * 0.2)))) };
}

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return h;
}

/* ------------------------------------------------------- session builder */

export interface SessionInput {
  dateKey: string;
  weekday: number;
  minutes: number;
  profile: Profile;
  /** Pieces scheduled for this day, already in urgency order. */
  schedule: { piece: Piece; passIndex: number }[];
  phase: Phase;
  rotation: RotationState;
  includeReading: boolean;
  daysToGoal?: number;
  /** The piece the plan is being built around, if any. */
  focusPiece?: Piece;
  /** The full repertoire, so each piece's demands can feed the technique rotation. */
  pieces?: Piece[];
}

export function buildSession(input: SessionInput): Session {
  const { profile, phase, rotation } = input;
  const dateKey = input.dateKey;
  const notes: string[] = [];

  // Performance taper: the last two days before the goal are deliberately light.
  let minutes = input.minutes;
  if (phase === "performance" && input.daysToGoal !== undefined && input.daysToGoal <= 2) {
    minutes = Math.max(15, Math.round(minutes * 0.7));
    notes.push("Taper: the last days before a performance are for light run-throughs, not new work.");
  }

  const { warmup, minutes: warmupMinutes } = pickWarmup(profile, minutes, dateKey);
  const closeMinutes = minutes >= 25 ? 3 : 0;
  const working = Math.max(8, minutes - warmupMinutes - closeMinutes);

  let share = TECHNIQUE_SHARE[profile.level] * PHASE_TECHNIQUE_FACTOR[phase];
  if (phase === "performance") share = Math.min(share, 0.18);
  if (!input.schedule.length) share = Math.min(0.9, share + 0.25);

  const techniqueBudget = Math.round(working * share);
  let repertoireBudget = working - techniqueBudget;

  // Sight-reading needs a settled block; it is not worth sabotaging a technique budget for.
  let readingMinutes = 0;
  if (input.includeReading && working >= 28) {
    readingMinutes = clamp(Math.round(working * 0.16), 6, 10);
    repertoireBudget = Math.max(8, repertoireBudget - readingMinutes);
  }

  const blocks: Block[] = [];
  const blockId = (kind: BlockKind, i: number) => `${dateKey}-${kind}-${i}`;

  // 1. Warm-up
  blocks.push({
    id: blockId("warmup", 0),
    kind: "warmup",
    title: warmup.name,
    minutes: warmupMinutes,
    intent: warmup.why,
    steps: warmup.steps,
    success: "The hands feel warmer and looser than when you sat down.",
    highLoad: false,
  });

  // 2. Technique blocks
  const techniqueCount = techniqueBudget <= 5 ? 1 : techniqueBudget <= 13 ? 2 : 3;
  const demandTechniques = demandsForPlan(input.pieces ?? [], input.focusPiece).filter(
    (t) => t.priority >= minPriorityFor(minutes),
  );
  const picked = pickTechniques(profile, minutes, techniqueCount, rotation, dateKey, demandTechniques);
  if (picked.length) {
    const per = Math.max(3, Math.round(techniqueBudget / picked.length));
    picked.forEach((t, i) => {
      const prescriptionIndex = roundRobin(rotation.techniquePasses[t.id] ?? 0, t.prescriptions.length);
      const prescription = t.prescriptions[prescriptionIndex];
      rotation.techniquePasses[t.id] = (rotation.techniquePasses[t.id] ?? 0) + 1;
      let blockMinutes = clamp(per, t.dose[0], t.dose[1]);
      if (profile.protectHands && t.highLoad) blockMinutes = Math.max(3, Math.round(blockMinutes * 0.75));
      const partner = input.focusPiece ?? input.schedule[0]?.piece;
      blocks.push({
        id: blockId("technique", i),
        kind: "technique",
        title: t.name,
        minutes: blockMinutes,
        intent: t.short,
        steps: prescription.steps,
        tempo: prescription.tempo,
        success: prescription.success,
        techniqueId: t.id,
        prescriptionId: prescription.id,
        highLoad: t.highLoad,
      });
      if (partner) notes.push(`Land ${prescription.name.toLowerCase()} in ${partner.title} before the block ends.`);
    });
  }
  // 3. Break in the middle of anything long enough to need one.
  if (minutes >= 45) {
    blocks.push({
      id: blockId("break", 0),
      kind: "break",
      title: "Stand up and drop the arms",
      minutes: 2,
      intent: "Two minutes upright with the arms hanging buys back more than it costs: fatigue is what turns clean work into sloppy repetitions.",
      steps: [
        "Stand up. Let the arms hang and shake them out.",
        "Roll the shoulders back, unclench the jaw, look out of a window.",
        "Sit back down and check the left-hand thumb is not already gripping before you play a note.",
      ],
      success: "The next block starts with a loose hand.",
    });
  }

  // 4. Repertoire blocks
  let remaining = repertoireBudget;
  const repBlocks: Block[] = [];
  const scheduled = input.schedule.slice(0, 3);
  scheduled.forEach((item, i) => {
    if (remaining < 4) return;
    let method = methodFor(item.piece.status, item.passIndex, phase);
    if (method.longOnly && minutes < 45) method = shorterAlternative(item.piece.status, item.passIndex, phase);
    const wanted = clamp(PASS_MINUTES[item.piece.status], method.minutes[0], method.minutes[1]);
    const reserve = 5 * Math.max(0, scheduled.length - i - 1);
    const blockMinutes = clamp(Math.min(wanted, remaining - reserve), 4, Math.max(4, remaining));
    remaining -= blockMinutes;
    const isLast = i === scheduled.length - 1;
    repBlocks.push(
      repBlock(item.piece, method, blockMinutes, dateKey, repBlocks.length, isLast && scheduled.length > 1),
    );
  });

  // One piece and a big budget: split the time across two or three different
  // methods rather than grinding one task for twenty minutes. The variety inside
  // a session is the point — each pass asks something different of the piece.
  if (scheduled.length === 1 && minutes >= 25) {
    const item = scheduled[0];
    let extras = 0;
    while (remaining >= 6 && repBlocks.length < 3 && extras < 4) {
      extras += 1;
      let method = methodFor(item.piece.status, item.passIndex + extras, phase);
      if (method.longOnly && minutes < 45) {
        method = shorterAlternative(item.piece.status, item.passIndex + extras, phase);
      }
      if (repBlocks.some((b) => b.methodId === method.id)) continue;
      const blockMinutes = clamp(Math.min(PASS_MINUTES[item.piece.status], remaining - 2), 5, 12);
      remaining -= blockMinutes;
      repBlocks.push(          repBlock(item.piece, method, blockMinutes, dateKey, repBlocks.length, false),
      );
    }
  }

  // 5. Mental practice, free of hand load, when there is room for it.
  const hasMemoryBlock = repBlocks.some((b) => b.methodId === "memory");
  if (minutes >= 45 && !hasMemoryBlock) {
    const target = scheduled.find((s) => s.piece.status === "memorising" || s.piece.status === "polishing") ?? scheduled[0];
    if (target && remaining >= 4) {
      const memTechnique = getTechnique("memory");
      const prescription = memTechnique?.prescriptions[1];
      const blockMinutes = clamp(remaining, 5, 8);
      remaining -= blockMinutes;
      repBlocks.push({
        id: blockId("memory", 0),
        kind: "memory",
        title: `At the table: ${target.piece.title}`,
        minutes: blockMinutes,
        intent: "Memory holds better when it is retrieved than when it is repeated, and mental practice costs the hands nothing.",
        steps: prescription?.steps ?? [
          "Put the guitar down and write one section of the piece out from memory.",
          "Check against the score in a different colour and correct it.",
        ],
        success: prescription?.success ?? "Fewer than three corrections.",
        pieceId: target.piece.id,
      });
    }
  }

  // 6. Interleave: order the repertoire work so the hardest is worked early and
  //    a run-through (if there is one) comes last.
  repBlocks.sort((a, b) => methodOrder(b.methodId) - methodOrder(a.methodId));
  const runThrough = repBlocks.filter((b) => b.methodId === "run");
  const others = repBlocks.filter((b) => b.methodId !== "run");
  const orderedRep: Block[] = [...interleave(others), ...runThrough];

  // 7. Assemble, spacing technique and repertoire work apart.
  const warm = blocks[0];
  const techniqueBlocks = blocks.filter((b) => b.kind === "technique");
  const brk = blocks.find((b) => b.kind === "break");
  const tail: Block[] = [];
  if (readingMinutes) {
    const reading = readingBlock(dateKey, readingMinutes, input.schedule.map((s) => s.piece.title));
    tail.push(reading);
  }
  blocks.length = 0;
  blocks.push(warm, ...interleave([...techniqueBlocks, ...orderedRep]));
  if (brk) blocks.splice(Math.ceil(blocks.length / 2), 0, brk);
  blocks.push(...tail);
  if (closeMinutes) {
    blocks.push({
      id: blockId("close", 0),
      kind: "close",
      title: "Log the numbers, then stop",
      minutes: closeMinutes,
      intent: "Tomorrow's plan is only as good as the numbers you leave tonight.",
      steps: [
        "Write down the tempo you reached on each ladder, and the tempo where it broke.",
        "Write one line about what is still unclear — that becomes tomorrow's first block.",
        "Stretch the forearms, shake out the hands, put the guitar down.",
      ],
      success: "Tomorrow starts from a number instead of a feeling.",
    });
  }

  // Tension work is always worth a mention, even when it is not a block.
  if (phase !== "performance") {
    notes.push("Ten-second scan before each block: shoulders, jaw, right thumb, left forearm.");
  } else {
    notes.push("Performance week: no new tempo targets, no rebuilding. Run-throughs, memory checks and small fixes.");
  }
  if (minutes < 20) {
    notes.push("Short day: only the highest-value work survived. Keep the warm-up inside three minutes and do not add anything.");
  }
  if (!input.schedule.length) {
    notes.push("No pieces on the plan yet — add one in Pieces and repertoire work will fill these minutes.");
  }

  // Make the blocks add up to exactly the session length: warm-up, blocks and the
  // closing log all live inside the minutes the player actually has.
  const lasting = blocks.filter((b) => b.kind !== "close" && b.kind !== "break");
  const spent = blocks.reduce((sum, b) => sum + b.minutes, 0);
  let drift = minutes - spent;
  if (drift > 0 && lasting.length) {
    // Spread any leftover a minute at a time, so no single block becomes a grind.
    let index = 0;
    let guard = 0;
    while (drift > 0 && guard < 400) {
      lasting[index % lasting.length].minutes += 1;
      drift -= 1;
      index += 1;
      guard += 1;
    }
  } else if (drift < 0 && lasting.length) {
    // Blocks cannot shrink below three minutes; take the difference off the longest.
    for (const block of [...lasting].sort((a, b) => b.minutes - a.minutes)) {
      if (drift === 0) break;
      const take = Math.min(block.minutes - 3, -drift);
      if (take > 0) {
        block.minutes -= take;
        drift += take;
      }
    }
  }

  const totals: SessionTotals = lasting.reduce<SessionTotals>(
    (acc, b) => {
      if (b.kind === "technique") acc.technique += b.minutes;
      else if (b.kind === "repertoire" || b.kind === "memory" || b.kind === "performance") acc.repertoire += b.minutes;
      else if (b.kind === "reading") acc.reading += b.minutes;
      else acc.other += b.minutes;
      return acc;
    },
    { technique: 0, repertoire: 0, reading: 0, other: 0 },
  );

  const headline = buildHeadline(
    blocks,
    minutes,
    input.schedule.map((s) => s.piece.title),
    input.focusPiece && input.schedule.some((s) => s.piece.id === input.focusPiece?.id) ? input.focusPiece.title : undefined,
  );

  return { minutes, phase, headline, blocks, totals, notes: dedupe(notes).slice(0, 3) };
}

function roundRobin(index: number, length: number): number {
  if (length <= 0) return 0;
  return index % length;
}

function dedupe(list: string[]): string[] {
  return Array.from(new Set(list));
}

function interleave(list: Block[]): Block[] {
  if (list.length <= 2) return list;
  const first: Block[] = [];
  const second: Block[] = [];
  list.forEach((b, i) => (i % 2 === 0 ? first : second).push(b));
  return [...first, ...second];
}

function methodOrder(id?: string): number {
  if (!id) return 0;
  if (id === "run") return 3;
  if (id === "record") return 2;
  if (id === "maintain") return 1;
  return 0;
}

function shorterAlternative(status: RepStatus, passIndex: number, phase: Phase): RepMethod {
  for (let i = 0; i < 6; i++) {
    const candidate = methodFor(status, passIndex + i, phase);
    if (!candidate.longOnly) return candidate;
  }
  return methodFor(status, passIndex, phase);
}

function repBlock(
  piece: Piece,
  method: RepMethod,
  minutes: number,
  dateKey: string,
  index: number,
  optional: boolean,
): Block {
  return {
    id: `${dateKey}-rep-${index}`,
    kind: "repertoire",
    title: `${method.verb}: ${piece.title}`,
    minutes,
    intent: method.intent,
    steps: method.steps,
    tempo: method.tempo,
    success: method.success,
    pieceId: piece.id,
    methodId: method.id,
    optional,
  };
}

function readingBlock(dateKey: string, minutes: number, titles: string[]): Block {
  const reading = getTechnique("reading");
  const prescription = reading?.prescriptions[0];
  return {
    id: `${dateKey}-reading-0`,
    kind: "reading",
    title: "Sight-reading, no stops",
    minutes,
    intent: reading?.short ?? "Reading is a separate skill and it needs easy, unfamiliar material.",
    steps: prescription?.steps ?? [
      "Take a page two levels below your playing level.",
      "Scan for fifteen seconds, then read it through without stopping.",
    ],
    tempo: prescription?.tempo,
    success: prescription?.success ?? "You reached the end without stopping.",
    techniqueId: "reading",
    prescriptionId: prescription?.id,
    optional: titles.length > 1,
  };
}

function buildHeadline(blocks: Block[], minutes: number, pieceTitles: string[], focusTitle?: string): string {
  const techniques = blocks.filter((b) => b.kind === "technique");
  const label = (title: string) => title.split(":")[0].split("&")[0].trim();
  const techniquePart = techniques.map((t) => label(t.title).toLowerCase()).join(" + ");
  const pieces = focusTitle
    ? [focusTitle, ...pieceTitles.filter((title) => title !== focusTitle)].slice(0, 2).join(" and ")
    : pieceTitles.slice(0, 2).join(" and ");
  const parts = [techniquePart, pieces].filter(Boolean);
  const body = parts.length ? parts.join(", then ") : "technical maintenance";
  return `${minutes} minutes: ${body}`;
}

/* ------------------------------------------------------------ week planner */

export interface WeekInput {
  profile: Profile;
  pieces: Piece[];
  log: LogEntry[];
  weekStartKey?: string;
}

export function currentPhase(profile: Profile, reference = todayKey()): { phase: Phase; weeksToGoal?: number; daysToGoal?: number } {
  if (profile.goal?.date) {
    const daysToGoal = daysBetween(reference, profile.goal.date);
    if (daysToGoal >= 0) {
      if (daysToGoal <= 7) return { phase: "performance", daysToGoal, weeksToGoal: 0 };
      if (daysToGoal <= 28) return { phase: "consolidation", daysToGoal, weeksToGoal: Math.round(daysToGoal / 7) };
    }
  }
  const created = profile.createdAt || reference;
  const weeks = Math.max(0, Math.floor(daysBetween(created, reference) / 7));
  const phase: Phase = weeks % 4 === 3 ? "deload" : "foundation";
  return { phase };
}

export function buildWeek(input: WeekInput): WeekPlan {
  const { profile } = input;
  const reference = todayKey();
  const weekStart = startOfWeek(new Date());
  const startKey = input.weekStartKey ?? toKey(weekStart);
  const { phase, daysToGoal, weeksToGoal } = currentPhase(profile, reference);

  const days: { key: string; weekday: number; minutes: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const key = addDaysKey(startKey, i);
    const weekday = fromKey(key).getDay();
    const isPracticeDay = profile.days.includes(weekday);
    const override = profile.dayMinutes[String(weekday)];
    const minutes = override ?? profile.minutes;
    if (isPracticeDay) days.push({ key, weekday, minutes });
  }

  const weeklyMinutes = days.reduce((sum, d) => sum + d.minutes, 0);
  const passPlan = distributePasses(profile, input.pieces, days.length, weeklyMinutes, phase, reference);

  // Spread each piece's passes across the week with gaps between them.
  const scheduled: Record<string, { piece: Piece; passIndex: number }[]> = {};
  days.forEach((d) => (scheduled[d.key] = []));
  const passCounters: Record<string, number> = {};
  input.pieces.forEach((piece, pieceIndex) => {
    const passes = passPlan[piece.id] ?? 0;
    if (!passes || !days.length) return;
    const offset = pieceIndex % days.length;
    const used: number[] = [];
    for (let k = 0; k < passes; k++) {
      let idx = Math.round((k * days.length) / passes + offset) % days.length;
      let guard = 0;
      while (used.includes(idx) && guard < days.length) {
        idx = (idx + 1) % days.length;
        guard++;
      }
      used.push(idx);
      const dayKey = days[idx].key;
      const passIndex = passCounters[piece.id] ?? 0;
      passCounters[piece.id] = passIndex + 1;
      scheduled[dayKey].push({ piece, passIndex });
    }
  });

  // Reading days: only days long enough to hold a read-through, spaced out.
  const readingEligible = days.filter((d) => d.minutes >= 35).map((d) => d.key);
  const readingDays = new Set(readingEligible.filter((_, i) => i % 2 === 0).slice(0, 3));

  const rotation = newRotationState(input.log);
  const dayPlans: DayPlan[] = [];
  for (let i = 0; i < 7; i++) {
    const key = addDaysKey(startKey, i);
    const weekday = fromKey(key).getDay();
    const day = days.find((d) => d.key === key);
    if (!day) {
      dayPlans.push({ date: key, weekday, kind: "rest", minutes: 0, schedule: [], load: 0 });
      continue;
    }
    const list = scheduled[key] ?? [];
    list.sort(
      (a, b) => urgency(b.piece, phase, reference, profile.focusPieceId) - urgency(a.piece, phase, reference, profile.focusPieceId),
    );
    const session = buildSession({
      dateKey: key,
      weekday,
      minutes: day.minutes,
      profile,
      schedule: list,
      phase,
      rotation,
      includeReading: readingDays.has(key),
      daysToGoal,
      focusPiece: input.pieces.find((p) => p.id === profile.focusPieceId),
      pieces: input.pieces,
    });
    const load = session.blocks
      .filter((b) => b.kind === "technique" && b.highLoad)
      .reduce((sum, b) => sum + b.minutes, 0);
    dayPlans.push({
      date: key,
      weekday,
      kind: day.minutes <= 25 ? "light" : "practice",
      minutes: session.minutes,
      session,
      schedule: list.map((s) => ({ pieceId: s.piece.id, passIndex: s.passIndex })),
      load,
    });
  }

  const coverageMap = new Map<string, { techniqueId: string; name: string; blocks: number; minutes: number }>();
  const pieceMap = new Map<
    string,
    { pieceId: string; title: string; passes: number; minutes: number; methods: MethodId[]; days: Set<string> }
  >();
  for (const d of dayPlans) {
    if (!d.session) continue;
    for (const b of d.session.blocks) {
      if (b.techniqueId && (b.kind === "technique" || b.kind === "reading")) {
        const current = coverageMap.get(b.techniqueId) ?? { techniqueId: b.techniqueId, name: b.title, blocks: 0, minutes: 0 };
        current.blocks += 1;
        current.minutes += b.minutes;
        coverageMap.set(b.techniqueId, current);
      }
      if (b.pieceId && (b.kind === "repertoire" || b.kind === "memory")) {
        const piece = input.pieces.find((p) => p.id === b.pieceId);
        const current = pieceMap.get(b.pieceId) ?? {
          pieceId: b.pieceId,
          title: piece?.title ?? "Piece",
          passes: 0,
          minutes: 0,
          methods: [] as MethodId[],
          days: new Set<string>(),
        };
        if (b.kind === "repertoire") current.passes += 1;
        current.minutes += b.minutes;
        current.days.add(d.date);
        if (b.methodId && !current.methods.includes(b.methodId)) current.methods.push(b.methodId);
        pieceMap.set(b.pieceId, current);
      }
    }
  }

  const totals = dayPlans.reduce(
    (acc, d) => {
      if (!d.session) return acc;
      acc.minutes += d.session.minutes;
      acc.technique += d.session.totals.technique;
      acc.repertoire += d.session.totals.repertoire;
      acc.reading += d.session.totals.reading;
      return acc;
    },
    { minutes: 0, technique: 0, repertoire: 0, reading: 0 },
  );

  const warnings = buildWarnings({
    profile,
    phase,
    dayPlans,
    coverage: [...coverageMap.values()],
    pieces: input.pieces,
    log: input.log,
    practiceDayCount: days.length,
    weeklyMinutes,
    reference,
  });

  return {
    days: dayPlans,
    phase,
    weeksToGoal,
    totals,
    warnings,
    coverage: [...coverageMap.values()].sort((a, b) => b.minutes - a.minutes),
    pieces: [...pieceMap.values()]
      .map((entry) => ({ ...entry, days: entry.days.size }))
      .sort((a, b) => b.minutes - a.minutes),
  };
}

/* --------------------------------------------------------- ad-hoc sessions */

/** Pieces in the order the plan should work them. */
export function orderPieces(pieces: Piece[], phase: Phase, reference = todayKey(), focusId?: string): Piece[] {
  return [...pieces].sort((a, b) => urgency(b, phase, reference, focusId) - urgency(a, phase, reference, focusId));
}

/**
 * A session built on the spot for the time someone actually has right now — the
 * "I have twenty-five minutes, what is worth doing?" button.
 */
export function adHocSession(args: {
  dateKey: string;
  minutes: number;
  profile: Profile;
  pieces: Piece[];
  log: LogEntry[];
  schedule?: { piece: Piece; passIndex: number }[];
}): Session {
  const { phase, daysToGoal } = currentPhase(args.profile, args.dateKey);
  const focusPiece = args.pieces.find((p) => p.id === args.profile.focusPieceId);
  const schedule =
    args.schedule ??
    orderPieces(args.pieces, phase, args.dateKey, args.profile.focusPieceId)
      .slice(0, 3)
      .map((piece) => ({ piece, passIndex: 0 }));
  return buildSession({
    dateKey: args.dateKey,
    weekday: fromKey(args.dateKey).getDay(),
    minutes: args.minutes,
    profile: args.profile,
    schedule,
    phase,
    rotation: newRotationState(args.log),
    includeReading: args.minutes >= 40,
    daysToGoal,
    focusPiece,
    pieces: args.pieces,
  });
}

/* ------------------------------------------------------- pass distribution */

function urgency(piece: Piece, phase: Phase, reference: string, focusId?: string): number {
  let score = PASS_WEIGHT[piece.status] * 2 + (4 - piece.priority) * 2;
  // The piece the plan is built around leads every list it appears in.
  if (focusId && piece.id === focusId) score += 14;
  if (piece.target) {
    const days = daysBetween(reference, piece.target);
    if (days >= 0 && days <= 45) score += Math.max(0, 12 - days / 3);
    if (days < 0) score -= 3;
  }
  if (phase === "performance") {
    if (piece.priority === 1) score += 6;
    if (piece.status === "maintenance") score -= 12;
  }
  return score;
}

function distributePasses(
  profile: Profile,
  pieces: Piece[],
  practiceDays: number,
  weeklyMinutes: number,
  phase: Phase,
  reference: string,
): Record<string, number> {
  const result: Record<string, number> = {};
  if (!pieces.length || !practiceDays) return result;

  const focusId = profile.focusPieceId;
  const ordered = [...pieces].sort(
    (a, b) => urgency(b, phase, reference, focusId) - urgency(a, phase, reference, focusId),
  );

  for (const piece of ordered) {
    let passes = loadStatusPasses(piece.status);
    if (phase === "performance") {
      passes = piece.status === "maintenance" ? 0 : Math.min(passes, 4);
      if (piece.priority === 1 && piece.status !== "maintenance") passes = Math.max(passes, 4);
    }
    if (dailyCeiling(profile, weeklyMinutes) < 30 && piece.status === "maintenance") passes = Math.min(passes, 1);
    if (piece.id === focusId) {
      // Short, frequent passes are how a piece you care about actually gets learned.
      const target = piece.status === "maintenance" ? 3 : 5;
      passes = Math.min(practiceDays, Math.max(passes + 1, target));
      if (phase === "performance") passes = Math.min(passes, 4);
    }
    result[piece.id] = passes;
  }

  const techniqueShare = TECHNIQUE_SHARE[profile.level] * PHASE_TECHNIQUE_FACTOR[phase];
  const repertoireBudget = Math.round(weeklyMinutes * (1 - techniqueShare) * 0.95);
  const cost = () =>
    ordered.reduce((sum, p) => {
      const statusPasses = PASS_MINUTES[p.status];
      return sum + (result[p.id] ?? 0) * statusPasses;
    }, 0);

  // Trim from the least urgent piece upwards until the week fits.
  const trimOrder = [...ordered].reverse();
  let guard = 0;
  while (cost() > repertoireBudget && guard < 60) {
    guard++;
    let trimmed = false;
    for (const piece of trimOrder) {
      // Everything else gives up minutes before the piece the plan is built around.
      if (piece.id === focusId && trimOrder.length > 1) continue;
      const current = result[piece.id] ?? 0;
      const minimum = piece.priority === 1 && piece.status !== "maintenance" ? 2 : 0;
      if (current > minimum) {
        result[piece.id] = current - 1;
        trimmed = true;
        break;
      }
    }
    if (!trimmed) break;
  }

  // If the week has room to spare, deepen the work — but never in a performance
  // week, where the point is to hold what exists rather than to build.
  guard = 0;
  while (phase !== "performance" && cost() < repertoireBudget * 0.75 && guard < 40) {
    guard++;
    let bumped = false;
    for (const piece of [...ordered].sort((a, b) => Number(b.id === focusId) - Number(a.id === focusId))) {
      if (piece.status === "maintenance" || piece.priority === 3) continue;
      const current = result[piece.id] ?? 0;
      if (current < 6 && current < practiceDays) {
        result[piece.id] = current + 1;
        bumped = true;
        break;
      }
    }
    if (!bumped) break;
  }

  // A piece cannot be worked more often than there are practice days, unless the
  // day is long enough to hold two passes — and a performance week leaves each
  // piece at least one day of rest.
  for (const piece of ordered) {
    const ceiling = dailyCeiling(profile, weeklyMinutes) >= 60 ? practiceDays + 1 : practiceDays;
    const cap = phase === "performance" ? Math.min(ceiling, 4) : ceiling;
    result[piece.id] = Math.min(result[piece.id] ?? 0, cap);
  }
  return result;
}

function dailyCeiling(profile: Profile, weeklyMinutes: number): number {
  const practiceDays = profile.days.length || 1;
  return Math.round(weeklyMinutes / practiceDays);
}

/* --------------------------------------------------------------- warnings */

function buildWarnings(args: {
  profile: Profile;
  phase: Phase;
  dayPlans: DayPlan[];
  coverage: { techniqueId: string; name: string; blocks: number; minutes: number }[];
  pieces: Piece[];
  log: LogEntry[];
  practiceDayCount: number;
  weeklyMinutes: number;
  reference: string;
}): string[] {
  const { profile, phase, dayPlans, coverage, pieces, log, practiceDayCount, weeklyMinutes, reference } = args;
  const warnings: string[] = [];

  // Hand load: two loaded days in a row is where injuries start.
  const loaded = dayPlans.filter((d) => d.load >= 10);
  for (let i = 1; i < loaded.length; i++) {
    const previous = loaded[i - 1];
    const current = loaded[i];
    if (daysBetween(previous.date, current.date) === 1) {
      warnings.push(
        `${shortDate(previous.date)} and ${shortDate(current.date)} are both loaded days (${previous.load} and ${current.load} minutes of barre, slurs, tremolo or speed work). Move one of them, or halve the second.`,
      );
      break;
    }
  }
  if (profile.protectHands && dayPlans.some((d) => d.load > 18)) {
    warnings.push("With hand protection on, loaded work is capped at about three quarters of its usual dose. Loaded minutes are still high this week — consider cutting one block.");
  }

  // Coverage of the stated weaknesses.
  const focuses = profile.focuses.length ? profile.focuses : DEFAULT_FOCUSES[profile.level];
  const covered = new Set(coverage.map((c) => c.techniqueId));
  const missing = focuses.filter((id) => !covered.has(id)).map((id) => getTechnique(id)?.name ?? id);
  if (missing.length) {
    warnings.push(
      missing.length === 1
        ? `${missing[0]} gets no block this week — every session is shorter than that work needs. Either one day goes longer, or it stays a weakness.`
        : `${missing.join(", ")} get no block this week. Give at least one day 45 minutes or more.`,
    );
  }

  // Repertoire that is quietly going stale.
  const touched: Record<string, string> = {};
  for (const entry of log) {
    for (const b of entry.blocks) {
      if (b.pieceId && (!touched[b.pieceId] || entry.date > touched[b.pieceId])) touched[b.pieceId] = entry.date;
    }
  }
  const stale = pieces.filter((p) => {
    const last = touched[p.id];
    if (!last) return false;
    return daysBetween(last, reference) >= 14 && p.status !== "maintenance";
  });
  if (stale.length) {
    warnings.push(`${stale.map((p) => p.title).join(", ")} has not been touched in over two weeks. Its state on the plan still assumes otherwise.`);
  }

  if (practiceDayCount <= 2) {
    warnings.push("Two practice days or fewer: the plan concentrates on the highest-value work and accepts that some things get no attention this week.");
  }
  if (!coverage.some((c) => c.techniqueId === "reading")) {
    warnings.push(
      minutesAllows(dayPlans, 35)
        ? "No sight-reading this week, though there is a day long enough to hold it. Reading only grows on regular unfamiliar pages."
        : "No sight-reading: no practice day this week reaches 35 minutes, and reading needs a settled block. Either one day goes longer, or read a page instead of a technique block once a week.",
    );
  }
  if (weeklyMinutes >= 60 && coverage.length <= 1) {
    warnings.push("Only one technique area is covered all week. Rotating two or three keeps the boredom (and the injuries) away.");
  }
  if (phase === "performance") {
    warnings.push("Performance week: the plan strips technique development and protects consistency. Play it through, do not rebuild it.");
  }
  return warnings;
}

function minutesAllows(dayPlans: DayPlan[], threshold: number): boolean {
  return dayPlans.some((d) => d.minutes >= threshold);
}
