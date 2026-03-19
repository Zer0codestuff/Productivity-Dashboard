const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function toDateKey(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateTime(input: string): string {
  return new Date(input).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isToday(dateKey: string): boolean {
  return dateKey === toDateKey(new Date());
}

export function isWithinDays(input: string, days: number): boolean {
  const target = new Date(input).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return now - target <= DAY_IN_MS * days;
}

export function daysUntil(dueDate: string): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.round((due - now) / DAY_IN_MS);
}
