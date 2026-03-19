import { CheckCircle2, Flame, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { isToday, toDateKey } from "../../lib/date";
import { calculateHabitStreak } from "../../lib/gamification";
import type { Habit } from "../../types";

interface HabitsSectionProps {
  habits: Habit[];
  onAddHabit: (name: string) => void;
  onToggleHabit: (id: string, dateKey: string) => void;
  onDeleteHabit: (id: string) => void;
}

export function HabitsSection({
  habits,
  onAddHabit,
  onToggleHabit,
  onDeleteHabit,
}: HabitsSectionProps) {
  const [name, setName] = useState("");
  const today = toDateKey(new Date());

  const submitHabit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddHabit(trimmed);
    setName("");
  };

  return (
    <section className="panel stack-lg">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Habits</p>
          <h2>Daily habits with real streaks</h2>
        </div>
      </div>

      <form className="inline-form" onSubmit={submitHabit}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Add a new daily habit"
        />
        <button type="submit" className="primary-button">
          <Plus size={16} />
          Add habit
        </button>
      </form>

      <div className="list-grid">
        {habits.map((habit) => {
          const doneToday = habit.completedDates.some((date) => isToday(date));
          const streak = calculateHabitStreak(habit);

          return (
            <article className="list-card" key={habit.id}>
              <div className="list-card-top">
                <div>
                  <h3>{habit.name}</h3>
                  <p className="muted tiny">
                    Completed {habit.completedDates.length} times
                  </p>
                </div>
                <div className="pill warm">
                  <Flame size={14} />
                  {streak} day streak
                </div>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className={doneToday ? "success-button" : "ghost-button"}
                  onClick={() => onToggleHabit(habit.id, today)}
                >
                  <CheckCircle2 size={16} />
                  {doneToday ? "Completed today" : "Mark complete"}
                </button>
                <button
                  type="button"
                  className="ghost-button danger"
                  onClick={() => onDeleteHabit(habit.id)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
