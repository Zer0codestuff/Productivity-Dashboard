
import React, { useState, useEffect, useRef } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui-compat";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  BarChart2,
  BookOpenText,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Flame,
  Flower2,
  Heart,
  LayoutDashboard,
  LineChart as LineChartIcon,
  Leaf,
  Minus,
  MoonStar,
  Palette,
  PenLine,
  Plus,
  PlusCircle,
  Settings,
  Snowflake,
  Sparkles,
  SunMedium,
  Target,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";

/* ---------- Helpers ---------- */
const colorThemes = {
  white: { primary: "0 0% 98%", primaryForeground: "222.2 47.4% 11.2%" },
  violet: { primary: "262.1 83.3% 57.8%", primaryForeground: "210 20% 98%" },
  green: { primary: "142.1 76.2% 36.3%", primaryForeground: "145.1 80% 98%" },
  orange: { primary: "24.6 95% 53.1%", primaryForeground: "20 14.3% 97.3%" },
  rose: { primary: "346.8 77.2% 49.8%", primaryForeground: "355.7 100% 97.3%" },
  blue: { primary: "221.2 83.2% 53.3%", primaryForeground: "210 40% 98%" },
};

const DASHBOARD_STORAGE_KEY = "gamified-dashboard-v2";
const DASHBOARD_DATA_VERSION = 2;
const MAX_HISTORY_POINTS = 30;
const THEME_MODES = ["dark", "light"];
const avatarFallback =
  "https://i.pinimg.com/originals/01/05/b5/0105b5a8865355f0c551606c4fee9120.jpg";
const defaultMotivation =
  "Fear is your ego. Turn resistance into effortlessness. Dare to succeed...";

const parseDateInput = (input) => {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : new Date(input);
  }

  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toDateKey = (input) => {
  const date = parseDateInput(input);
  if (!date) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isToday = (dateString) => {
  if (!dateString) return false;
  return toDateKey(dateString) === toDateKey(new Date());
};

const isYesterday = (dateString) => {
  if (!dateString) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return toDateKey(dateString) === toDateKey(yesterday);
};

const formatShortDay = (date) =>
  date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

const getSeasonArcLabel = (date) => {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) return "Spring Arc";
  if (month >= 5 && month <= 7) return "Summer Arc";
  if (month >= 8 && month <= 10) return "Autumn Arc";

  return "Winter Arc";
};

const getSeasonArcIcon = (date) => {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) return Flower2;
  if (month >= 5 && month <= 7) return SunMedium;
  if (month >= 8 && month <= 10) return Leaf;

  return Snowflake;
};

const buildEnergyHistoryEntry = (dateInput, energy) => {
  const date = parseDateInput(dateInput) ?? new Date();
  const entry = {
    dateKey: toDateKey(date),
    day: formatShortDay(date),
  };

  energy.forEach((metric) => {
    entry[metric.key] = clamp(metric.value, 0, 10);
  });

  return entry;
};

const buildInitialEnergyHistory = (energy) => [buildEnergyHistoryEntry(new Date(), energy)];

const syncTodayHistory = (history, energy) => {
  const today = new Date();
  const todayKey = toDateKey(today);
  const todayEntry = buildEnergyHistoryEntry(today, energy);

  const existingIndex = history.findIndex((entry) => entry.dateKey === todayKey);

  if (existingIndex >= 0) {
    return history.map((entry, index) =>
      index === existingIndex ? todayEntry : entry
    );
  }

  return [...history.slice(-(MAX_HISTORY_POINTS - 1)), todayEntry];
};

const formatJournalDate = (input) =>
  (parseDateInput(input) ?? new Date()).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const calculateJournalStreak = (entries) => {
  const uniqueDates = [...new Set(entries.map((entry) => entry.dateKey))].sort().reverse();
  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  const cursor = parseDateInput(new Date());
  cursor?.setHours(12, 0, 0, 0);

  for (const dateKey of uniqueDates) {
    const target = parseDateInput(dateKey);
    if (!cursor || !target) continue;
    target.setHours(12, 0, 0, 0);

    const diff = Math.round(
      (cursor.getTime() - target.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (diff === 0 || (streak === 0 && diff === 1) || diff === 1) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    break;
  }

  return streak;
};

const calculateHabitStreak = (completedDates) => {
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
  let cursor = parseDateInput(uniqueDates[0]);
  if (!cursor) return 0;

  for (const dateKey of uniqueDates) {
    if (dateKey !== toDateKey(cursor)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const getJournalXpBonus = (streak) => {
  if (streak >= 14) return 15;
  if (streak >= 7) return 10;
  if (streak >= 3) return 5;
  return 0;
};

const createDefaultEnergy = () => [
  { key: "Willpower", value: 5 },
  { key: "Health", value: 7 },
  { key: "Mood", value: 6 },
];

const createCompletedDates = (endDateInput, streakLength) => {
  const endDate = parseDateInput(endDateInput);
  if (!endDate || streakLength <= 0) return [];

  return Array.from({ length: streakLength }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(date.getDate() - (streakLength - 1 - index));
    return toDateKey(date);
  });
};

const createDefaultHabits = () => {
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
};

const createDefaultDashboardData = () => {
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
};

const sanitizeNumber = (value, fallback, min, max) => {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return clamp(value, min, max);
};

const sanitizeString = (value, fallback, maxLength = 120) => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
};

const sanitizeEnergy = (value, fallbackEnergy) =>
  fallbackEnergy.map((metric) => {
    const importedMetric =
      Array.isArray(value) &&
      value.find((entry) => entry && typeof entry === "object" && entry.key === metric.key);

    return {
      key: metric.key,
      value: sanitizeNumber(importedMetric?.value, metric.value, 0, 10),
    };
  });

const sanitizeRadarStats = (value, fallbackStats) => {
  if (!Array.isArray(value)) return fallbackStats;

  const sanitized = value
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const area = sanitizeString(entry.area, "", 24);
      if (!area) return null;

      return {
        id: typeof entry.id === "number" ? entry.id : Date.now() + index,
        area,
        value: sanitizeNumber(entry.value, 50, 0, 100),
      };
    })
    .filter(Boolean);

  return sanitized.length > 0 ? sanitized : fallbackStats;
};

const sanitizeEnergyHistory = (value, energy) => {
  if (!Array.isArray(value)) {
    return buildInitialEnergyHistory(energy);
  }

  const entriesByDate = new Map();

  value.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const dateKey = toDateKey(entry.dateKey);
    if (!dateKey) return;

    const normalizedEntry = buildEnergyHistoryEntry(dateKey, energy);
    energy.forEach((metric) => {
      normalizedEntry[metric.key] = sanitizeNumber(entry[metric.key], metric.value, 0, 10);
    });
    entriesByDate.set(dateKey, normalizedEntry);
  });

  const sanitized = [...entriesByDate.values()]
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .slice(-MAX_HISTORY_POINTS);

  return sanitized.length > 0 ? sanitized : buildInitialEnergyHistory(energy);
};

const sanitizeJournalEntries = (value) => {
  if (!Array.isArray(value)) return [];

  const entriesByDate = new Map();

  value.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") return;

    const dateKey = toDateKey(entry.dateKey || entry.createdAt);
    const createdAtDate = parseDateInput(entry.createdAt || entry.dateKey);
    const title = sanitizeString(entry.title, "", 120);
    const content = sanitizeString(entry.content, "", 4000);

    if (!dateKey || !createdAtDate || !title || !content) return;

    entriesByDate.set(dateKey, {
      id: typeof entry.id === "number" ? entry.id : Date.now() + index,
      dateKey,
      createdAt: createdAtDate.toISOString(),
      title,
      content,
    });
  });

  return [...entriesByDate.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const sanitizeHabit = (habit, index) => {
  if (!habit || typeof habit !== "object") return null;

  const name = sanitizeString(habit.name, "", 60);
  if (!name) return null;

  let completedDates = [];
  if (Array.isArray(habit.completedDates)) {
    completedDates = [...new Set(habit.completedDates.map((dateKey) => toDateKey(dateKey)).filter(Boolean))].sort();
  } else {
    const fallbackLastCompleted = parseDateInput(habit.lastCompleted);
    const fallbackStreak = sanitizeNumber(habit.streak, 0, 0, 365);
    completedDates = createCompletedDates(fallbackLastCompleted, fallbackStreak);
  }

  const streak = calculateHabitStreak(completedDates);
  const lastCompleted = completedDates.length > 0
    ? (parseDateInput(completedDates[completedDates.length - 1]) ?? new Date()).toISOString()
    : null;

  return {
    id: typeof habit.id === "number" ? habit.id : Date.now() + index,
    name,
    streak,
    lastCompleted,
    completedDates,
  };
};

const sanitizeHabits = (value, fallbackHabits) => {
  if (!Array.isArray(value)) return fallbackHabits;

  const sanitized = value.map(sanitizeHabit).filter(Boolean);
  return sanitized.length > 0 ? sanitized : fallbackHabits;
};

const sanitizeRewardedDates = (value, journalEntries) => {
  if (Array.isArray(value)) {
    const sanitized = [...new Set(value.map((dateKey) => toDateKey(dateKey)).filter(Boolean))].sort();
    if (sanitized.length > 0) return sanitized;
  }

  return [...new Set(journalEntries.map((entry) => entry.dateKey))].sort();
};

const sanitizeDashboardSnapshot = (value) => {
  const fallback = createDefaultDashboardData();
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const energy = sanitizeEnergy(value.energy, fallback.energy);
  const journalEntries = sanitizeJournalEntries(value.journalEntries);
  const habits = sanitizeHabits(value.habits, fallback.habits);

  return {
    profileName: sanitizeString(value.profileName, fallback.profileName, 32),
    avatarSrc: typeof value.avatarSrc === "string" ? value.avatarSrc : fallback.avatarSrc,
    themeMode: THEME_MODES.includes(value.themeMode) ? value.themeMode : fallback.themeMode,
    primaryColorKey: colorThemes[value.primaryColorKey]
      ? value.primaryColorKey
      : fallback.primaryColorKey,
    level: sanitizeNumber(value.level, fallback.level, 1, 999),
    xp: sanitizeNumber(value.xp, fallback.xp, 0, 999999),
    xpToNext: sanitizeNumber(value.xpToNext, fallback.xpToNext, 1, 999999),
    radarStats: sanitizeRadarStats(value.radarStats, fallback.radarStats),
    energy,
    energyHistory: syncTodayHistory(sanitizeEnergyHistory(value.energyHistory, energy), energy),
    motivation: sanitizeString(value.motivation, fallback.motivation, 280),
    habits,
    journalEntries,
    journalRewardedDates: sanitizeRewardedDates(value.journalRewardedDates, journalEntries),
  };
};

const readStoredDashboardData = () => {
  if (typeof window === "undefined") return createDefaultDashboardData();

  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (!raw) return createDefaultDashboardData();
    return sanitizeDashboardSnapshot(JSON.parse(raw));
  } catch {
    return createDefaultDashboardData();
  }
};

const energyIconMap = {
  Willpower: Zap,
  Health: Heart,
  Mood: Flame,
};

const buildCalendarDays = (monthDate) => {
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
};

function StepperControl({
  value,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel,
  compact = false,
}) {
  const buttonSize = compact ? "h-8 w-8" : "h-9 w-9";
  const valueClass = compact ? "min-w-[2.5rem] text-xs" : "min-w-[3rem] text-sm";

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-1 py-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`${buttonSize} rounded-full`}
        onClick={() => onChange(clamp(value - step, min, max))}
        aria-label={`Decrease ${ariaLabel}`}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className={`${valueClass} text-center font-medium tabular-nums`}>
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`${buttonSize} rounded-full`}
        onClick={() => onChange(clamp(value + step, min, max))}
        aria-label={`Increase ${ariaLabel}`}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

/* ---------- Main Component ---------- */
function GamifiedStatsDashboard() {
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);
  const [initialData] = useState(() => readStoredDashboardData());

  // Core progression state
  const [level, setLevel] = useState(initialData.level);
  const [xp, setXp] = useState(initialData.xp);
  const [xpToNext, setXpToNext] = useState(initialData.xpToNext);
  const [xpInput, setXpInput] = useState("");
  const [levelUpFlash, setLevelUpFlash] = useState(false);

  // Avatar
  const [avatarSrc, setAvatarSrc] = useState(initialData.avatarSrc);
  const [profileName, setProfileName] = useState(initialData.profileName);
  const [activePage, setActivePage] = useState("dashboard");
  const [themeMode, setThemeMode] = useState(initialData.themeMode);

  // Radar stats
  const [radarStats, setRadarStats] = useState(initialData.radarStats);
  const [newStatName, setNewStatName] = useState("");
  const [newStatVal, setNewStatVal] = useState("");

  // Daily energy
  const [energy, setEnergy] = useState(initialData.energy);
  const [energyHistory, setEnergyHistory] = useState(initialData.energyHistory);

  // Motivation phrase
  const [motivation, setMotivation] = useState(initialData.motivation);

  const [isEditingArc, setIsEditingArc] = useState(false);
  const seasonArcLabel = getSeasonArcLabel(new Date());
  const SeasonArcIcon = getSeasonArcIcon(new Date());
  const isLightMode = themeMode === "light";

  // Theme accent
  const [primaryColorKey, setPrimaryColorKey] = useState(initialData.primaryColorKey);

  // Habit tracker
  const [habits, setHabits] = useState(initialData.habits);
  const [newHabitName, setNewHabitName] = useState("");
  const [journalEntries, setJournalEntries] = useState(initialData.journalEntries);
  const [journalRewardedDates, setJournalRewardedDates] = useState(
    initialData.journalRewardedDates
  );
  const [journalForm, setJournalForm] = useState({
    title: "",
    content: "",
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedJournalDate, setSelectedJournalDate] = useState(() =>
    toDateKey(new Date())
  );

  /* ---------- Effects ---------- */

  // Apply theme accent to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const theme = colorThemes[primaryColorKey];
    if (theme) {
      root.style.setProperty("--primary", theme.primary);
      root.style.setProperty("--primary-foreground", theme.primaryForeground);
    }
  }, [primaryColorKey]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeMode;
  }, [themeMode]);

  // Optional: simple flash for level up (hook only; logic calls setLevelUpFlash)
  useEffect(() => {
    if (!levelUpFlash) return;
    const timeout = setTimeout(() => setLevelUpFlash(false), 500);
    return () => clearTimeout(timeout);
  }, [levelUpFlash]);

  useEffect(() => {
    setEnergyHistory((current) =>
      syncTodayHistory(
        current,
        energy.map(({ key, value }) => ({ key, value }))
      )
    );
  }, [energy]);

  useEffect(() => {
    const selectedEntry =
      journalEntries.find((entry) => entry.dateKey === selectedJournalDate) ?? null;

    if (selectedEntry) {
      setJournalForm({
        title: selectedEntry.title,
        content: selectedEntry.content,
      });
      return;
    }

    if (selectedJournalDate === toDateKey(new Date())) {
      setJournalForm({ title: "", content: "" });
    }
  }, [journalEntries, selectedJournalDate]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const snapshot = {
      version: DASHBOARD_DATA_VERSION,
      profileName,
      avatarSrc,
      themeMode,
      primaryColorKey,
      level,
      xp,
      xpToNext,
      radarStats,
      energy,
      energyHistory,
      motivation,
      habits,
      journalEntries,
      journalRewardedDates,
      savedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore storage quota errors and keep the app usable.
    }
  }, [
    avatarSrc,
    energy,
    energyHistory,
    habits,
    journalEntries,
    journalRewardedDates,
    level,
    motivation,
    primaryColorKey,
    profileName,
    radarStats,
    themeMode,
    xp,
    xpToNext,
  ]);

  /* ---------- XP Logic ---------- */

  const gainExperience = (amount) => {
    if (isNaN(amount) || amount <= 0) return;
    let currentXp = xp;
    let currentLevel = level;
    let threshold = xpToNext;

    let nextXp = currentXp + amount;
    let leveledUp = false;

    while (nextXp >= threshold) {
      nextXp -= threshold;
      currentLevel += 1;
      threshold = Math.round(threshold * 1.1);
      leveledUp = true;
    }

    setXp(nextXp);
    setLevel(currentLevel);
    setXpToNext(threshold);
    if (leveledUp) {
      setLevelUpFlash(true);
    }
  };

  const gainXpFromInput = (event) => {
    event.preventDefault();
    const delta = parseInt(xpInput, 10);
    gainExperience(delta);
    setXpInput("");
  };

  /* ---------- Handlers ---------- */

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarSrc(reader.result?.toString() || avatarSrc);
    };
    reader.readAsDataURL(file);
  };

  const exportData = () => {
    const snapshot = {
      version: DASHBOARD_DATA_VERSION,
      profileName,
      avatarSrc,
      themeMode,
      primaryColorKey,
      level,
      xp,
      xpToNext,
      radarStats: sanitizeRadarStats(radarStats, createDefaultDashboardData().radarStats),
      energy,
      energyHistory,
      motivation,
      habits,
      journalEntries,
      journalRewardedDates,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard-settings-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = sanitizeDashboardSnapshot(JSON.parse(String(reader.result)));
        setProfileName(parsed.profileName);
        setAvatarSrc(parsed.avatarSrc);
        setThemeMode(parsed.themeMode);
        setPrimaryColorKey(parsed.primaryColorKey);
        setLevel(parsed.level);
        setXp(parsed.xp);
        setXpToNext(parsed.xpToNext);
        setRadarStats(parsed.radarStats);
        setEnergy(parsed.energy);
        setEnergyHistory(parsed.energyHistory);
        setMotivation(parsed.motivation);
        setHabits(parsed.habits);
        setJournalEntries(parsed.journalEntries);
        setJournalRewardedDates(parsed.journalRewardedDates);
        const todayKey = toDateKey(new Date());
        const importedSelectedDate = parsed.journalEntries.some((entry) => entry.dateKey === todayKey)
          ? todayKey
          : parsed.journalEntries[0]?.dateKey ?? todayKey;
        setSelectedJournalDate(importedSelectedDate);
        const monthDate = parseDateInput(importedSelectedDate) ?? new Date();
        setCalendarMonth(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
      } catch {
        // Keep the current state if the file is invalid.
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const updateRadarVal = (id, raw) => {
    const val = parseInt(raw, 10);
    if (isNaN(val) || val < 0 || val > 100) return;
    setRadarStats((prev) =>
      prev.map((stat) =>
        stat.id === id ? { ...stat, value: val } : stat
      )
    );
  };

  const removeStat = (id) => {
    setRadarStats((prev) => prev.filter((stat) => stat.id !== id));
  };

  const addStat = (event) => {
    event.preventDefault();
    const value = parseInt(newStatVal, 10);
    if (!newStatName.trim() || isNaN(value) || value < 0 || value > 100) {
      return;
    }
    setRadarStats((prev) => [
      ...prev,
      {
        id: Date.now(),
        area: newStatName.trim(),
        value,
      },
    ]);
    setNewStatName("");
    setNewStatVal("");
  };

  const changeEnergy = (index, raw) => {
    const val = parseInt(raw, 10);
    if (isNaN(val) || val < 0 || val > 10) return;
    setEnergy((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, value: val } : entry))
    );
  };

  const nudgeEnergy = (index, nextValue) => {
    setEnergy((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, value: nextValue } : entry))
    );
  };

  const nudgeRadarVal = (id, nextValue) => {
    setRadarStats((prev) =>
      prev.map((stat) => (stat.id === id ? { ...stat, value: nextValue } : stat))
    );
  };

  const addHabit = (event) => {
    event.preventDefault();
    const name = newHabitName.trim();
    if (!name) return;
    const newHabit = {
      id: Date.now(),
      name,
      streak: 0,
      lastCompleted: null,
      completedDates: [],
    };
    setHabits((prev) => [...prev, newHabit]);
    setNewHabitName("");
  };

  const toggleHabitCompletion = (id) => {
    const todayKey = toDateKey(new Date());
    const targetHabit = habits.find((habit) => habit.id === id);
    if (!targetHabit) return;

    const shouldCompleteToday = !targetHabit.completedDates?.includes(todayKey);

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;

        const completedDatesSet = new Set(habit.completedDates ?? []);
        if (completedDatesSet.has(todayKey)) {
          completedDatesSet.delete(todayKey);
        } else {
          completedDatesSet.add(todayKey);
        }

        const completedDates = [...completedDatesSet].sort();
        const lastCompleted = completedDates.length > 0
          ? (parseDateInput(completedDates[completedDates.length - 1]) ?? new Date()).toISOString()
          : null;

        return {
          ...habit,
          completedDates,
          streak: calculateHabitStreak(completedDates),
          lastCompleted,
        };
      })
    );

    if (shouldCompleteToday) {
      gainExperience(5);
    }
  };

  const deleteHabit = (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const saveJournalEntry = (event) => {
    event.preventDefault();

    const title = journalForm.title.trim();
    const content = journalForm.content.trim();
    if (!title || !content) return;

    const now = new Date();
    const todayKey = toDateKey(now);
    const targetDateKey = selectedJournalDate || todayKey;
    const existingEntry = journalEntries.find((entry) => entry.dateKey === targetDateKey);

    if (existingEntry) {
      setJournalEntries((prev) =>
        prev.map((entry) =>
          entry.dateKey === targetDateKey
            ? {
                ...entry,
                title,
                content,
                createdAt: now.toISOString(),
              }
            : entry
        )
      );
    } else {
      const nextEntry = {
        id: Date.now(),
        dateKey: targetDateKey,
        createdAt: now.toISOString(),
        title,
        content,
      };
      const nextEntries = [nextEntry, ...journalEntries].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setJournalEntries(nextEntries);

      if (!journalRewardedDates.includes(targetDateKey)) {
        const streak = calculateJournalStreak(nextEntries);
        const bonusXp = getJournalXpBonus(streak);
        gainExperience(15 + bonusXp);
        setJournalRewardedDates((prev) => [...new Set([...prev, targetDateKey])].sort());
      }
    }

    const monthDate = parseDateInput(targetDateKey) ?? now;
    setSelectedJournalDate(targetDateKey);
    setCalendarMonth(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  };

  const openJournalEntry = (dateKey) => {
    setSelectedJournalDate(dateKey);
    const monthDate = parseDateInput(dateKey) ?? new Date();
    setCalendarMonth(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  };

  const deleteJournalEntry = (id) => {
    const targetEntry = journalEntries.find((entry) => entry.id === id);
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
    const todayKey = toDateKey(new Date());
    const fallbackDateKey =
      targetEntry?.dateKey === selectedJournalDate
        ? journalEntries.find((entry) => entry.id !== id)?.dateKey ?? todayKey
        : selectedJournalDate;
    setSelectedJournalDate(fallbackDateKey);
    const monthDate = parseDateInput(fallbackDateKey) ?? new Date();
    setCalendarMonth(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
    if (fallbackDateKey === todayKey) {
      setJournalForm({ title: "", content: "" });
    }
  };

  /* ---------- Derived Data ---------- */

  const todayJournalDateKey = toDateKey(new Date());
  const pointsRows = radarStats.map((stat) => ({
    id: stat.id,
    area: stat.area,
    value: stat.value,
  }));
  const recentJournalEntries = [...journalEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const journalStreak = calculateJournalStreak(journalEntries);
  const selectedJournalEntry =
    journalEntries.find((entry) => entry.dateKey === selectedJournalDate) ?? null;
  const isEditingPastJournalEntry =
    selectedJournalDate !== todayJournalDateKey && selectedJournalEntry?.dateKey === selectedJournalDate;
  const calendarDays = buildCalendarDays(calendarMonth);
  const calendarMonthLabel = calendarMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  /* ---------- JSX ---------- */

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <input
          ref={fileInputRef}
          id="avatar-upload-global"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <div className="max-w-[1680px] mx-auto px-4 py-6 md:px-6 md:py-8 xl:px-8">
          {/* Top title / breadcrumb */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-xl md:text-2xl xl:text-3xl font-semibold tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {profileName}&apos;s Dashboard
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Track your stats, habits, and level up your character.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={activePage === "dashboard" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setActivePage("dashboard")}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Button>
              <Button
                type="button"
                variant={activePage === "settings" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setActivePage("settings")}
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Button>
              <Badge
                variant="outline"
                className="flex items-center gap-1 px-2 py-1 text-[0.65rem] md:text-xs"
              >
                <MoonStar className="h-3 w-3" />
                {themeMode === "dark" ? "Dark mode" : "Light mode"}
              </Badge>
            </div>
          </div>

          {activePage === "dashboard" ? (
          <>
          <div className="flex flex-wrap items-start gap-4 md:gap-6 xl:gap-8">
            {/* LEFT COLUMN */}
            <section className="w-full sm:w-1/2 md:w-72 lg:w-80 xl:w-[23rem] flex flex-col gap-4 md:gap-5 xl:gap-6">
              {/* Profile Card */}
              <Card className="border border-border/70 bg-card/90 shadow-lg shadow-black/20 overflow-hidden">
                <div className="relative">
                  {/* Fixed-height avatar box */}
                  <div className="h-60 md:h-72 xl:h-80 w-full overflow-hidden bg-muted">
                    <img
                      src={avatarSrc}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Gradient overlay bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />

                  {/* Name + meta */}
                  <div className="absolute inset-x-0 bottom-0 px-3 pb-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
                        Character
                      </p>
                      <p className="text-base xl:text-lg font-semibold leading-tight">
                        {profileName}
                      </p>
                    </div>
                    {/* Level pill */}
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2 py-1 text-[0.65rem]"
                      >
                        <ChevronUp className="h-3 w-3 text-primary" />
                        Level {level}
                      </Badge>
                      <span className="text-[0.6rem] text-muted-foreground">
                        {xp} / {xpToNext} XP
                      </span>
                    </div>
                  </div>

                  {/* Upload overlay (top-left) */}
                  <div className="absolute top-2 left-2 z-10">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 rounded-full bg-background/80 backdrop-blur border border-border/60"
                          onClick={() => fileInputRef.current?.click()}
                          aria-label="Change avatar"
                        >
                          <Upload className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Upload new avatar</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </Card>

              {/* Daily Energy */}
              <Card className="border border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flame className="h-4 w-4 text-primary" />
                    Daily Energy
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Quick check-in for willpower, health, and mood.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-2 space-y-2">
                  {energy.map((entry, index) => (
                    <div
                      key={entry.key}
                      className="flex flex-col gap-2 rounded-2xl bg-muted/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border/60">
                          {React.createElement(energyIconMap[entry.key] ?? Flame, {
                            className: "h-3 w-3",
                          })}
                        </span>
                        <span className="text-sm font-medium">
                          {entry.key}
                        </span>
                      </div>
                      <div className="flex justify-end sm:justify-start">
                        <StepperControl
                          value={entry.value}
                          min={0}
                          max={10}
                          onChange={(nextValue) => nudgeEnergy(index, nextValue)}
                          ariaLabel={entry.key}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Theme Accent */}
              <Card className="border border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Theme Accent
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pick your primary accent color.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(colorThemes).map((key) => {
                      const selected = primaryColorKey === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPrimaryColorKey(key)}
                          className={[
                            "relative flex h-8 w-8 items-center justify-center rounded-full border transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            selected
                              ? "border-primary ring-2 ring-primary/60"
                              : "border-border/70 hover:border-primary/60",
                          ].join(" ")}
                          aria-label={`Use ${key} accent`}
                        >
                          <span
                            className="h-5 w-5 rounded-full"
                            style={{
                              backgroundColor: `hsl(${colorThemes[key].primary})`,
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Manage Stats (compact table-like layout) */}
              <Card className="border border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Manage Stats
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Fine-tune your character attributes (0-100).
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 pb-3 pt-2">
                  <div className="space-y-1.5">
                    {radarStats.map((stat) => (
                      <div
                        key={stat.id}
                        className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 items-center text-xs px-1 py-1 rounded bg-muted/50"
                      >
                        <span className="truncate pl-1">{stat.area}</span>
                        <div className="justify-self-end">
                          <StepperControl
                            value={stat.value}
                            min={0}
                            max={100}
                            step={5}
                            onChange={(nextValue) => nudgeRadarVal(stat.id, nextValue)}
                            ariaLabel={stat.area}
                            compact
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeStat(stat.id)}
                          aria-label={`Remove ${stat.area}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={addStat}
                    className="mt-2.5 grid grid-cols-[1.4fr_0.8fr_auto] gap-2 text-xs items-center"
                  >
                    <Input
                      placeholder="New stat"
                      value={newStatName}
                      onChange={(e) => setNewStatName(e.target.value)}
                      className="h-7 bg-background"
                    />
                    <Input
                      type="number"
                      placeholder="0-100"
                      value={newStatVal}
                      onChange={(e) => setNewStatVal(e.target.value)}
                      className="h-7 bg-background text-center"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Add stat"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </section>

            {/* CENTER COLUMN */}
            <section className="w-full sm:w-1/2 md:flex-1 flex flex-col gap-4 md:gap-5 xl:gap-6 min-w-0">
              {/* Radar Card */}
              <Card className="border border-border/70 bg-card/90 shadow-lg flex flex-col">
                <CardHeader className="px-4 pt-3 pb-2 md:pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm md:text-base flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Character Profile
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Overall balance across your core attributes.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[0.65rem] px-2">
                      Radar View
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-2 pb-3 md:px-4 md:pb-4 flex flex-col gap-3">
                  <div className="w-full h-[340px] lg:h-[420px] xl:h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={radarStats}
                        outerRadius="72%"
                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                      >
                        <PolarGrid
                          stroke={
                            isLightMode
                              ? "rgba(15,23,42,0.18)"
                              : "rgba(255,255,255,0.12)"
                          }
                        />
                        <PolarAngleAxis
                          dataKey="area"
                          tick={{
                            fill: isLightMode
                              ? "rgba(15,23,42,0.82)"
                              : "rgba(255,255,255,0.75)",
                            fontSize: 11,
                          }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={false}
                          axisLine={false}
                        />
                        <Radar
                          name="Stats"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={isLightMode ? 0.34 : 0.22}
                          strokeWidth={isLightMode ? 3 : 2.5}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--popover-foreground))",
                            fontSize: "0.75rem",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend under chart */}
                  <div className="flex flex-wrap gap-2 text-[0.7rem] mt-1">
                    {radarStats.map((stat) => (
                      <div
                        key={stat.id}
                        className="flex items-center gap-2 rounded-full bg-muted/50 px-2 py-1"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: isLightMode
                              ? "hsl(var(--primary))"
                              : "hsl(var(--foreground))",
                            opacity: isLightMode ? 0.9 : 0.7,
                          }}
                        />
                        <span className="font-medium">{stat.area}</span>
                        <span className="text-muted-foreground">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Motivation Card */}
              <Card className="border border-border/70 bg-card/90 shadow-sm flex flex-col">
                <CardHeader className="px-4 pt-3 pb-2 md:pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xs md:text-sm font-medium tracking-[0.08em] uppercase text-muted-foreground flex items-center gap-2">
                        <SeasonArcIcon className="h-3.5 w-3.5 text-primary" />
                        {seasonArcLabel}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Your current guiding phrase for this season.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Edit arc phrase"
                      onClick={() => setIsEditingArc((current) => !current)}
                    >
                      <PenLine className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-2">
                  <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-5">
                    <p className="text-2xl md:text-3xl xl:text-[2.2rem] font-semibold leading-tight text-foreground">
                      {motivation || "Write a phrase that moves you."}
                    </p>
                  </div>
                  {isEditingArc ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        placeholder="Type your arc phrase here..."
                        className="text-sm bg-background border-dashed focus-visible:border-solid"
                        rows={4}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setIsEditingArc(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="border border-border/70 bg-card/90 shadow-sm flex flex-col">
                <CardHeader className="px-4 pt-3 pb-2 md:pb-3">
                  <CardTitle className="text-sm md:text-base flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4 text-primary" />
                    Daily Energy Chart
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Today plus recent days for each daily metric.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 pb-3 md:px-4 md:pb-4">
                  <div className="h-[300px] xl:h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={energyHistory}
                        margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          stroke="rgba(255,255,255,0.08)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="day"
                          tick={{
                            fill: "rgba(255,255,255,0.68)",
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 10]}
                          tick={{
                            fill: "rgba(255,255,255,0.68)",
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--popover-foreground))",
                            fontSize: "0.75rem",
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: "12px", color: "hsl(var(--foreground))" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Willpower"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2.8}
                          dot={{ r: 2.5, fill: "hsl(var(--primary))" }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Health"
                          stroke="hsl(var(--primary))"
                          strokeOpacity={0.72}
                          strokeWidth={2.4}
                          dot={{ r: 2.5, fill: "hsl(var(--primary))", fillOpacity: 0.72 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Mood"
                          stroke="hsl(var(--primary))"
                          strokeOpacity={0.42}
                          strokeWidth={2}
                          dot={{ r: 2.5, fill: "hsl(var(--primary))", fillOpacity: 0.42 }}
                          strokeDasharray="4 4"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* RIGHT COLUMN */}
            <section className="w-full md:w-72 lg:w-80 xl:w-[24rem] flex flex-col gap-4 md:gap-5 xl:gap-6">
              {/* XP Card */}
              <Card
                className={[
                  "border border-border/70 bg-card/90 shadow-lg relative overflow-hidden",
                  levelUpFlash ? "ring-2 ring-primary/60" : "",
                ].join(" ")}
              >
                <CardHeader className="px-4 pt-3 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Experience
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Gain XP from habits and quests to level up.
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[0.65rem] px-2 py-1"
                    >
                      Lvl {level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-1 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold tracking-tight">
                        {xp}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {xpToNext} XP
                      </span>
                    </div>
                    <span className="text-[0.7rem] text-muted-foreground">
                      Need {Math.max(0, xpToNext - xp)} XP
                    </span>
                  </div>

                  {/* Thin gradient progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-primary/70 to-primary/40 transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (xp / xpToNext) * 100)}%`,
                      }}
                    />
                  </div>

                  {/* Gain XP form */}
                  <form
                    onSubmit={gainXpFromInput}
                    className="flex items-center gap-2"
                  >
                    <StepperControl
                      value={Number.isNaN(parseInt(xpInput, 10)) ? 0 : parseInt(xpInput, 10)}
                      min={0}
                      max={999}
                      step={5}
                      onChange={(nextValue) => setXpInput(String(nextValue))}
                      ariaLabel="XP input"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 px-3 text-xs"
                    >
                      Gain
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Habit Tracker */}
              <Card className="border border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="px-4 pt-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Habit Tracker
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1">
                    Daily habits reward
                    <Award className="h-3 w-3 text-amber-400" /> 5 XP each.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-2 space-y-3">
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {habits.length > 0 ? (
                      habits.map((habit) => {
                        const completedToday = isToday(habit.lastCompleted);
                        return (
                          <div
                            key={habit.id}
                            className="flex items-center gap-2 text-xs group rounded bg-muted/30 px-2 py-1.5"
                          >
                            <Checkbox
                              id={`habit-${habit.id}`}
                              checked={completedToday}
                              onCheckedChange={() =>
                                toggleHabitCompletion(habit.id)
                              }
                              className="h-4 w-4 border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                              aria-label={`Toggle ${habit.name}`}
                            />
                            <Label
                              htmlFor={`habit-${habit.id}`}
                              className={[
                                "flex-1 cursor-pointer truncate",
                                completedToday
                                  ? "line-through text-muted-foreground"
                                  : "",
                              ].join(" ")}
                            >
                              {habit.name}
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={[
                                    "flex items-center gap-1 font-mono text-[0.6rem] px-1.5 py-0.5 rounded-full",
                                    habit.streak > 0
                                      ? "bg-amber-900/40 text-amber-200"
                                      : "bg-muted/80 text-muted-foreground",
                                  ].join(" ")}
                                >
                                  <Flame className="h-3 w-3" />
                                  {habit.streak}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Current streak: {habit.streak} day
                                  {habit.streak === 1 ? "" : "s"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteHabit(habit.id)}
                              aria-label={`Delete ${habit.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[0.7rem] text-muted-foreground text-center py-2">
                        No habits yet. Add one below to start tracking.
                      </p>
                    )}
                  </div>

                  <form
                    onSubmit={addHabit}
                    className="flex items-center gap-2 pt-2 border-t border-border/60"
                  >
                    <Input
                      placeholder="New habit..."
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      className="h-8 text-xs bg-background/80"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Add new habit"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Banner Card */}
              <Card className="relative border border-border/70 bg-card/80 shadow-md overflow-hidden rounded-xl hidden sm:block">
                <div className="relative">
                  <img
                    src="https://preview.redd.it/background-art-in-the-new-trailer-looking-kinda-mid-tbh-v0-zam9o1xs0jw91.jpg?width=640&crop=smart&auto=webp&s=10c4a6606f477f486d3f397c562f38b631e505dd"
                    alt="Daily Level Up background"
                    className="w-full h-32 md:h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Daily Ritual
                    </p>
                    <p className="text-sm font-semibold">Daily Level Up</p>
                  </div>
                </div>
              </Card>

              {/* Stats Points Table */}
              <Card className="border border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="px-4 pt-3 pb-2">
                  <CardTitle className="text-sm">Stats Points</CardTitle>
                  <CardDescription className="text-xs">
                    Current values for each attribute.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-3">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4">Area</TableHead>
                        <TableHead className="text-right pr-4">
                          Value
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pointsRows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="odd:bg-muted/40 hover:bg-muted/60"
                        >
                          <TableCell className="pl-4">
                            {row.area}
                          </TableCell>
                          <TableCell className="text-right pr-4 font-medium">
                            {row.value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>
          </div>

          <section className="mt-6 xl:mt-8 grid gap-4 xl:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <BookOpenText className="h-4 w-4 text-primary" />
                      Daily Journal
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Write today&apos;s page, earn 15 XP, and build a writing streak.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[0.7rem] px-2 py-1">
                    Streak {journalStreak}d
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <form className="space-y-3" onSubmit={saveJournalEntry}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[0.7rem] px-2 py-1">
                      {isEditingPastJournalEntry
                        ? `Editing ${formatJournalDate(selectedJournalDate)}`
                        : "Today"}
                    </Badge>
                    {selectedJournalDate !== todayJournalDateKey ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => {
                          setSelectedJournalDate(todayJournalDateKey);
                          const today = new Date();
                          setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                        }}
                      >
                        Back to today
                      </Button>
                    ) : null}
                  </div>
                  <label className="block space-y-2">
                    <span className="text-xs text-muted-foreground">Title</span>
                    <Input
                      value={journalForm.title}
                      onChange={(e) =>
                        setJournalForm((current) => ({
                          ...current,
                          title: e.target.value,
                        }))
                      }
                      className="bg-background"
                      placeholder="What mattered today?"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-xs text-muted-foreground">Entry</span>
                    <Textarea
                      rows={8}
                      value={journalForm.content}
                      onChange={(e) =>
                        setJournalForm((current) => ({
                          ...current,
                          content: e.target.value,
                        }))
                      }
                      className="bg-background"
                      placeholder="Write the day, the feeling, and the lesson."
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="submit">
                      <PlusCircle className="h-4 w-4" />
                      {isEditingPastJournalEntry ? "Update selected page" : "Save today&apos;s page"}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {isEditingPastJournalEntry
                        ? "Editing a previous entry does not award XP again."
                        : "Base reward: 15 XP + streak bonus"}
                    </span>
                  </div>
                </form>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Previous pages</h3>
                    <span className="text-xs text-muted-foreground">
                      {recentJournalEntries.length} saved
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {recentJournalEntries.map((entry) => (
                      <article
                        key={entry.id}
                        className={[
                          "rounded-2xl border px-3 py-3 transition-colors",
                          selectedJournalDate === entry.dateKey
                            ? "border-primary bg-primary/10"
                            : "border-border/70 bg-muted/40",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{entry.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatJournalDate(entry.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-xs"
                              onClick={() => openJournalEntry(entry.dateKey)}
                            >
                              Open
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteJournalEntry(entry.id)}
                              aria-label={`Delete journal entry ${entry.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {entry.content}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      Journal Calendar
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Tap a day with an entry to reopen that page.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() - 1,
                          1
                        )
                      )
                    }
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <p className="text-sm font-semibold capitalize">
                    {calendarMonthLabel}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth() + 1,
                          1
                        )
                      )
                    }
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="h-11 rounded-xl bg-transparent" />;
                    }

                    const hasEntry = journalEntries.some((entry) => entry.dateKey === day.dateKey);
                    const isSelected = selectedJournalDate === day.dateKey;

                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        disabled={!hasEntry}
                        onClick={() => openJournalEntry(day.dateKey)}
                        className={[
                          "h-11 rounded-xl border text-sm font-medium transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : hasEntry
                            ? "border-border/70 bg-muted/50 hover:border-primary/60 hover:bg-muted"
                            : "border-border/30 bg-background text-muted-foreground opacity-45",
                        ].join(" ")}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                  {selectedJournalEntry ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {selectedJournalEntry.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatJournalDate(selectedJournalEntry.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm leading-6">
                        {selectedJournalEntry.content}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No journal page selected yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
          </>
          ) : (
          <section className="grid gap-4 md:grid-cols-2">
            <Card className="border border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-base">Profile Settings</CardTitle>
                <CardDescription className="text-xs">
                  Update your main identity details.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 space-y-4">
                <label className="space-y-2 block">
                  <span className="text-xs text-muted-foreground">Display name</span>
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value.slice(0, 32))}
                    className="bg-background"
                    placeholder="Your name"
                  />
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarSrc}
                    alt="Profile preview"
                    className="h-16 w-16 rounded-xl object-cover border border-border/70"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Change Photo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-base">Appearance</CardTitle>
                <CardDescription className="text-xs">
                  Choose global mode and accent.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground block">Mode</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={themeMode === "dark" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setThemeMode("dark")}
                    >
                      Dark
                    </Button>
                    <Button
                      type="button"
                      variant={themeMode === "light" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setThemeMode("light")}
                    >
                      Light
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground block">Accent</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(colorThemes).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPrimaryColorKey(key)}
                        className={[
                          "relative flex h-8 w-8 items-center justify-center rounded-full border transition-all",
                          primaryColorKey === key
                            ? "border-primary ring-2 ring-primary/60"
                            : "border-border/70 hover:border-primary/60",
                        ].join(" ")}
                        aria-label={`Use ${key} accent`}
                      >
                        <span
                          className="h-5 w-5 rounded-full"
                          style={{ backgroundColor: `hsl(${colorThemes[key].primary})` }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-base">Data</CardTitle>
                <CardDescription className="text-xs">
                  Export or import your current dashboard data.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 space-y-3">
                <Button type="button" variant="secondary" onClick={exportData}>
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => importInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={importData}
                />
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-base">Quick Summary</CardTitle>
                <CardDescription className="text-xs">
                  Main settings currently in use.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-2 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <strong>{profileName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Theme mode</span>
                  <strong className="capitalize">{themeMode}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Accent</span>
                  <strong className="capitalize">{primaryColorKey}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Habits tracked</span>
                  <strong>{habits.length}</strong>
                </div>
              </CardContent>
            </Card>
          </section>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ---------- Progress Bar (kept simple) ---------- */
function ProgressBar({ filled = 0 }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted/50 relative overflow-hidden">
      <span
        className="absolute inset-y-0 left-0 bg-primary transition-all duration-700"
        style={{ width: `${Math.min(100, filled)}%` }}
      />
    </div>
  );
}

export default GamifiedStatsDashboard;


