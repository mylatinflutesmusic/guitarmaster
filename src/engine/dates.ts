/** Date helpers. Everything is local-time keyed as YYYY-MM-DD so a day is a day. */

export function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function todayKey(): string {
  return toKey(today());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDaysKey(key: string, days: number): string {
  return toKey(addDays(fromKey(key), days));
}

/** Sunday-based start of week, so weekday indices match Date.getDay(). */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function daysBetween(from: string, to: string): number {
  const ms = fromKey(to).getTime() - fromKey(from).getTime();
  return Math.round(ms / 86400000);
}

export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function dayLabel(key: string, reference = todayKey()): string {
  const diff = daysBetween(reference, key);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return WEEKDAY_NAMES[fromKey(key).getDay()];
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** e.g. Wednesday 26 October */
export function longDate(key: string = todayKey()): string {
  const d = fromKey(key);
  return `${WEEKDAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function shortDate(key: string): string {
  const d = fromKey(key);
  return `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()}`;
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** e.g. 27 Oct — for series that can span more than a month, where a bare day number is ambiguous. */
export function monthDate(key: string): string {
  const d = fromKey(key);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function goalCountdown(goal: string, reference = todayKey()): string {
  const diff = daysBetween(reference, goal);
  if (diff < 0) return "goal passed";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff < 14) return `in ${diff} days`;
  if (diff < 56) return `in ${Math.round(diff / 7)} weeks`;
  return `in ${Math.round(diff / 30)} months`;
}
