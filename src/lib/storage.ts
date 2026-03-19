import type { AppState } from "../types";

export const STORAGE_KEY = "momentum-journal-state";

const starterAvatar =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80";

export const defaultState: AppState = {
  profile: {
    name: "Ash",
    avatar: starterAvatar,
    focus: "Small daily actions build a calmer and stronger life.",
    theme: "sunrise",
  },
  xp: 0,
  manualXp: 0,
  lifeStats: [
    { id: crypto.randomUUID(), area: "Health", value: 72 },
    { id: crypto.randomUUID(), area: "Focus", value: 68 },
    { id: crypto.randomUUID(), area: "Calm", value: 75 },
    { id: crypto.randomUUID(), area: "Discipline", value: 61 },
    { id: crypto.randomUUID(), area: "Creativity", value: 79 },
  ],
  energy: [
    { key: "Sleep", value: 7 },
    { key: "Mood", value: 6 },
    { key: "Focus", value: 7 },
  ],
  habits: [
    {
      id: crypto.randomUUID(),
      name: "Walk 20 minutes",
      createdAt: new Date().toISOString(),
      completedDates: [],
    },
    {
      id: crypto.randomUUID(),
      name: "Write 5 lines in journal",
      createdAt: new Date().toISOString(),
      completedDates: [],
    },
  ],
  tasks: [
    {
      id: crypto.randomUUID(),
      title: "Plan the week",
      notes: "Choose 3 realistic priorities.",
      priority: "high",
      dueDate: "",
      status: "todo",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Review yesterday's journal",
      notes: "Spot one lesson worth keeping.",
      priority: "medium",
      dueDate: "",
      status: "in-progress",
      createdAt: new Date().toISOString(),
    },
  ],
  journalEntries: [
    {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      mood: 4,
      title: "Starting point",
      content:
        "I want a system that helps me stay grounded, track my habits, and end the day with clarity.",
      tags: ["reflection", "planning"],
    },
  ],
};

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) } as AppState;
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
