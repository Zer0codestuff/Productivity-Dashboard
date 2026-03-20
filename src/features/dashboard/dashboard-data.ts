import { Flower2, Leaf, Snowflake, SunMedium, type LucideIcon } from "lucide-react";

export const colorThemes = {
  white: { primary: "0 0% 98%", primaryForeground: "222.2 47.4% 11.2%" },
  violet: { primary: "262.1 83.3% 57.8%", primaryForeground: "210 20% 98%" },
  green: { primary: "142.1 76.2% 36.3%", primaryForeground: "145.1 80% 98%" },
  orange: { primary: "24.6 95% 53.1%", primaryForeground: "20 14.3% 97.3%" },
  rose: { primary: "346.8 77.2% 49.8%", primaryForeground: "355.7 100% 97.3%" },
  blue: { primary: "221.2 83.2% 53.3%", primaryForeground: "210 40% 98%" },
} as const;

const DASHBOARD_STORAGE_KEY = "gamified-dashboard-v2";
export const DASHBOARD_DATA_VERSION = 2;
const MAX_HISTORY_POINTS = 30;
export const THEME_MODES = ["dark", "light"] as const;
const avatarFallback =
  "https://i.pinimg.com/originals/01/05/b5/0105b5a8865355f0c551606c4fee9120.jpg";
const defaultMotivation =
  "Fear is your ego. Turn resistance into effortlessness. Dare to succeed...";

export type ThemeMode = (typeof THEME_MODES)[number];
export type ThemeColorKey = keyof typeof colorThemes;

export interface RadarStat {
  id: number;
  area: string;
  value: number;
}

export interface EnergyMetric {
  key: string;
  value: number;
}

export interface EnergyHistoryEntry {
  dateKey: string;
  day: string;
  [key: string]: string | number;
}

export interface Habit {
  id: number;
  name: string;
  streak: number;
  lastCompleted: string | null;
  completedDates: string[];
}

export interface JournalEntry {
  id: number;
  dateKey: string;
  createdAt: string;
  title: string;
  content: string;
}

export interface DashboardData {
  profileName: string;
  avatarSrc: string;
  themeMode: ThemeMode;
  primaryColorKey: ThemeColorKey;
  level: number;
  xp: number;
  xpToNext: number;
  radarStats: RadarStat[];
  energy: EnergyMetric[];
  energyHistory: EnergyHistoryEntry[];
  motivation: string;
  habits: Habit[];
  journalEntries: JournalEntry[];
  journalRewardedDates: string[];
}

export interface DashboardSnapshot extends DashboardData {
  version: number;
  savedAt?: string;
  exportedAt?: string;
}

type UnknownRecord = Record<string, unknown>;

export function parseDateInput(input: unknown): Date | null {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : new Date(input);
  }

  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(input as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function toDateKey(input: unknown): string {
  const date = parseDateInput(input);
  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isToday(dateString: string) {
  if (!dateString) return false;
  return toDateKey(dateString) === toDateKey(new Date());
}

export function isYesterday(dateString: string) {
  if (!dateString) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return toDateKey(dateString) === toDateKey(yesterday);
}

function formatShortDay(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function getSeasonArcLabel(date: Date) {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) return "Spring Arc";
  if (month >= 5 && month <= 7) return "Summer Arc";
  if (month >= 8 && month <= 10) return "Autumn Arc";

  return "Winter Arc";
}

export function getSeasonArcIcon(date: Date): LucideIcon {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) return Flower2;
  if (month >= 5 && month <= 7) return SunMedium;
  if (month >= 8 && month <= 10) return Leaf;

  return Snowflake;
}

function buildEnergyHistoryEntry(dateInput: unknown, energy: EnergyMetric[]): EnergyHistoryEntry {
  const date = parseDateInput(dateInput) ?? new Date();
  const entry: EnergyHistoryEntry = {
    dateKey: toDateKey(date),
    day: formatShortDay(date),
  };

  energy.forEach((metric) => {
    entry[metric.key] = clamp(metric.value, 0, 10);
  });

  return entry;
}

function buildInitialEnergyHistory(energy: EnergyMetric[]) {
  return [buildEnergyHistoryEntry(new Date(), energy)];
}

export function syncTodayHistory(history: EnergyHistoryEntry[], energy: EnergyMetric[]) {
  const today = new Date();
  const todayKey = toDateKey(today);
  const todayEntry = buildEnergyHistoryEntry(today, energy);
  const existingIndex = history.findIndex((entry) => entry.dateKey === todayKey);

  if (existingIndex >= 0) {
    return history.map((entry, index) => (index === existingIndex ? todayEntry : entry));
  }

  return [...history.slice(-(MAX_HISTORY_POINTS - 1)), todayEntry];
}

export function formatJournalDate(input: unknown) {
  return (parseDateInput(input) ?? new Date()).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateJournalStreak(entries: JournalEntry[]) {
  const uniqueDates = [...new Set(entries.map((entry) => entry.dateKey))].sort().reverse();
  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  const cursor = parseDateInput(new Date());
  cursor?.setHours(12, 0, 0, 0);

  for (const dateKey of uniqueDates) {
    const target = parseDateInput(dateKey);
    if (!cursor || !target) continue;
    target.setHours(12, 0, 0, 0);

    const diff = Math.round((cursor.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));

    if (diff === 0 || diff === 1) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    break;
  }

  return streak;
}

export function calculateHabitStreak(completedDates: string[] | null | undefined) {
  const uniqueDates = [...new Set((completedDates ?? []).map((dateKey) => toDateKey(dateKey)).filter(Boolean))]
    .sort()
    .reverse();

  if (uniqueDates.length === 0) return 0;

  const todayKey = toDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  if (uniqueDates[0] !== todayKey && uniqueDates[0] !== yesterdayKey) {
    return 0;
  }

  let streak = 0;
  const cursor = parseDateInput(uniqueDates[0]);
  if (!cursor) return 0;

  for (const dateKey of uniqueDates) {
    if (dateKey !== toDateKey(cursor)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getJournalXpBonus(streak: number) {
  if (streak >= 14) return 15;
  if (streak >= 7) return 10;
  if (streak >= 3) return 5;
  return 0;
}

function createDefaultEnergy(): EnergyMetric[] {
  return [
    { key: "Willpower", value: 5 },
    { key: "Health", value: 7 },
    { key: "Mood", value: 6 },
  ];
}

function createCompletedDates(endDateInput: unknown, streakLength: number) {
  const endDate = parseDateInput(endDateInput);
  if (!endDate || streakLength <= 0) return [];

  return Array.from({ length: streakLength }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(date.getDate() - (streakLength - 1 - index));
    return toDateKey(date);
  });
}

function createDefaultHabits(): Habit[] {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = yesterday.toISOString();

  return [
    {
      id: 1,
      name: "Exercise",
      streak: 5,
      lastCompleted: yesterdayIso,
      completedDates: createCompletedDates(yesterday, 5),
    },
    {
      id: 2,
      name: "Read 10 pages",
      streak: 12,
      lastCompleted: yesterdayIso,
      completedDates: createCompletedDates(yesterday, 12),
    },
    {
      id: 3,
      name: "Meditate 5 mins",
      streak: 0,
      lastCompleted: null,
      completedDates: [],
    },
  ];
}

export function createDefaultDashboardData(): DashboardData {
  const energy = createDefaultEnergy();

  return {
    profileName: "Ash",
    avatarSrc: avatarFallback,
    themeMode: "dark",
    primaryColorKey: "white",
    level: 1,
    xp: 0,
    xpToNext: 100,
    radarStats: [
      { id: 1, area: "Physical", value: 80 },
      { id: 2, area: "Psyche", value: 90 },
      { id: 3, area: "Intell", value: 75 },
      { id: 4, area: "Spiritual", value: 70 },
      { id: 5, area: "Core", value: 85 },
    ],
    energy,
    energyHistory: buildInitialEnergyHistory(energy),
    motivation: defaultMotivation,
    habits: createDefaultHabits(),
    journalEntries: [],
    journalRewardedDates: [],
  };
}

function sanitizeNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return clamp(value, min, max);
}

function sanitizeString(value: unknown, fallback: string, maxLength = 120) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function sanitizeEnergy(value: unknown, fallbackEnergy: EnergyMetric[]) {
  return fallbackEnergy.map((metric) => {
    const importedMetric =
      Array.isArray(value) &&
      value.find(
        (entry) =>
          entry &&
          typeof entry === "object" &&
          (entry as UnknownRecord).key === metric.key
      );

    return {
      key: metric.key,
      value: sanitizeNumber((importedMetric as UnknownRecord | undefined)?.value, metric.value, 0, 10),
    };
  });
}

function sanitizeRadarStats(value: unknown, fallbackStats: RadarStat[]): RadarStat[] {
  if (!Array.isArray(value)) return fallbackStats;

  const sanitized = value
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as UnknownRecord;
      const area = sanitizeString(record.area, "", 24);
      if (!area) return null;

      return {
        id: typeof record.id === "number" ? record.id : Date.now() + index,
        area,
        value: sanitizeNumber(record.value, 50, 0, 100),
      };
    })
    .filter((entry): entry is RadarStat => Boolean(entry));

  return sanitized.length > 0 ? sanitized : fallbackStats;
}

function sanitizeEnergyHistory(value: unknown, energy: EnergyMetric[]) {
  if (!Array.isArray(value)) {
    return buildInitialEnergyHistory(energy);
  }

  const entriesByDate = new Map<string, EnergyHistoryEntry>();

  value.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const record = entry as UnknownRecord;
    const dateKey = toDateKey(record.dateKey);
    if (!dateKey) return;

    const normalizedEntry = buildEnergyHistoryEntry(dateKey, energy);
    energy.forEach((metric) => {
      normalizedEntry[metric.key] = sanitizeNumber(record[metric.key], metric.value, 0, 10);
    });
    entriesByDate.set(dateKey, normalizedEntry);
  });

  const sanitized = [...entriesByDate.values()]
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .slice(-MAX_HISTORY_POINTS);

  return sanitized.length > 0 ? sanitized : buildInitialEnergyHistory(energy);
}

function sanitizeJournalEntries(value: unknown): JournalEntry[] {
  if (!Array.isArray(value)) return [];

  const entriesByDate = new Map<string, JournalEntry>();

  value.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") return;
    const record = entry as UnknownRecord;

    const dateKey = toDateKey(record.dateKey || record.createdAt);
    const createdAtDate = parseDateInput(record.createdAt || record.dateKey);
    const title = sanitizeString(record.title, "", 120);
    const content = sanitizeString(record.content, "", 4000);

    if (!dateKey || !createdAtDate || !title || !content) return;

    entriesByDate.set(dateKey, {
      id: typeof record.id === "number" ? record.id : Date.now() + index,
      dateKey,
      createdAt: createdAtDate.toISOString(),
      title,
      content,
    });
  });

  return [...entriesByDate.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function sanitizeHabit(habit: unknown, index: number): Habit | null {
  if (!habit || typeof habit !== "object") return null;
  const record = habit as UnknownRecord;

  const name = sanitizeString(record.name, "", 60);
  if (!name) return null;

  let completedDates: string[] = [];
  if (Array.isArray(record.completedDates)) {
    completedDates = [...new Set(record.completedDates.map((dateKey) => toDateKey(dateKey)).filter(Boolean))].sort();
  } else {
    const fallbackLastCompleted = parseDateInput(record.lastCompleted);
    const fallbackStreak = sanitizeNumber(record.streak, 0, 0, 365);
    completedDates = createCompletedDates(fallbackLastCompleted, fallbackStreak);
  }

  const streak = calculateHabitStreak(completedDates);
  const lastCompleted =
    completedDates.length > 0
      ? (parseDateInput(completedDates[completedDates.length - 1]) ?? new Date()).toISOString()
      : null;

  return {
    id: typeof record.id === "number" ? record.id : Date.now() + index,
    name,
    streak,
    lastCompleted,
    completedDates,
  };
}

function sanitizeHabits(value: unknown, fallbackHabits: Habit[]) {
  if (!Array.isArray(value)) return fallbackHabits;

  const sanitized = value
    .map((habit, index) => sanitizeHabit(habit, index))
    .filter((habit): habit is Habit => Boolean(habit));

  return sanitized.length > 0 ? sanitized : fallbackHabits;
}

function sanitizeRewardedDates(value: unknown, journalEntries: JournalEntry[]) {
  if (Array.isArray(value)) {
    const sanitized = [...new Set(value.map((dateKey) => toDateKey(dateKey)).filter(Boolean))].sort();
    if (sanitized.length > 0) return sanitized;
  }

  return [...new Set(journalEntries.map((entry) => entry.dateKey))].sort();
}

export function sanitizeDashboardSnapshot(value: unknown): DashboardData {
  const fallback = createDefaultDashboardData();
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const snapshot = value as UnknownRecord;
  const energy = sanitizeEnergy(snapshot.energy, fallback.energy);
  const journalEntries = sanitizeJournalEntries(snapshot.journalEntries);
  const habits = sanitizeHabits(snapshot.habits, fallback.habits);

  const themeMode =
    typeof snapshot.themeMode === "string" && THEME_MODES.includes(snapshot.themeMode as ThemeMode)
      ? (snapshot.themeMode as ThemeMode)
      : fallback.themeMode;

  const primaryColorKey =
    typeof snapshot.primaryColorKey === "string" && snapshot.primaryColorKey in colorThemes
      ? (snapshot.primaryColorKey as ThemeColorKey)
      : fallback.primaryColorKey;

  return {
    profileName: sanitizeString(snapshot.profileName, fallback.profileName, 32),
    avatarSrc: typeof snapshot.avatarSrc === "string" ? snapshot.avatarSrc : fallback.avatarSrc,
    themeMode,
    primaryColorKey,
    level: sanitizeNumber(snapshot.level, fallback.level, 1, 999),
    xp: sanitizeNumber(snapshot.xp, fallback.xp, 0, 999999),
    xpToNext: sanitizeNumber(snapshot.xpToNext, fallback.xpToNext, 1, 999999),
    radarStats: sanitizeRadarStats(snapshot.radarStats, fallback.radarStats),
    energy,
    energyHistory: syncTodayHistory(sanitizeEnergyHistory(snapshot.energyHistory, energy), energy),
    motivation: sanitizeString(snapshot.motivation, fallback.motivation, 280),
    habits,
    journalEntries,
    journalRewardedDates: sanitizeRewardedDates(snapshot.journalRewardedDates, journalEntries),
  };
}

function createDashboardSnapshot(
  data: DashboardData,
  metadataKey: "savedAt" | "exportedAt"
): DashboardSnapshot {
  const fallback = createDefaultDashboardData();

  return {
    version: DASHBOARD_DATA_VERSION,
    ...data,
    radarStats: sanitizeRadarStats(data.radarStats, fallback.radarStats),
    [metadataKey]: new Date().toISOString(),
  };
}

export function readStoredDashboardData() {
  if (typeof window === "undefined") return createDefaultDashboardData();

  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (!raw) return createDefaultDashboardData();
    return sanitizeDashboardSnapshot(JSON.parse(raw));
  } catch {
    return createDefaultDashboardData();
  }
}

export function writeStoredDashboardData(data: DashboardData) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      DASHBOARD_STORAGE_KEY,
      JSON.stringify(createDashboardSnapshot(data, "savedAt"))
    );
  } catch {
    // Ignore storage quota errors and keep the app usable.
  }
}

export function createExportSnapshot(data: DashboardData) {
  return createDashboardSnapshot(data, "exportedAt");
}

export function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startOffset + 1;
    if (dayNumber < 1 || dayNumber > lastDay.getDate()) {
      return null;
    }

    const date = new Date(year, month, dayNumber);
    return {
      label: dayNumber,
      dateKey: toDateKey(date),
    };
  });
}
