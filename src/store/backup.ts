import type { AppState } from "../types";
import { STATE_VERSION, isRecord, parseState } from "./model";

const APP = "cuerda";

/**
 * The backup is a small envelope around the same state that lives in
 * localStorage, so it can be recognised, dated and version-checked before it is
 * allowed to replace anything on the device.
 */
export interface Backup {
  app: typeof APP;
  version: number;
  exportedAt: string;
  state: AppState;
}

export interface ParsedBackup {
  state: AppState;
  exportedAt?: string;
}

export function backupJson(state: AppState, exportedAt = new Date().toISOString()): string {
  const backup: Backup = { app: APP, version: state.version, exportedAt, state };
  return JSON.stringify(backup, null, 2);
}

export function parseBackup(text: string): ParsedBackup | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: "That file is not valid JSON." };
  }

  if (!isRecord(parsed) || parsed.app !== APP) {
    return { error: "That file is not a Cuerda backup." };
  }
  if (typeof parsed.version !== "number") {
    return { error: "That backup does not record which version made it, so it cannot be trusted." };
  }
  if (parsed.version !== STATE_VERSION) {
    return {
      error: `That backup uses schema version ${parsed.version}; this app reads version ${STATE_VERSION}.`,
    };
  }

  const state = parseState(parsed.state);
  if (!state) {
    return { error: "That backup does not contain readable practice data." };
  }

  return { state, exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : undefined };
}

/** A filename that sorts chronologically and says what it holds. */
export function backupFilename(dateKey: string): string {
  return `cuerda-backup-${dateKey}.json`;
}
