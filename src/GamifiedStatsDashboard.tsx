
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Heart,
  LayoutDashboard,
  LineChart as LineChartIcon,
  Minus,
  Palette,
  PenLine,
  Plus,
  PlusCircle,
  Settings,
  Target,
  Trash2,
  Upload,
  User,
  Zap,
} from "lucide-react";
import {
  buildCalendarDays,
  calculateHabitStreak,
  calculateJournalStreak,
  colorThemes,
  createExportSnapshot,
  formatJournalDate,
  getJournalXpBonus,
  getSeasonArcIcon,
  getSeasonArcLabel,
  isToday,
  parseDateInput,
  readStoredDashboardData,
  sanitizeDashboardSnapshot,
  syncTodayHistory,
  toDateKey,
  writeStoredDashboardData,
  type DashboardData,
} from "./features/dashboard/dashboard-data";

const energyIconMap = {
  Willpower: Zap,
  Health: Heart,
  Mood: Flame,
};

/** Willpower = giallo, Health = rosso, Mood = arancione (stesso schema nel grafico). */
const ENERGY_METRIC_COLORS: Record<string, string> = {
  Willpower: "#facc15",
  Health: "#ef4444",
  Mood: "#f97316",
};
const themeColorKeys = Object.keys(colorThemes) as Array<keyof typeof colorThemes>;
const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Streak 0 = muted; da 1 in su arancione che tende al rosso all'aumentare dello streak (hue ~32 → 0). */
function getStreakTextStyle(streak: number): React.CSSProperties {
  if (streak <= 0) {
    return { color: "hsl(var(--muted-foreground))" };
  }
  const t = Math.min(streak / 20, 1);
  const hue = 32 - t * 32;
  return { color: `hsl(${hue} 88% 54%)` };
}

function getStreakBadgeStyle(streak: number): React.CSSProperties {
  if (streak <= 0) {
    return {
      backgroundColor: "hsl(var(--muted) / 0.5)",
      color: "hsl(var(--muted-foreground))",
      borderColor: "hsl(var(--border))",
    };
  }
  const t = Math.min(streak / 20, 1);
  const hue = 32 - t * 32;
  return {
    backgroundColor: `hsl(${hue} 45% 18%)`,
    color: `hsl(${hue} 92% 88%)`,
    borderColor: `hsl(${hue} 55% 35%)`,
  };
}

function StepperControl({
  value,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel,
  compact = false,
}) {
  /** Touch-friendly on small screens; compact size from `sm` up (44px min tap target on mobile). */
  const buttonSize = compact
    ? "h-11 w-11 min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0"
    : "h-11 w-11 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0";
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
  /** Mobile-only: which dashboard region is visible below `lg` (desktop shows all). */
  const [mobileDashboardTab, setMobileDashboardTab] = useState<
    "character" | "stats" | "habits" | "journal"
  >("character");
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
  const [selectedHabitId, setSelectedHabitId] = useState(
    () => initialData.habits[0]?.id ?? null
  );
  const [habitCalendarMonth, setHabitCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
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
  const dashboardData = useMemo(
    () =>
      ({
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
      }) satisfies DashboardData,
    [
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
    ]
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

    setJournalForm({ title: "", content: "" });
  }, [journalEntries, selectedJournalDate]);

  useEffect(() => {
    writeStoredDashboardData(dashboardData);
  }, [dashboardData]);

  /* ---------- XP Logic ---------- */

  const gainExperience = (amount) => {
    if (isNaN(amount) || amount <= 0) return;
    const currentXp = xp;
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
    const snapshot = createExportSnapshot(dashboardData);

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
        setSelectedHabitId(parsed.habits[0]?.id ?? null);
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
    setSelectedHabitId((current) => current ?? newHabit.id);
    setNewHabitName("");
  };

  const toggleHabitDate = (id, dateInput) => {
    const targetDateKey = toDateKey(dateInput);
    if (!targetDateKey) return;

    const todayKey = toDateKey(new Date());
    const targetHabit = habits.find((habit) => habit.id === id);
    if (!targetHabit) return;

    const shouldAwardXp =
      targetDateKey === todayKey &&
      !targetHabit.completedDates?.includes(targetDateKey);

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;

        const completedDatesSet = new Set(habit.completedDates ?? []);
        if (completedDatesSet.has(targetDateKey)) {
          completedDatesSet.delete(targetDateKey);
        } else {
          completedDatesSet.add(targetDateKey);
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

    if (shouldAwardXp) {
      gainExperience(5);
    }
  };

  const toggleHabitCompletion = (id) => {
    toggleHabitDate(id, new Date());
  };

  const deleteHabit = (id) => {
    const remainingHabits = habits.filter((habit) => habit.id !== id);
    setHabits(remainingHabits);
    if (selectedHabitId === id) {
      setSelectedHabitId(remainingHabits[0]?.id ?? null);
    }
  };

  const saveJournalEntry = (event) => {
    event.preventDefault();

    const title = journalForm.title.trim();
    const content = journalForm.content.trim();
    if (!title || !content) return;

    const now = new Date();
    const todayKey = toDateKey(now);
    const targetDateKey = selectedJournalDate || todayKey;

    setJournalEntries((prev) => {
      const existingEntry = prev.find((entry) => entry.dateKey === targetDateKey);

      if (existingEntry) {
        return prev.map((entry) =>
          entry.dateKey === targetDateKey
            ? {
                ...entry,
                title,
                content,
                createdAt: now.toISOString(),
              }
            : entry
        );
      }

      const nextEntry = {
        id: Date.now(),
        dateKey: targetDateKey,
        createdAt: now.toISOString(),
        title,
        content,
      };
      const nextEntries = [nextEntry, ...prev].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      queueMicrotask(() => {
        setJournalRewardedDates((rewarded) => {
          if (rewarded.includes(targetDateKey)) return rewarded;
          const streak = calculateJournalStreak(nextEntries);
          gainExperience(15 + getJournalXpBonus(streak));
          return [...new Set([...rewarded, targetDateKey])].sort();
        });
      });

      return nextEntries;
    });

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
  const selectedHabit =
    habits.find((habit) => habit.id === selectedHabitId) ?? habits[0] ?? null;
  const selectedHabitCompletedDates = new Set(selectedHabit?.completedDates ?? []);
  const selectedHabitCalendarDays = buildCalendarDays(habitCalendarMonth);
  const selectedHabitMonthLabel = habitCalendarMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const selectedHabitMonthCount = selectedHabitCalendarDays.filter(
    (day) => day && selectedHabitCompletedDates.has(day.dateKey)
  ).length;
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
        <div
          className={[
            "max-w-[1680px] mx-auto px-4 py-6 md:px-6 md:py-8 xl:px-8",
            activePage === "dashboard" ? "max-lg:pb-24" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Top title / breadcrumb */}
          <div className="mb-4 flex flex-col gap-4 max-[479px]:items-stretch md:mb-6 min-[480px]:flex-row min-[480px]:items-start min-[480px]:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl xl:text-3xl">
                {`${profileName}'s Dashboard`}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Track your stats, habits, and level up your character.
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 max-[479px]:justify-between min-[480px]:w-auto">
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
            </div>
          </div>

          {activePage === "dashboard" ? (
          <>
          <div className="flex flex-col gap-4 md:gap-6 xl:gap-8 lg:flex-row lg:flex-nowrap lg:items-stretch">
            {/* LEFT COLUMN — Character (profile, energy, theme, manage stats) */}
            <section
              className={[
                "flex min-h-0 w-full flex-col gap-4 md:gap-5 xl:gap-6 lg:w-80 lg:shrink-0 xl:w-[23rem]",
                mobileDashboardTab !== "character" ? "max-lg:hidden" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Profile Card */}
              <Card className="border border-border/70 bg-card/90 shadow-lg shadow-black/20 overflow-hidden">
                <div className="relative">
                  {/* Square avatar (lato = larghezza card) */}
                  <div className="aspect-square w-full overflow-hidden bg-muted">
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
                      className="flex flex-row flex-nowrap items-center justify-between gap-2 rounded-xl bg-muted/50 px-2 py-2 sm:gap-3 sm:rounded-2xl sm:px-3"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background"
                          style={{
                            color: ENERGY_METRIC_COLORS[entry.key] ?? "hsl(var(--primary))",
                          }}
                        >
                          {React.createElement(energyIconMap[entry.key] ?? Flame, {
                            className: "h-3 w-3",
                          })}
                        </span>
                        <span className="truncate text-sm font-medium">{entry.key}</span>
                      </div>
                      <div className="shrink-0 scale-90 origin-right sm:scale-100">
                        <StepperControl
                          value={entry.value}
                          min={0}
                          max={10}
                          onChange={(nextValue) => nudgeEnergy(index, nextValue)}
                          ariaLabel={entry.key}
                          compact
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
                    {themeColorKeys.map((key) => {
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

              {/* Manage Stats — grows with column so bottom aligns with center/right; XP-style bars */}
              <Card className="flex min-h-0 flex-1 flex-col border border-border/70 bg-card/90 shadow-sm lg:min-h-[14rem]">
                <CardHeader className="shrink-0 py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Manage Stats
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Fine-tune your character attributes (0-100).
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-0">
                  <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                    {radarStats.map((stat) => {
                      const pct = Math.min(100, Math.max(0, stat.value));
                      return (
                        <div
                          key={stat.id}
                          className="rounded-xl border border-border/40 bg-muted/40 px-2.5 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-xs font-medium">
                              {stat.area}
                            </span>
                            <StepperControl
                              value={stat.value}
                              min={0}
                              max={100}
                              step={1}
                              onChange={(nextValue) => nudgeRadarVal(stat.id, nextValue)}
                              ariaLabel={stat.area}
                              compact
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeStat(stat.id)}
                              aria-label={`Remove ${stat.area}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-gradient-to-r from-primary via-primary/70 to-primary/40 transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <form
                    onSubmit={addStat}
                    className="mt-3 shrink-0 grid grid-cols-[1.4fr_0.8fr_auto] gap-2 border-t border-border/50 pt-3 text-xs items-center"
                  >
                    <Input
                      placeholder="New stat"
                      value={newStatName}
                      onChange={(e) => setNewStatName(e.target.value)}
                      className="h-8 bg-background"
                    />
                    <Input
                      type="number"
                      placeholder="0-100"
                      value={newStatVal}
                      onChange={(e) => setNewStatVal(e.target.value)}
                      className="h-8 bg-background text-center"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Add stat"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </section>

            {/* CENTER COLUMN — Stats (radar, arc, energy chart) */}
            <section
              className={[
                "flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 md:gap-5 xl:gap-6",
                mobileDashboardTab !== "stats" ? "max-lg:hidden" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
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
                  <div className="h-[220px] w-full sm:h-[280px] md:h-[340px] lg:h-[420px] xl:h-[500px]">
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
                          className="h-2 w-2 shrink-0 rounded-full bg-primary"
                          aria-hidden
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

              <Card className="flex flex-1 flex-col border border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="shrink-0 px-4 pt-3 pb-2 md:pb-3">
                  <CardTitle className="text-sm md:text-base flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4 text-primary" />
                    Daily Energy Chart
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Today plus recent days for each daily metric.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex min-h-0 flex-1 flex-col px-2 pb-3 md:px-4 md:pb-4">
                  {/*
                    Mobile: altezza fissa — Recharts con height 100% fallisce se il parent flex-1 non ha altezza calcolabile.
                    Desktop: flex-1 come prima.
                  */}
                  <div className="h-[280px] w-full sm:h-[300px] lg:h-auto lg:min-h-[260px] lg:flex-1 lg:min-h-0 xl:min-h-[320px]">
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
                          name="Willpower"
                          stroke={ENERGY_METRIC_COLORS.Willpower}
                          strokeWidth={2.8}
                          dot={{ r: 2.5, fill: ENERGY_METRIC_COLORS.Willpower }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Health"
                          name="Health"
                          stroke={ENERGY_METRIC_COLORS.Health}
                          strokeWidth={2.6}
                          dot={{ r: 2.5, fill: ENERGY_METRIC_COLORS.Health }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Mood"
                          name="Mood"
                          stroke={ENERGY_METRIC_COLORS.Mood}
                          strokeWidth={2.4}
                          dot={{ r: 2.5, fill: ENERGY_METRIC_COLORS.Mood }}
                          strokeDasharray="5 4"
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* RIGHT COLUMN — Habits (XP, list, banner, habit calendar) */}
            <section
              className={[
                "flex w-full flex-col gap-4 md:gap-5 xl:gap-6 md:w-72 lg:w-80 lg:shrink-0 xl:w-[24rem]",
                mobileDashboardTab !== "habits" ? "max-lg:hidden" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
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
                                  className="flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[0.6rem] tabular-nums"
                                  style={getStreakBadgeStyle(habit.streak)}
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

              {/* Habit Calendar */}
              <Card className="flex flex-1 flex-col border border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="shrink-0 px-4 pt-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Habit Calendar
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select a habit and tap a square to mark that day as done or undone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col px-4 pb-4 pt-2 space-y-4">
                  {habits.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {habits.map((habit) => {
                          const isSelected = selectedHabit?.id === habit.id;

                          return (
                            <button
                              key={habit.id}
                              type="button"
                              onClick={() => setSelectedHabitId(habit.id)}
                              className={[
                                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                isSelected
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border/70 bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                              ].join(" ")}
                              aria-label={`Select ${habit.name}`}
                            >
                              <span className="max-w-[11rem] truncate font-medium">
                                {habit.name}
                              </span>
                              <span
                                className="rounded-full border border-border/60 bg-background/80 px-1.5 py-0.5 text-[0.65rem] font-mono tabular-nums"
                                style={getStreakTextStyle(habit.streak)}
                              >
                                {habit.streak}d
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {selectedHabit ? (
                        <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/30 p-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">{selectedHabit.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Press a day square to toggle completion history for that habit.
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[0.7rem]">
                              <span
                                className="inline-flex items-center gap-1 rounded-full border px-2 py-1 font-medium tabular-nums shadow-sm"
                                style={getStreakBadgeStyle(selectedHabit.streak)}
                              >
                                <Flame className="h-3 w-3 shrink-0 opacity-90" />
                                Streak {selectedHabit.streak}d
                              </span>
                              <Badge variant="outline" className="px-2 py-1 tabular-nums">
                                {selectedHabitMonthCount} this month
                              </Badge>
                              <Badge variant="outline" className="px-2 py-1 tabular-nums">
                                {selectedHabit.completedDates.length} total
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                setHabitCalendarMonth(
                                  (current) =>
                                    new Date(
                                      current.getFullYear(),
                                      current.getMonth() - 1,
                                      1
                                    )
                                )
                              }
                              aria-label="Previous habit month"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                              {selectedHabitMonthLabel}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                setHabitCalendarMonth(
                                  (current) =>
                                    new Date(
                                      current.getFullYear(),
                                      current.getMonth() + 1,
                                      1
                                    )
                                )
                              }
                              aria-label="Next habit month"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-[0.65rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                            {weekDayLabels.map((dayLabel) => (
                              <span
                                key={dayLabel}
                                className="flex h-7 items-center justify-center"
                              >
                                {dayLabel}
                              </span>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {selectedHabitCalendarDays.map((day, index) => {
                              if (!day) {
                                return (
                                  <div
                                    key={`habit-empty-${index}`}
                                    className="min-h-[3rem] rounded-lg border border-transparent"
                                  />
                                );
                              }

                              const isCompleted = selectedHabitCompletedDates.has(
                                day.dateKey
                              );
                              const isCurrentDay =
                                day.dateKey === todayJournalDateKey;

                              return (
                                <button
                                  key={day.dateKey}
                                  type="button"
                                  onClick={() =>
                                    toggleHabitDate(selectedHabit.id, day.dateKey)
                                  }
                                  className={[
                                    "group flex min-h-[3rem] flex-col items-stretch justify-between gap-0.5 rounded-lg border p-1.5 text-center transition-all",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    isCompleted
                                      ? "border-primary/80 bg-primary/12 shadow-sm"
                                      : "border-border/60 bg-background/70 hover:border-primary/35 hover:bg-muted/40",
                                    isCurrentDay
                                      ? "ring-2 ring-primary/45 ring-offset-1 ring-offset-background"
                                      : "",
                                  ].join(" ")}
                                  aria-label={`Toggle ${selectedHabit.name} on ${day.dateKey}`}
                                >
                                  <span
                                    className={[
                                      "tabular-nums text-[0.7rem] font-semibold leading-none",
                                      isCurrentDay
                                        ? "text-primary"
                                        : "text-muted-foreground group-hover:text-foreground",
                                    ].join(" ")}
                                  >
                                    {day.label}
                                  </span>
                                  <span className="flex min-h-[1.25rem] flex-1 items-center justify-center">
                                    {isCompleted ? (
                                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-[0.7rem] font-bold leading-none text-primary-foreground shadow-inner">
                                        ✓
                                      </span>
                                    ) : (
                                      <span className="h-5 w-5 rounded-md border border-dashed border-border/80 bg-muted/30 transition-colors group-hover:border-primary/50 group-hover:bg-muted/50" />
                                    )}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-5 text-center">
                      <p className="text-sm font-medium">No habits yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Add a habit above to start managing its calendar.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          <section
            className={[
              "mt-4 xl:mt-6 grid gap-4 lg:grid-cols-[1fr_0.85fr] lg:gap-5",
              mobileDashboardTab !== "journal" ? "max-lg:hidden" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Card className="overflow-hidden border border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="border-b border-border/60 bg-muted/15 px-4 py-4 md:px-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <BookOpenText className="h-5 w-5 text-primary" />
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="text-base md:text-lg leading-tight">
                        Daily Journal
                      </CardTitle>
                      <CardDescription className="text-xs leading-snug line-clamp-2">
                        Save to persist locally · XP on first save of the day.
                      </CardDescription>
                    </div>
                  </div>
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-xs font-medium tabular-nums"
                    style={getStreakBadgeStyle(journalStreak)}
                  >
                    <PenLine className="h-3.5 w-3.5 opacity-90" />
                    {journalStreak}d
                  </span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 px-4 pb-4 pt-4 md:px-5 md:pb-5 lg:grid-cols-2 lg:gap-5">
                <form
                  className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4 shadow-inner"
                  onSubmit={saveJournalEntry}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={[
                        "border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs",
                        isEditingPastJournalEntry ? "" : "text-primary",
                      ].join(" ")}
                    >
                      {isEditingPastJournalEntry
                        ? `Edit ${formatJournalDate(selectedJournalDate)}`
                        : "Today"}
                    </Badge>
                    {selectedJournalDate !== todayJournalDateKey ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => {
                          setSelectedJournalDate(todayJournalDateKey);
                          const today = new Date();
                          setCalendarMonth(
                            new Date(today.getFullYear(), today.getMonth(), 1)
                          );
                        }}
                      >
                        Today
                      </Button>
                    ) : null}
                  </div>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Title
                    </span>
                    <Input
                      value={journalForm.title}
                      onChange={(e) =>
                        setJournalForm((current) => ({
                          ...current,
                          title: e.target.value,
                        }))
                      }
                      className="h-10 border-border/80 bg-background text-sm focus-visible:ring-primary/25"
                      placeholder="What mattered today?"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Entry
                    </span>
                    <Textarea
                      rows={6}
                      value={journalForm.content}
                      onChange={(e) =>
                        setJournalForm((current) => ({
                          ...current,
                          content: e.target.value,
                        }))
                      }
                      onFocus={(e) => {
                        e.target.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                      className="min-h-[7.5rem] resize-y border-border/80 bg-background text-sm leading-relaxed focus-visible:ring-primary/25"
                      placeholder="A few lines are enough…"
                    />
                  </label>
                  <div className="flex flex-col gap-2 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="submit" className="w-full sm:w-auto">
                      <PlusCircle className="h-4 w-4" />
                      {isEditingPastJournalEntry ? "Update" : "Save"}
                    </Button>
                    <p className="text-xs text-muted-foreground sm:text-right">
                      {isEditingPastJournalEntry
                        ? "No XP on past edits."
                        : "15 XP + streak bonus on first save."}
                    </p>
                  </div>
                </form>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Recent
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-muted-foreground">
                      {recentJournalEntries.length}
                    </span>
                  </div>
                  <div className="max-h-[18rem] space-y-2 overflow-y-auto pr-1">
                    {recentJournalEntries.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/15 px-4 py-4 text-center">
                        <p className="text-sm text-muted-foreground">No entries yet</p>
                      </div>
                    ) : (
                      recentJournalEntries.map((entry) => (
                        <article
                          key={entry.id}
                          className={[
                            "rounded-xl border px-3 py-2.5 transition-colors",
                            selectedJournalDate === entry.dateKey
                              ? "border-primary/60 bg-primary/10"
                              : "border-border/60 bg-muted/30 hover:bg-muted/45",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{entry.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatJournalDate(entry.createdAt)}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 px-2.5 text-xs"
                                onClick={() => openJournalEntry(entry.dateKey)}
                              >
                                Open
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteJournalEntry(entry.id)}
                                aria-label={`Delete journal entry ${entry.title}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <p className="mt-1.5 text-xs leading-snug text-muted-foreground line-clamp-3">
                            {entry.content}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="border-b border-border/60 px-4 py-3 md:px-5">
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <CardTitle className="text-base md:text-lg">Calendar</CardTitle>
                    <CardDescription className="text-xs">
                      Tap days with a dot to open.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3.5 px-4 pb-4 pt-3 md:px-5 md:pb-5">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
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
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {calendarMonthLabel}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
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

                <div className="grid grid-cols-7 gap-0.5 text-center text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  {weekDayLabels.map((day) => (
                    <span key={day} className="py-1">
                      {day}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="h-9 rounded-md bg-transparent sm:h-10" />;
                    }

                    const hasEntry = journalEntries.some(
                      (entry) => entry.dateKey === day.dateKey
                    );
                    const isSelected = selectedJournalDate === day.dateKey;
                    const isTodayCell = day.dateKey === todayJournalDateKey;

                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        disabled={!hasEntry}
                        onClick={() => openJournalEntry(day.dateKey)}
                        className={[
                          "relative flex h-9 flex-col items-center justify-center gap-0.5 rounded-md border text-xs font-semibold tabular-nums transition-all sm:h-10 sm:text-sm",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : hasEntry
                              ? "border-border/70 bg-background/80 hover:border-primary/50 hover:bg-muted/60"
                              : "cursor-not-allowed border-border/40 bg-muted/15 text-muted-foreground opacity-45",
                          !isSelected && isTodayCell && hasEntry ? "ring-1 ring-primary/35" : "",
                        ].join(" ")}
                      >
                        {day.label}
                        {hasEntry ? (
                          <span
                            className={[
                              "h-1 w-1 rounded-full",
                              isSelected ? "bg-primary-foreground/90" : "bg-primary/80",
                            ].join(" ")}
                          />
                        ) : (
                          <span className="h-1 w-1 rounded-full bg-transparent" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div
                  className={[
                    "rounded-xl border p-4 text-sm",
                    selectedJournalEntry
                      ? "border-primary/25 bg-primary/5"
                      : "border-border/70 bg-muted/25",
                  ].join(" ")}
                >
                  {selectedJournalEntry ? (
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-tight">
                          {selectedJournalEntry.title}
                        </p>
                        <Badge variant="outline" className="shrink-0 px-2 py-0.5 text-xs">
                          Preview
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatJournalDate(selectedJournalEntry.createdAt)}
                      </p>
                      <p className="line-clamp-5 text-sm leading-relaxed text-foreground/90">
                        {selectedJournalEntry.content}
                      </p>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      Select a day with an entry, or save today.
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
                    {themeColorKeys.map((key) => (
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

        {/* Mobile dashboard tab bar — only below lg; desktop shows full layout */}
        {activePage === "dashboard" ? (
          <nav
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
            aria-label="Dashboard sections"
          >
            <div className="mx-auto flex max-w-[1680px] items-stretch justify-around gap-1 px-2">
              {[
                { id: "character" as const, label: "Character", icon: User },
                { id: "stats" as const, label: "Stats", icon: BarChart2 },
                { id: "habits" as const, label: "Habits", icon: Target },
                { id: "journal" as const, label: "Journal", icon: BookOpenText },
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  type="button"
                  variant={mobileDashboardTab === id ? "default" : "ghost"}
                  size="sm"
                  className="flex h-auto min-w-0 flex-1 flex-col gap-0.5 py-2 px-1 text-[0.65rem] font-medium"
                  onClick={() => setMobileDashboardTab(id)}
                >
                  <Icon className="mx-auto h-5 w-5 shrink-0" aria-hidden />
                  <span className="truncate">{label}</span>
                </Button>
              ))}
            </div>
          </nav>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

export default GamifiedStatsDashboard;


