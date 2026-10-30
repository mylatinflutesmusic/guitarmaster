import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyState, keepTourSeen, loadState, saveState } from "./model";
import type { AppState } from "../types";

const KEY = "cuerda.state.v1";

class MemoryStorage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

let storage: MemoryStorage;

const write = (key: string, value: string) => storage.setItem(key, value);

const saved = (over: Partial<AppState> = {}): AppState => ({ ...emptyState(), ...over });

beforeEach(() => {
  storage = new MemoryStorage();
  vi.stubGlobal("localStorage", storage as unknown as Storage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadState", () => {
  it("starts fresh when the device has nothing saved", () => {
    const state = loadState();

    expect(state.version).toBe(1);
    expect(state.profile.onboarded).toBe(false);
    expect(state.pieces).toEqual([]);
    expect(state.log).toEqual([]);
    expect(state.tempos).toEqual([]);
  });

  it("keeps a profile that was only partly written", () => {
    write(
      KEY,
      JSON.stringify({
        version: 1,
        profile: { onboarded: true, minutes: 45, level: "advanced" },
      }),
    );

    const state = loadState();

    expect(state.profile.onboarded).toBe(true);
    expect(state.profile.minutes).toBe(45);
    expect(state.profile.level).toBe("advanced");
    // Fields that were never saved come from the defaults, not from undefined.
    expect(state.profile.days).toEqual([1, 2, 4, 5, 6]);
    expect(state.profile.protectHands).toBe(true);
    expect(state.profile.focuses).toEqual([]);
    expect(state.profile.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("keeps repertoire and history when the profile is missing", () => {
    write(
      KEY,
      JSON.stringify({
        version: 1,
        pieces: [{ id: "p1", title: "Lagrima", composer: "Tárrega", status: "learning", priority: 2 }],
        log: [{ id: "l1", date: "2026-10-25", minutes: 30, plannedMinutes: 30, phase: "foundation", blocks: [] }],
        tempos: [{ id: "t1", date: "2026-10-25", subjectId: "p1", subjectName: "Lagrima", bpm: 96 }],
      }),
    );

    const state = loadState();

    expect(state.pieces).toHaveLength(1);
    expect(state.log).toHaveLength(1);
    expect(state.tempos[0].bpm).toBe(96);
    expect(state.profile.onboarded).toBe(false);
  });

  it("replaces collections that are not arrays instead of handing them to the planner", () => {
    write(KEY, JSON.stringify({ version: 1, pieces: "corrupt", log: { nope: true }, tempos: 7 }));

    const state = loadState();

    expect(Array.isArray(state.pieces)).toBe(true);
    expect(Array.isArray(state.log)).toBe(true);
    expect(Array.isArray(state.tempos)).toBe(true);
    expect(state.pieces).toEqual([]);
    expect(state.log).toEqual([]);
    expect(state.tempos).toEqual([]);
  });

  it("falls back to defaults when the profile is not an object", () => {
    write(KEY, JSON.stringify({ version: 1, profile: "onboarded", pieces: [] }));

    const state = loadState();

    expect(state.profile.onboarded).toBe(false);
    expect(state.profile.level).toBe("intermediate");
    expect(state.profile.days).toEqual([1, 2, 4, 5, 6]);
  });

  it("refuses to reinterpret a state written by another schema version", () => {
    for (const version of [0, 2, 99]) {
      write(KEY, JSON.stringify({ ...saved(), version, pieces: [{ id: "p1" }] }));
      const state = loadState();

      expect(state.version).toBe(1);
      expect(state.pieces).toEqual([]);
      expect(state.profile.onboarded).toBe(false);
    }
  });

  it("survives unreadable or empty JSON without throwing", () => {
    for (const raw of ["{not json", "null", "[]", "{}", '"text"']) {
      write(KEY, raw);
      expect(() => loadState()).not.toThrow();
      expect(loadState().pieces).toEqual([]);
    }
  });
});

describe("saveState", () => {
  it("round-trips everything the guitarist has entered", () => {
    const state = saved({
      profile: {
        ...emptyState().profile,
        onboarded: true,
        level: "advanced",
        minutes: 45,
        days: [1, 3, 5],
        focuses: ["tremolo"],
        focusPieceId: "p1",
        tourVersion: 2,
        goal: { label: "Recital", date: "2026-12-01" },
      },
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
    });

    saveState(state);

    expect(loadState()).toEqual(state);
  });

  it("writes under the documented key and version", () => {
    saveState(saved());

    const raw = storage.getItem(KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toMatchObject({ version: 1 });
  });

  it("does not throw when the browser refuses to save", () => {
    storage.setItem = () => {
      throw new Error("QuotaExceededError");
    };

    expect(() => saveState(saved())).not.toThrow();
  });
});

describe("keepTourSeen", () => {
  it("keeps the tour this device has already shown when its data is erased", () => {
    expect(keepTourSeen(2, undefined)).toBe(2);
  });

  it("keeps a newer tour coming in from a backup", () => {
    expect(keepTourSeen(1, 2)).toBe(2);
  });

  it("treats a never-seen device and a tourless backup as zero", () => {
    expect(keepTourSeen(undefined, undefined)).toBe(0);
    expect(keepTourSeen(undefined, 2)).toBe(2);
  });
});
