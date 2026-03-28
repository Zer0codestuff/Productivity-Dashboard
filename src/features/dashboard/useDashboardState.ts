import { useEffect, useMemo, useState } from "react";
import {
  buildCalendarDays,
  calculateHabitStreak,
  calculateJournalStreak,
  colorThemes,
  createExportSnapshot,
  getJournalXpBonus,
  getSeasonArcIcon,
  getSeasonArcLabel,
  parseDateInput,
  readStoredDashboardData,
  sanitizeDashboardSnapshot,
  syncTodayHistory,
  toDateKey,
  writeStoredDashboardData,
  type DashboardData,
} from "./dashboard-data";
import type { MobileDashboardTab } from "./dashboard-ui";

export function useDashboardState() {
  const [initialData] = useState(() => readStoredDashboardData());

  const [level, setLevel] = useState(initialData.level);
  const [xp, setXp] = useState(initialData.xp);
  const [xpToNext, setXpToNext] = useState(initialData.xpToNext);
  const [xpInput, setXpInput] = useState("");
  const [levelUpFlash, setLevelUpFlash] = useState(false);

  const [avatarSrc, setAvatarSrc] = useState(initialData.avatarSrc);
  const [profileName, setProfileName] = useState(initialData.profileName);
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileDashboardTab, setMobileDashboardTab] =
    useState<MobileDashboardTab>("character");
  const [themeMode, setThemeMode] = useState(initialData.themeMode);

  const [radarStats, setRadarStats] = useState(initialData.radarStats);
  const [newStatName, setNewStatName] = useState("");
  const [newStatVal, setNewStatVal] = useState("");

  const [energy, setEnergy] = useState(initialData.energy);
  const [energyHistory, setEnergyHistory] = useState(initialData.energyHistory);

  const [motivation, setMotivation] = useState(initialData.motivation);
  const [isEditingArc, setIsEditingArc] = useState(false);

  const [primaryColorKey, setPrimaryColorKey] = useState(initialData.primaryColorKey);

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

  const seasonArcLabel = getSeasonArcLabel(new Date());
  const SeasonArcIcon = getSeasonArcIcon(new Date());
  const isLightMode = themeMode === "light";

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

  const gainExperience = (amount: number) => {
    if (Number.isNaN(amount) || amount <= 0) return;
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

  const gainXpFromInput = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const delta = parseInt(xpInput, 10);
    gainExperience(delta);
    setXpInput("");
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        const importedSelectedDate = parsed.journalEntries.some(
          (entry) => entry.dateKey === todayKey
        )
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

  const removeStat = (id: number) => {
    setRadarStats((prev) => prev.filter((stat) => stat.id !== id));
  };

  const addStat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = parseInt(newStatVal, 10);
    if (!newStatName.trim() || Number.isNaN(value) || value < 0 || value > 100) {
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

  const nudgeEnergy = (index: number, nextValue: number) => {
    setEnergy((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, value: nextValue } : entry))
    );
  };

  const nudgeRadarVal = (id: number, nextValue: number) => {
    setRadarStats((prev) =>
      prev.map((stat) => (stat.id === id ? { ...stat, value: nextValue } : stat))
    );
  };

  const addHabit = (event: React.FormEvent<HTMLFormElement>) => {
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

  const toggleHabitDate = (id: number, dateInput: unknown) => {
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
        const lastCompleted =
          completedDates.length > 0
            ? (
                parseDateInput(completedDates[completedDates.length - 1]) ?? new Date()
              ).toISOString()
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

  const toggleHabitCompletion = (id: number) => {
    toggleHabitDate(id, new Date());
  };

  const deleteHabit = (id: number) => {
    const remainingHabits = habits.filter((habit) => habit.id !== id);
    setHabits(remainingHabits);
    if (selectedHabitId === id) {
      setSelectedHabitId(remainingHabits[0]?.id ?? null);
    }
  };

  const saveJournalEntry = (event: React.FormEvent<HTMLFormElement>) => {
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

  const openJournalEntry = (dateKey: string) => {
    setSelectedJournalDate(dateKey);
    const monthDate = parseDateInput(dateKey) ?? new Date();
    setCalendarMonth(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  };

  const deleteJournalEntry = (id: number) => {
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
    selectedJournalDate !== todayJournalDateKey &&
    selectedJournalEntry?.dateKey === selectedJournalDate;
  const calendarDays = buildCalendarDays(calendarMonth);
  const calendarMonthLabel = calendarMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return {
    activePage,
    addHabit,
    addStat,
    avatarSrc,
    calendarDays,
    calendarMonth,
    calendarMonthLabel,
    deleteHabit,
    deleteJournalEntry,
    energy,
    energyHistory,
    exportData,
    gainXpFromInput,
    habits,
    handleAvatarChange,
    importData,
    isEditingArc,
    isEditingPastJournalEntry,
    isLightMode,
    journalEntries,
    journalForm,
    journalStreak,
    level,
    levelUpFlash,
    mobileDashboardTab,
    motivation,
    newHabitName,
    newStatName,
    newStatVal,
    nudgeEnergy,
    nudgeRadarVal,
    openJournalEntry,
    primaryColorKey,
    profileName,
    radarStats,
    recentJournalEntries,
    removeStat,
    saveJournalEntry,
    SeasonArcIcon,
    seasonArcLabel,
    selectedHabit,
    selectedHabitCalendarDays,
    selectedHabitCompletedDates,
    selectedHabitId,
    selectedHabitMonthCount,
    selectedHabitMonthLabel,
    selectedJournalDate,
    selectedJournalEntry,
    setActivePage,
    setCalendarMonth,
    setHabitCalendarMonth,
    setIsEditingArc,
    setJournalForm,
    setMobileDashboardTab,
    setMotivation,
    setNewHabitName,
    setNewStatName,
    setNewStatVal,
    setPrimaryColorKey,
    setProfileName,
    setSelectedHabitId,
    setSelectedJournalDate,
    setThemeMode,
    themeMode,
    todayJournalDateKey,
    toggleHabitCompletion,
    toggleHabitDate,
    xp,
    xpInput,
    xpToNext,
    setXpInput,
  };
}
