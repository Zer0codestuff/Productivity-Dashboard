import type { Habit, JournalEntry, TaskItem } from "../types";

const BASE_XP_TO_LEVEL = 100;
const XP_GROWTH = 1.15;

export function calculateLevel(totalXp: number) {
  let level = 1;
  let remainingXp = totalXp;
  let xpToNext = BASE_XP_TO_LEVEL;

  while (remainingXp >= xpToNext) {
    remainingXp -= xpToNext;
    level += 1;
    xpToNext = Math.round(xpToNext * XP_GROWTH);
  }

  return {
    level,
    xpIntoLevel: remainingXp,
    xpToNext,
    progress: xpToNext === 0 ? 0 : (remainingXp / xpToNext) * 100,
  };
}

export function calculateHabitStreak(habit: Habit): number {
  const uniqueDates = [...new Set(habit.completedDates)].sort().reverse();
  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const dateKey of uniqueDates) {
    const target = new Date(dateKey);
    target.setHours(0, 0, 0, 0);

    const diff = Math.round(
      (cursor.getTime() - target.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (diff === 0 || (streak === 0 && diff === 1)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (diff === 1) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    break;
  }

  return streak;
}

export function calculateDerivedXp(
  habits: Habit[],
  tasks: TaskItem[],
  journalEntries: JournalEntry[]
): number {
  const habitsXp = habits.reduce(
    (sum, habit) => sum + habit.completedDates.length * 5,
    0
  );
  const tasksXp = tasks.reduce((sum, task) => {
    if (task.status !== "done") return sum;
    if (task.priority === "high") return sum + 20;
    if (task.priority === "medium") return sum + 14;
    return sum + 10;
  }, 0);
  const journalXp = journalEntries.length * 8;

  return habitsXp + tasksXp + journalXp;
}
