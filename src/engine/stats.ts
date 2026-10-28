import type { LogEntry, Piece, TempoMark } from "../types";
import { addDaysKey, daysBetween, todayKey } from "./dates";

export function logStreak(log: LogEntry[], reference = todayKey()): number {
  const dates = new Set(log.map((e) => e.date));
  if (!dates.size) return 0;
  let cursor = reference;
  if (!dates.has(cursor)) {
    cursor = addDaysKey(reference, -1);
    if (!dates.has(cursor)) return 0;
  }
  let streak = 0;
  while (dates.has(cursor) && streak < 400) {
    streak += 1;
    cursor = addDaysKey(cursor, -1);
  }
  return streak;
}

export function weekMinutes(log: LogEntry[], startKey: string): number {
  const endKey = addDaysKey(startKey, 6);
  return log
    .filter((e) => e.date >= startKey && e.date <= endKey)
    .reduce((sum, e) => sum + e.minutes, 0);
}

export function lastNDays(log: LogEntry[], n: number, reference = todayKey()): { key: string; minutes: number; planned: number }[] {
  const map = new Map(log.map((e) => [e.date, e]));
  const out: { key: string; minutes: number; planned: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = addDaysKey(reference, -i);
    const entry = map.get(key);
    out.push({ key, minutes: entry?.minutes ?? 0, planned: entry?.plannedMinutes ?? 0 });
  }
  return out;
}

export interface Split {
  technique: number;
  repertoire: number;
  reading: number;
  other: number;
  sessions: number;
  minutes: number;
}

export function splitMinutes(log: LogEntry[], fromKey?: string): Split {
  const split: Split = { technique: 0, repertoire: 0, reading: 0, other: 0, sessions: 0, minutes: 0 };
  for (const entry of log) {
    if (fromKey && entry.date < fromKey) continue;
    split.sessions += 1;
    split.minutes += entry.minutes;
    for (const block of entry.blocks) {
      if (block.kind === "technique") split.technique += block.minutes;
      else if (block.kind === "repertoire" || block.kind === "memory" || block.kind === "performance") split.repertoire += block.minutes;
      else if (block.kind === "reading") split.reading += block.minutes;
      else split.other += block.minutes;
    }
  }
  return split;
}

export function tempoSeries(tempos: TempoMark[], subjectId: string): TempoMark[] {
  return tempos.filter((t) => t.subjectId === subjectId).sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function latestTempo(tempos: TempoMark[], subjectId: string): TempoMark | undefined {
  const series = tempoSeries(tempos, subjectId);
  return series[series.length - 1];
}

export function tempoChange(tempos: TempoMark[], subjectId: string): number | undefined {
  const series = tempoSeries(tempos, subjectId);
  if (series.length < 2) return undefined;
  return series[series.length - 1].bpm - series[0].bpm;
}

export function lastTouched(log: LogEntry[]): Record<string, string> {
  const touched: Record<string, string> = {};
  for (const entry of log) {
    for (const block of entry.blocks) {
      if (block.pieceId && (!touched[block.pieceId] || entry.date > touched[block.pieceId])) {
        touched[block.pieceId] = entry.date;
      }
    }
  }
  return touched;
}

export function daysSinceTouched(piece: Piece, log: LogEntry[], reference = todayKey()): number | undefined {
  const touched = lastTouched(log)[piece.id];
  if (!touched) return undefined;
  return daysBetween(touched, reference);
}

export function practiceDayCount(log: LogEntry[], days: number, reference = todayKey()): number {
  const from = addDaysKey(reference, -days);
  const dates = new Set(log.filter((e) => e.date >= from).map((e) => e.date));
  return dates.size;
}
