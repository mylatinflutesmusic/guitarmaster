/**
 * Core domain types for Cuerda.
 *
 * The app has three ideas at its centre:
 *  1. a library of classical-guitar technique work, each entry carrying *why* it is
 *     effective, how to do it, and one or more concrete prescriptions;
 *  2. a repertoire list, where each piece is worked with a rotating practice method;
 *  3. a planner that packs (1) and (2) into the minutes the player actually has,
 *     across the week, without overloading the hands.
 */

export type Level = "beginner" | "intermediate" | "advanced" | "conservatoire";

export const LEVELS: { id: Level; label: string; blurb: string; years: string }[] = [
  {
    id: "beginner",
    label: "Beginner",
    blurb: "First two years. Reading the fretboard, first studies and simple pieces.",
    years: "0–2 years",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    blurb: "Comfortable with Sor and Carcassi studies, position work, barres.",
    years: "2–5 years",
  },
  {
    id: "advanced",
    label: "Advanced",
    blurb: "Grade 6–8 repertoire, tremolo and Bach, playing from memory.",
    years: "5–10 years",
  },
  {
    id: "conservatoire",
    label: "Conservatoire / professional",
    blurb: "Recital-level repertoire. Technique is largely maintenance.",
    years: "10+ years",
  },
];

export const LEVEL_ORDER: Level[] = ["beginner", "intermediate", "advanced", "conservatoire"];

export function levelAtLeast(level: Level, min: Level): boolean {
  return LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(min);
}

export type Category =
  | "warmup"
  | "scales"
  | "arpeggios"
  | "slurs"
  | "barre"
  | "tremolo"
  | "shifts"
  | "tone"
  | "rhythm"
  | "reading"
  | "memory"
  | "tension"
  | "phrasing";

/** One concrete, do-it-tonight exercise for a technique. */
export interface Prescription {
  id: string;
  name: string;
  aim: string;
  steps: string[];
  minutes: number;
  tempo?: string;
  success: string;
}

/** A technique / skill area: the "what to work on" half of the plan. */
export interface Technique {
  id: string;
  name: string;
  category: Category;
  minLevel: Level;
  /** One line for the plan itself: why this earns its minutes. */
  short: string;
  /** The pedagogy behind it. */
  why: string;
  how: string[];
  materials: string[];
  /** Physically loading work — barre, tremolo, slurs, stretches, long repetitions. */
  highLoad: boolean;
  /** Minutes per session this work is worth, before the plan adapts it. */
  dose: [number, number];
  prescriptions: Prescription[];
  /** When present, this technique appears in the "what limits you?" picker. */
  focusLabel?: string;
  focusHint?: string;
  /** Relative value when the player has almost no time. 3 = do it even in 15 minutes. */
  priority: 1 | 2 | 3;
}

export type RepStatus = "new" | "learning" | "memorising" | "polishing" | "maintenance";

export const REP_STATUSES: { id: RepStatus; label: string; blurb: string; passes: number }[] = [
  { id: "new", label: "Just started", blurb: "Reading through it, finding the shape.", passes: 3 },
  { id: "learning", label: "Learning", blurb: "Sections by slow practice, still assembling.", passes: 3 },
  { id: "memorising", label: "Memorising", blurb: "Getting it off the page and into memory.", passes: 4 },
  { id: "polishing", label: "Polishing", blurb: "Playable end to end, working on quality and tempo.", passes: 4 },
  { id: "maintenance", label: "Maintenance", blurb: "Learned. Kept alive with light passes.", passes: 1 },
];

export interface Piece {
  id: string;
  title: string;
  composer: string;
  status: RepStatus;
  /** 1 = the piece that matters most right now. */
  priority: 1 | 2 | 3;
  /** Optional date this piece must be ready (audition, exam, recital). */
  target?: string;
  /**
   * What this piece demands technically (technique ids). Technique blocks are
   * drawn towards these, so the plan is built around the piece, not beside it.
   */
  demands?: string[];
}

/**
 * How a piece is worked in a given session. Rotating through this cycle is the
 * single most effective thing most players can change: it forces slow, specific,
 * goal-directed work instead of running the piece from the top and hoping.
 */
export type MethodId =
  | "fix"
  | "slow"
  | "ladder"
  | "join"
  | "memory"
  | "record"
  | "run"
  | "maintain";

export interface RepMethod {
  id: MethodId;
  name: string;
  /** Short verb for the plan line. */
  verb: string;
  intent: string;
  steps: string[];
  minutes: [number, number];
  tempo?: string;
  success: string;
  /** Which piece states this method suits. */
  goodFor: RepStatus[];
  /** Relative position in the rotation, low first. */
  order: number;
  /** Not useful in a very short session. */
  longOnly?: boolean;
}

export type BlockKind =
  | "warmup"
  | "technique"
  | "repertoire"
  | "reading"
  | "memory"
  | "performance"
  | "break"
  | "close";

export interface Block {
  id: string;
  kind: BlockKind;
  title: string;
  minutes: number;
  intent: string;
  steps: string[];
  tempo?: string;
  success: string;
  techniqueId?: string;
  pieceId?: string;
  methodId?: MethodId;
  prescriptionId?: string;
  highLoad?: boolean;
  /** Shed these first when the day shrinks. */
  optional?: boolean;
}

export interface SessionTotals {
  technique: number;
  repertoire: number;
  reading: number;
  other: number;
}

export type Phase = "foundation" | "consolidation" | "performance" | "deload";

export const PHASES: Record<Phase, { label: string; blurb: string }> = {
  foundation: {
    label: "Foundation",
    blurb: "Time to build. The largest share of minutes goes to technique and new material.",
  },
  consolidation: {
    label: "Consolidation",
    blurb: "Repertoire leads. Technique is kept ticking, run-throughs and recording increase.",
  },
  performance: {
    label: "Performance week",
    blurb: "No rebuilding. Run-throughs, targeted fixes, memory checks and a taper.",
  },
  deload: {
    label: "Consolidation week",
    blurb: "Every fourth week is lighter: fewer tempo targets, more listening and retention.",
  },
};

export interface Session {
  minutes: number;
  phase: Phase;
  headline: string;
  blocks: Block[];
  totals: SessionTotals;
  notes: string[];
}

export interface DayPlan {
  date: string;
  /** Sunday = 0, matching Date.getDay(). */
  weekday: number;
  kind: "practice" | "light" | "rest";
  minutes: number;
  session?: Session;
  /** Pieces scheduled for this day, so a session can be rebuilt at a new length. */
  schedule: { pieceId: string; passIndex: number }[];
  load: number;
}

export interface WeekPlan {
  days: DayPlan[];
  phase: Phase;
  weeksToGoal?: number;
  totals: { minutes: number; technique: number; repertoire: number; reading: number };
  warnings: string[];
  coverage: { techniqueId: string; name: string; blocks: number; minutes: number }[];
  pieces: { pieceId: string; title: string; passes: number; days: number; minutes: number; methods: MethodId[] }[];
}

export interface Profile {
  onboarded: boolean;
  level: Level;
  /** Default practice-day length in minutes. */
  minutes: number;
  /** Weekdays that get practice. */
  days: number[];
  /** Optional shorter length for specific weekdays. */
  dayMinutes: Record<string, number>;
  /** Limiting areas, most limiting first. */
  focuses: string[];
  goal?: { label: string; date: string };
  /** Hand-load ceiling the player wants enforced. */
  protectHands: boolean;
  /** The piece the whole plan is built around, if the player has named one. */
  focusPieceId?: string;
  /** Which first-run tour has been seen (or skipped); older tours are below this. */
  tourVersion?: number;
  /** Day the last full backup was exported. */
  lastBackupAt?: string;
  /** Reminder hidden until this day, so it does not nag on every session. */
  backupSnoozedUntil?: string;
  createdAt: string;
}

export interface LoggedBlock {
  blockId: string;
  kind: BlockKind;
  title: string;
  minutes: number;
  techniqueId?: string;
  pieceId?: string;
  methodId?: MethodId;
}

export interface LogEntry {
  id: string;
  date: string;
  minutes: number;
  plannedMinutes: number;
  phase: Phase;
  blocks: LoggedBlock[];
  note?: string;
}

/** A tempo the player actually reached — the honest measure of technical progress. */
export interface TempoMark {
  id: string;
  date: string;
  /** Technique id or piece id. */
  subjectId: string;
  subjectName: string;
  bpm: number;
  unit?: string;
}

export interface AppState {
  version: number;
  profile: Profile;
  pieces: Piece[];
  log: LogEntry[];
  tempos: TempoMark[];
}
