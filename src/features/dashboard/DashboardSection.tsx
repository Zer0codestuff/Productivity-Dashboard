import { Activity, Award, Flame, Sparkles, TrendingUp } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { calculateHabitStreak, calculateLevel } from "../../lib/gamification";
import type { AppState } from "../../types";

interface DashboardSectionProps {
  state: AppState;
  totalXp: number;
}

export function DashboardSection({
  state,
  totalXp,
}: DashboardSectionProps) {
  const level = calculateLevel(totalXp);
  const topHabitStreak = state.habits.reduce((best, habit) => {
    const streak = calculateHabitStreak(habit);
    return Math.max(best, streak);
  }, 0);
  const completedTasks = state.tasks.filter((task) => task.status === "done");
  const averageMood =
    state.journalEntries.length === 0
      ? 0
      : state.journalEntries.reduce((sum, entry) => sum + entry.mood, 0) /
        state.journalEntries.length;

  return (
    <section className="panel stack-lg">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Overview that actually helps</h2>
        </div>
        <div className="pill">
          <Sparkles size={16} />
          Level {level.level}
        </div>
      </div>

      <div className="hero-card stack-md">
        <div className="hero-copy stack-sm">
          <p className="eyebrow">Current focus</p>
          <h3>{state.profile.focus}</h3>
          <p className="muted">
            Your momentum is based on completed habits, finished tasks, journal
            entries, and any manual XP you award yourself.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <Award size={18} />
            <span>Total XP</span>
            <strong>{totalXp}</strong>
          </div>
          <div className="stat-card">
            <TrendingUp size={18} />
            <span>Progress</span>
            <strong>{Math.round(level.progress)}%</strong>
          </div>
        </div>
        <div className="progress-shell">
          <div
            className="progress-bar"
            style={{ width: `${Math.max(8, level.progress)}%` }}
          />
        </div>
        <p className="muted tiny">
          {level.xpIntoLevel} / {level.xpToNext} XP to next level
        </p>
      </div>

      <div className="summary-grid">
        <article className="metric-card">
          <Flame size={18} />
          <span>Best streak</span>
          <strong>{topHabitStreak} days</strong>
        </article>
        <article className="metric-card">
          <Activity size={18} />
          <span>Tasks completed</span>
          <strong>{completedTasks.length}</strong>
        </article>
        <article className="metric-card">
          <Sparkles size={18} />
          <span>Average mood</span>
          <strong>{averageMood > 0 ? averageMood.toFixed(1) : "-"}/5</strong>
        </article>
      </div>

      <div className="content-grid">
        <article className="chart-card stack-md">
          <div className="card-header">
            <div>
              <p className="eyebrow">Life areas</p>
              <h3>Balance radar</h3>
            </div>
          </div>
          <div className="radar-shell">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={state.lifeStats}>
                <PolarGrid stroke="rgba(255,255,255,0.18)" />
                <PolarAngleAxis
                  dataKey="area"
                  tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                />
                <Radar
                  dataKey="value"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.35}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="chart-card stack-md">
          <div className="card-header">
            <div>
              <p className="eyebrow">Energy check</p>
              <h3>How today feels</h3>
            </div>
          </div>
          <div className="stack-sm">
            {state.energy.map((entry) => (
              <div className="energy-row" key={entry.key}>
                <span>{entry.key}</span>
                <div className="energy-meter">
                  <div
                    className="energy-fill"
                    style={{ width: `${entry.value * 10}%` }}
                  />
                </div>
                <strong>{entry.value}/10</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
