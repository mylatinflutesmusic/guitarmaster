import { describe, expect, it } from "vitest";
import { backupFilename, backupJson, parseBackup } from "./backup";
import { emptyState } from "./model";
import type { AppState } from "../types";

const saved = (over: Partial<AppState> = {}): AppState => ({
  ...emptyState(),
  profile: { ...emptyState().profile, onboarded: true, level: "advanced", minutes: 45, focuses: ["tremolo"], tourVersion: 2 },
  pieces: [{ id: "p1", title: "Lagrima", composer: "Tárrega", status: "polishing", priority: 1, demands: ["tremolo"] }],
  log: [
    {
      id: "l1",
      date: "2026-10-25",
      minutes: 30,
      plannedMinutes: 30,
      phase: "foundation",
      blocks: [{ blockId: "b1", kind: "technique", title: "Tremolo", minutes: 8, techniqueId: "tremolo", pieceId: "p1" }],
      note: "Tremolo settled at 84",
    },
  ],
  tempos: [{ id: "t1", date: "2026-10-25", subjectId: "p1", subjectName: "Lagrima", bpm: 84 }],
  ...over,
});

describe("backupJson", () => {
  it("wraps the state in a dated, identifiable envelope", () => {
    const json = backupJson(saved(), "2026-10-28T07:00:00.000Z");
    const parsed = JSON.parse(json);

    expect(parsed.app).toBe("cuerda");
    expect(parsed.version).toBe(1);
    expect(parsed.exportedAt).toBe("2026-10-28T07:00:00.000Z");
    expect(parsed.state.pieces).toHaveLength(1);
  });

  it("names the file by date so backups sort chronologically", () => {
    expect(backupFilename("2026-10-28")).toBe("cuerda-backup-2026-10-28.json");
  });
});

describe("parseBackup", () => {
  it("returns the practice data unchanged", () => {
    const state = saved();
    const result = parseBackup(backupJson(state, "2026-10-28T07:00:00.000Z"));

    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.state).toEqual(state);
    expect(result.exportedAt).toBe("2026-10-28T07:00:00.000Z");
  });

  it("rejects a file that is not JSON", () => {
    const result = parseBackup("{not json");
    expect(result).toEqual({ error: "That file is not valid JSON." });
  });

  it("rejects JSON that is not one of our backups", () => {
    expect(parseBackup(JSON.stringify({ pieces: [] }))).toEqual({ error: "That file is not a Cuerda backup." });
    expect(parseBackup(JSON.stringify({ app: "other-app", version: 1, state: saved() }))).toEqual({
      error: "That file is not a Cuerda backup.",
    });
    expect(parseBackup(JSON.stringify([saved()]))).toEqual({ error: "That file is not a Cuerda backup." });
  });

  it("refuses a backup from another schema version instead of guessing", () => {
    const result = parseBackup(JSON.stringify({ app: "cuerda", version: 2, state: saved() }));

    expect(result).toEqual({
      error: "That backup uses schema version 2; this app reads version 1.",
    });
  });

  it("asks for a version rather than assuming one", () => {
    const result = parseBackup(JSON.stringify({ app: "cuerda", state: saved() }));

    expect("error" in result).toBe(true);
  });

  it("rejects an envelope with no readable state", () => {
    expect(parseBackup(JSON.stringify({ app: "cuerda", version: 1, state: "nope" }))).toEqual({
      error: "That backup does not contain readable practice data.",
    });
  });

  it("keeps the valid parts of a backup with one damaged field", () => {
    const result = parseBackup(
      JSON.stringify({
        app: "cuerda",
        version: 1,
        state: {
          version: 1,
          profile: { onboarded: true, minutes: 30 },
          pieces: "damaged",
          log: saved().log,
          tempos: saved().tempos,
        },
      }),
    );

    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.state.pieces).toEqual([]);
    expect(result.state.log).toHaveLength(1);
    expect(result.state.tempos[0].bpm).toBe(84);
    expect(result.state.profile.onboarded).toBe(true);
    expect(result.state.profile.days).toEqual([1, 2, 4, 5, 6]);
  });

  it("leaves the export date optional", () => {
    const result = parseBackup(JSON.stringify({ app: "cuerda", version: 1, state: saved() }));

    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.exportedAt).toBeUndefined();
  });
});
