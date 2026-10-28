import { describe, expect, it } from "vitest";
import { adHocSession, buildSession, buildWeek, currentPhase, newRotationState, orderPieces } from "./plan";
import type { SessionInput } from "./plan";
import type { LogEntry, LoggedBlock, Piece, Profile } from "../types";

const profile = (over: Partial<Profile> = {}): Profile => ({
  onboarded: true,
  level: "intermediate",
  minutes: 30,
  days: [1, 2, 4, 5, 6],
  dayMinutes: {},
  focuses: ["arpeggios", "scales"],
  protectHands: true,
  createdAt: "2026-01-01",
  ...over,
});

const piece = (id: string, over: Partial<Piece> = {}): Piece => ({
  id,
  title: `Piece ${id}`,
  composer: "Anon.",
  status: "learning",
  priority: 2,
  ...over,
});

const scheduled = (...pieces: Piece[]) => pieces.map((p) => ({ piece: p, passIndex: 0 }));

const session = (minutes: number, pieces: Piece[], over: Partial<SessionInput> = {}) =>
  buildSession({
    dateKey: "2026-10-26",
    weekday: 1,
    minutes,
    profile: profile(),
    schedule: scheduled(...pieces),
    phase: "foundation",
    rotation: newRotationState([]),
    includeReading: false,
    ...over,
  });

const totalMinutes = (blocks: { minutes: number }[]) => blocks.reduce((sum, block) => sum + block.minutes, 0);

describe("buildSession", () => {
  it("opens with a warm-up and fits exactly the minutes available", () => {
    const result = session(45, [piece("a"), piece("b")]);

    expect(result.blocks[0].kind).toBe("warmup");
    expect(totalMinutes(result.blocks)).toBe(45);
    expect(result.minutes).toBe(45);
    expect(result.blocks[result.blocks.length - 1].kind).toBe("close");
  });

  it("puts technique work before the repertoire it is meant to serve", () => {
    const result = session(45, [piece("a"), piece("b")]);
    const firstTechnique = result.blocks.findIndex((block) => block.kind === "technique");
    const firstRepertoire = result.blocks.findIndex((block) => block.kind === "repertoire");

    expect(firstTechnique).toBeGreaterThan(0);
    expect(firstRepertoire).toBeGreaterThan(firstTechnique);
  });

  it("still produces usable blocks in a fifteen-minute session", () => {
    const result = session(15, [piece("a")]);

    expect(totalMinutes(result.blocks)).toBe(15);
    expect(result.blocks.length).toBeGreaterThan(1);
    expect(result.blocks.every((block) => block.minutes >= 3)).toBe(true);
    expect(result.blocks.some((block) => block.kind === "technique")).toBe(true);
  });

  it("taper the last days before a performance", () => {
    const result = buildSession({
      dateKey: "2026-10-26",
      weekday: 1,
      minutes: 40,
      profile: profile(),
      schedule: scheduled(piece("a", { status: "polishing" })),
      phase: "performance",
      rotation: newRotationState([]),
      includeReading: false,
      daysToGoal: 1,
    });

    expect(result.minutes).toBe(28);
    expect(totalMinutes(result.blocks)).toBe(28);
    expect(result.notes.join(" ")).toMatch(/taper/i);
  });

  it("fills the session with technique when there is no repertoire", () => {
    const result = session(30, []);

    expect(result.blocks.some((block) => block.kind === "repertoire")).toBe(false);
    expect(result.totals.repertoire).toBe(0);
    expect(result.totals.technique).toBeGreaterThan(0);
    expect(result.notes.join(" ")).toMatch(/No pieces on the plan yet/);
    expect(totalMinutes(result.blocks)).toBe(30);
  });

  it("does not schedule the same loaded technique on consecutive days", () => {
    const rotation = newRotationState([]);
    const loaded = profile({ focuses: ["tremolo", "scales"] });
    const day = (dateKey: string) =>
      buildSession({
        dateKey,
        weekday: 1,
        minutes: 45,
        profile: loaded,
        schedule: scheduled(piece("a")),
        phase: "foundation",
        rotation,
        includeReading: false,
      });

    const first = day("2026-10-26");
    expect(first.blocks.some((block) => block.techniqueId === "tremolo")).toBe(true);

    const second = day("2026-10-27");
    expect(second.blocks.some((block) => block.techniqueId === "tremolo")).toBe(false);
  });

  it("totals only the work blocks, leaving the break and the closing log out", () => {
    const result = session(60, [piece("a")]);
    const overhead = result.blocks
      .filter((block) => block.kind === "break" || block.kind === "close")
      .reduce((sum, block) => sum + block.minutes, 0);
    const split =
      result.totals.technique + result.totals.repertoire + result.totals.reading + result.totals.other;

    expect(overhead).toBeGreaterThan(0);
    expect(split).toBe(60 - overhead);
  });
});

describe("currentPhase", () => {
  const reference = "2026-10-26";

  it("enters performance phase inside the last week", () => {
    const info = currentPhase(profile({ goal: { label: "Recital", date: "2026-10-31" } }), reference);
    expect(info.phase).toBe("performance");
    expect(info.daysToGoal).toBe(5);
  });

  it("uses consolidation phase in the month before a goal", () => {
    const info = currentPhase(profile({ goal: { label: "Exam", date: "2026-11-15" } }), reference);
    expect(info.phase).toBe("consolidation");
    expect(info.daysToGoal).toBe(20);
  });

  it("cycles foundation and deload every four weeks without a goal", () => {
    expect(currentPhase(profile({ createdAt: reference }), reference).phase).toBe("foundation");
    expect(currentPhase(profile({ createdAt: "2026-10-05" }), reference).phase).toBe("deload");
  });

  it("ignores a goal that has already passed", () => {
    const info = currentPhase(profile({ createdAt: reference, goal: { label: "Old", date: "2026-10-01" } }), reference);
    expect(info.phase).toBe("foundation");
    expect(info.daysToGoal).toBeUndefined();
  });
});

describe("buildWeek", () => {
  it("plans only the chosen weekdays and leaves the rest as rest days", () => {
    const week = buildWeek({ profile: profile({ days: [1, 3, 5] }), pieces: [piece("a")], log: [] });
    const practice = week.days.filter((day) => day.session);
    const rest = week.days.filter((day) => !day.session);

    expect(week.days).toHaveLength(7);
    expect(practice).toHaveLength(3);
    expect(rest.every((day) => day.kind === "rest" && day.minutes === 0)).toBe(true);
    expect(week.totals.minutes).toBe(practice.reduce((sum, day) => sum + (day.session?.minutes ?? 0), 0));
  });

  it("honours a shorter length set for one weekday", () => {
    const week = buildWeek({
      profile: profile({ days: [2, 3], minutes: 40, dayMinutes: { "3": 20 } }),
      pieces: [piece("a")],
      log: [],
    });

    const wednesday = week.days.find((day) => day.weekday === 3);
    const tuesday = week.days.find((day) => day.weekday === 2);

    expect(wednesday?.session?.minutes).toBe(20);
    expect(wednesday?.kind).toBe("light");
    expect(tuesday?.session?.minutes).toBe(40);
  });

  it("gives the focus piece more passes than the rest of the repertoire", () => {
    const focus = piece("focus", { priority: 2 });
    const other = piece("other", { priority: 1 });
    const week = buildWeek({ profile: profile({ focusPieceId: "focus", days: [1, 2, 4, 5, 6] }), pieces: [focus, other], log: [] });

    const focusEntry = week.pieces.find((entry) => entry.pieceId === "focus");
    const otherEntry = week.pieces.find((entry) => entry.pieceId === "other");

    expect(focusEntry?.passes).toBeGreaterThan(otherEntry?.passes ?? 0);
    expect(otherEntry?.passes).toBeGreaterThan(0);
    expect(focusEntry?.days).toBeGreaterThan(1);
  });

  it("schedules sight-reading when a day is long enough, and warns when none is", () => {
    const long = buildWeek({ profile: profile({ minutes: 45, days: [1, 2, 4, 5] }), pieces: [], log: [] });
    expect(long.coverage.some((entry) => entry.techniqueId === "reading")).toBe(true);
    expect(long.warnings.some((warning) => warning.startsWith("No sight-reading"))).toBe(false);

    const short = buildWeek({ profile: profile({ minutes: 25, days: [1, 2, 3, 4, 5] }), pieces: [], log: [] });
    expect(short.coverage.some((entry) => entry.techniqueId === "reading")).toBe(false);
    expect(short.warnings.some((warning) => warning.startsWith("No sight-reading"))).toBe(true);
  });
});

describe("ad-hoc sessions", () => {
  it("puts the focus piece first in the order pieces are worked", () => {
    const focus = piece("focus", { status: "maintenance" });
    const other = piece("other", { status: "polishing", priority: 1 });

    expect(orderPieces([other, focus], "foundation", "2026-10-26", "focus")[0].id).toBe("focus");
  });

  it("builds a repertoire session for the minutes available now", () => {
    const result = adHocSession({
      dateKey: "2026-10-26",
      minutes: 30,
      profile: profile({ focusPieceId: "focus" }),
      pieces: [piece("focus"), piece("other")],
      log: [],
    });

    expect(result.blocks.some((block) => block.kind === "repertoire")).toBe(true);
    expect(totalMinutes(result.blocks)).toBe(30);
    expect(result.headline).toMatch(/30 minutes/);
  });
});

describe("rotation state", () => {
  it("counts the passes and load already in the log", () => {
    const entry: LogEntry = {
      id: "log-1",
      date: "2026-10-25",
      minutes: 30,
      plannedMinutes: 30,
      phase: "foundation",
      blocks: [
        {
          blockId: "b1",
          kind: "technique",
          title: "Tremolo",
          minutes: 8,
          techniqueId: "tremolo",
        } satisfies LoggedBlock,
      ],
    };

    const rotation = newRotationState([entry]);
    expect(rotation.techniquePasses.tremolo).toBe(1);
    expect(rotation.lastHighLoad.tremolo).toBe("2026-10-25");
  });
});
