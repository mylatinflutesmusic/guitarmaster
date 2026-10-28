import type { AppState } from "../types";
import { daysBetween, todayKey } from "../engine/dates";
import { STATE_VERSION, isRecord, parseState } from "./model";

const APP = "cuerda";

/** How often the history is worth taking off the device. */
export const BACKUP_INTERVAL_DAYS = 30;
/** A history younger than this is still small enough to rebuild by hand. */
export const BACKUP_HISTORY_DAYS = 30;
/** How long “Later” keeps the reminder quiet. */
export const BACKUP_SNOOZE_DAYS = 14;

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

export interface BackupStatus {
  due: boolean;
  /** Days since the oldest logged session. */
  historyDays: number;
  lastBackupAt?: string;
  daysSinceBackup?: number;
}

/**
 * Whether the history is old enough, and the last backup far enough behind, to
 * remind the guitarist. A fresh history is not worth interrupting for; a snooze
 * keeps it quiet until the chosen day.
 */
export function backupDue(state: AppState, reference = todayKey()): BackupStatus {
  const oldest = state.log
    .map((entry) => entry.date)
    .filter(Boolean)
    .sort()[0];

  if (!oldest) return { due: false, historyDays: 0 };

  const historyDays = daysBetween(oldest, reference);
  const lastBackupAt = state.profile.lastBackupAt;
  const daysSinceBackup = lastBackupAt ? daysBetween(lastBackupAt, reference) : undefined;

  const snoozedUntil = state.profile.backupSnoozedUntil;
  if (snoozedUntil && daysBetween(reference, snoozedUntil) >= 0) {
    return { due: false, historyDays, lastBackupAt, daysSinceBackup };
  }

  const due =
    historyDays >= BACKUP_HISTORY_DAYS &&
    (daysSinceBackup === undefined || daysSinceBackup >= BACKUP_INTERVAL_DAYS);

  return { due, historyDays, lastBackupAt, daysSinceBackup };
}

/** Write the backup to the guitarist's downloads. Returns the filename. */
export function downloadBackup(state: AppState, dateKey = todayKey()): string {
  const filename = backupFilename(dateKey);
  const blob = new Blob([backupJson(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke after the browser has taken the file, not before.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}
