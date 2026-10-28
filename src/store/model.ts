import type { AppState, LogEntry, LoggedBlock, Phase, Piece, Profile, TempoMark } from "../types";
import type { WeekPlan } from "../types";
import { todayKey } from "../engine/dates";

const STORAGE_KEY = "cuerda.state.v1";
const VERSION = 1;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function defaultProfile(): Profile {
  return {
    onboarded: false,
    level: "intermediate",
    minutes: 30,
    days: [1, 2, 4, 5, 6],
    dayMinutes: {},
    focuses: [],
    protectHands: true,
    createdAt: todayKey(),
  };
}

export function emptyState(): AppState {
  return { version: VERSION, profile: defaultProfile(), pieces: [], log: [], tempos: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Restore from this device. A state from another schema version, or one that is
 * not readable at all, falls back to a fresh state; a single malformed field is
 * ignored so the rest of the repertoire and history still load. In particular no
 * collection reaches the planner unless it really is a list.
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.version !== VERSION) return emptyState();
    const profile = isRecord(parsed.profile) ? (parsed.profile as Partial<Profile>) : {};
    return {
      version: VERSION,
      profile: { ...defaultProfile(), ...profile },
      pieces: Array.isArray(parsed.pieces) ? (parsed.pieces as Piece[]) : [],
      log: Array.isArray(parsed.log) ? (parsed.log as LogEntry[]) : [],
      tempos: Array.isArray(parsed.tempos) ? (parsed.tempos as TempoMark[]) : [],
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable (private browsing). The app still works for this session.
  }
}

export interface SessionLogInput {
  date: string;
  minutes: number;
  plannedMinutes: number;
  phase: Phase;
  blocks: LoggedBlock[];
  note?: string;
}

export interface StoreValue {
  state: AppState;
  ready: boolean;
  week: WeekPlan;
  phase: Phase;
  daysToGoal?: number;
  weeksToGoal?: number;
  updateProfile: (patch: Partial<Profile>) => void;
  addPiece: (input: Omit<Piece, "id">) => string;
  updatePiece: (id: string, patch: Partial<Piece>) => void;
  removePiece: (id: string) => void;
  /** Name the piece the plan should be built around, or clear it with null. */
  setFocusPiece: (id: string | null) => void;
  logSession: (input: SessionLogInput) => void;
  deleteLog: (id: string) => void;
  addTempo: (input: Omit<TempoMark, "id">) => void;
  deleteTempo: (id: string) => void;
  removeAll: () => void;
}
