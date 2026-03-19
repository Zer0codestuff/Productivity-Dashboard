export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "done";
export type FilterMode = "today" | "week" | "all";

export interface LifeStat {
  id: string;
  area: string;
  value: number;
}

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  completedDates: string[];
}

export interface TaskItem {
  id: string;
  title: string;
  notes: string;
  priority: Priority;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  mood: number;
  title: string;
  content: string;
  tags: string[];
}

export interface Profile {
  name: string;
  avatar: string;
  focus: string;
  theme: string;
}

export interface AppState {
  profile: Profile;
  xp: number;
  manualXp: number;
  lifeStats: LifeStat[];
  energy: Array<{ key: string; value: number }>;
  habits: Habit[];
  tasks: TaskItem[];
  journalEntries: JournalEntry[];
}
