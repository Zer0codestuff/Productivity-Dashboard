import React from "react";
import { Flame, Heart, Zap } from "lucide-react";
import { colorThemes } from "./dashboard-data";

export const energyIconMap = {
  Willpower: Zap,
  Health: Heart,
  Mood: Flame,
};

export const ENERGY_METRIC_COLORS: Record<string, string> = {
  Willpower: "#facc15",
  Health: "#ef4444",
  Mood: "#f97316",
};

export const themeColorKeys = Object.keys(colorThemes) as Array<keyof typeof colorThemes>;
export const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function getStreakTextStyle(streak: number): React.CSSProperties {
  if (streak <= 0) {
    return { color: "hsl(var(--muted-foreground))" };
  }
  const t = Math.min(streak / 20, 1);
  const hue = 32 - t * 32;
  return { color: `hsl(${hue} 88% 54%)` };
}

export function getStreakBadgeStyle(streak: number): React.CSSProperties {
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
