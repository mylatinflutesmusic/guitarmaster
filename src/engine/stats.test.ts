import { describe, expect, it } from "vitest";
import {
  daysSinceTouched,
  lastNDays,
  lastTouched,
  logStreak,
  splitMinutes,
  tempoChange,
  tempoSeries,
  weekMinutes,
} from "./stats";
import type { LogEntry, LoggedBlock, Piece, TempoMark } from "../types";

const block = (over: Partial<LoggedBlock> = {}): LoggedBlock => ({
  blockId: "block-1",
  kind: "repertoire",
  title: "Slow practice",
  minutes: 10,
  ...over,
});

const entry = (date: string, minutes: number, blocks: LoggedBlock[] = []): LogEntry => ({
  id: date,
  date,
  minutes,
  plannedMinutes: minutes,
  phase: "foundation",
  blocks,
});

const piece: Piece = { id: "p1", title: "Lagrima", composer: "Tárrega", status: "learning", priority: 2 };

const tempo = (id: string, date: string, bpm: number): TempoMark => ({
  id,
  date,
  subjectId: "p1",
  subjectName: "Lagrima",
  bpm,
});

const reference = "2026-10-26";

describe("logStreak", () => {
  it("counts consecutive days up to today", () => {
    const log = [entry("2026-10-26", 30), entry("2026-10-25", 30), entry("2026-10-24", 30)];
    expect(logStreak(log, reference)).toBe(3);
  });

  it("still counts a streak that ended yesterday", () => {
    expect(logStreak([entry("2026-10-25", 30), entry("2026-10-24", 30)], reference)).toBe(2);
  });

  it("returns zero once two days are missed", () => {
    expect(logStreak([entry("2026-10-24", 30)], reference)).toBe(0);
    expect(logStreak([], reference)).toBe(0);
  });
});

describe("weekMinutes", () => {
  it("sums only the entries inside the seven days from the start key", () => {
    const log = [
      entry("2026-10-18", 15),
      entry("2026-10-19", 20),
      entry("2026-10-25", 30),
      entry("2026-10-26", 40),
    ];
    expect(weekMinutes(log, "2026-10-19")).toBe(50);
  });
});

describe("practice history", () => {
  const log = [entry("2026-10-20", 30, [block({ pieceId: "p1" })]), entry("2026-10-24", 30, [block({ pieceId: "p1" })])];

  it("reports days since a piece was last touched", () => {
    expect(daysSinceTouched(piece, log, reference)).toBe(2);
    expect(daysSinceTouched({ ...piece, id: "never" }, log, reference)).toBeUndefined();
  });

  it("keeps the most recent date per piece", () => {
    expect(lastTouched(log)).toEqual({ p1: "2026-10-24" });
  });

  it("returns the last N days oldest first, including empty days", () => {
    const days = lastNDays(log, 3, reference);
    expect(days.map((day) => day.key)).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
    expect(days.map((day) => day.minutes)).toEqual([30, 0, 0]);
  });
});

describe("splitMinutes", () => {
  it("separates technique, repertoire, reading and other work", () => {
    const log = [
      entry("2026-10-25", 30, [
        block({ kind: "warmup", minutes: 5 }),
        block({ kind: "technique", minutes: 10 }),
        block({ kind: "repertoire", minutes: 12 }),
        block({ kind: "reading", minutes: 3 }),
      ]),
    ];

    const split = splitMinutes(log);
    expect(split).toMatchObject({ sessions: 1, minutes: 30, technique: 10, repertoire: 12, reading: 3, other: 5 });
  });

  it("can ignore entries before a given date", () => {
    const log = [entry("2026-10-01", 20), entry("2026-10-25", 30)];
    expect(splitMinutes(log, "2026-10-20").sessions).toBe(1);
  });
});

describe("tempo marks", () => {
  const marks = [tempo("t2", "2026-10-20", 96), tempo("t1", "2026-10-01", 72), tempo("t3", "2026-10-25", 104)];

  it("reads a piece's marks in date order", () => {
    expect(tempoSeries(marks, "p1").map((mark) => mark.bpm)).toEqual([72, 96, 104]);
  });

  it("reports the change from the first mark to the latest", () => {
    expect(tempoChange(marks, "p1")).toBe(32);
    expect(tempoChange([tempo("only", "2026-10-01", 80)], "p1")).toBeUndefined();
    expect(tempoChange(marks, "other-piece")).toBeUndefined();
  });
});
