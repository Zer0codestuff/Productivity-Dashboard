import { BookOpenText, Filter, Plus, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { formatDateTime, isWithinDays } from "../../lib/date";
import type { FilterMode, JournalEntry } from "../../types";

interface JournalSectionProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;
  onDeleteEntry: (id: string) => void;
}

const emptyForm = {
  title: "",
  content: "",
  mood: 3,
  tags: "",
};

export function JournalSection({
  entries,
  onAddEntry,
  onDeleteEntry,
}: JournalSectionProps) {
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<FilterMode>("week");

  const filteredEntries = useMemo(() => {
    if (filter === "all") return entries;
    if (filter === "today") {
      return entries.filter((entry) => isWithinDays(entry.createdAt, 0));
    }
    return entries.filter((entry) => isWithinDays(entry.createdAt, 7));
  }, [entries, filter]);

  const submitEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) return;

    onAddEntry({
      title,
      content,
      mood: form.mood,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    setForm(emptyForm);
  };

  return (
    <section className="panel stack-lg">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Journal</p>
          <h2>Capture what happened and why it mattered</h2>
        </div>
        <div className="filter-row">
          <Filter size={14} />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as FilterMode)}
          >
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="all">All entries</option>
          </select>
        </div>
      </div>

      <form className="stack-sm form-card" onSubmit={submitEntry}>
        <label className="field">
          <span>Title</span>
          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="What stands out today?"
          />
        </label>

        <label className="field">
          <span>Entry</span>
          <textarea
            rows={5}
            value={form.content}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                content: event.target.value,
              }))
            }
            placeholder="Write the facts, then the lesson."
          />
        </label>

        <div className="grid-two">
          <label className="field">
            <span>Mood</span>
            <input
              type="range"
              min={1}
              max={5}
              value={form.mood}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  mood: Number(event.target.value),
                }))
              }
            />
            <small>{form.mood}/5</small>
          </label>

          <label className="field">
            <span>Tags</span>
            <input
              value={form.tags}
              onChange={(event) =>
                setForm((current) => ({ ...current, tags: event.target.value }))
              }
              placeholder="focus, work, reflection"
            />
          </label>
        </div>

        <button type="submit" className="primary-button">
          <Plus size={16} />
          Save entry
        </button>
      </form>

      <div className="list-grid">
        {filteredEntries.map((entry) => (
          <article className="list-card" key={entry.id}>
            <div className="list-card-top">
              <div>
                <h3>{entry.title}</h3>
                <p className="muted tiny">{formatDateTime(entry.createdAt)}</p>
              </div>
              <div className="pill">
                <BookOpenText size={14} />
                Mood {entry.mood}/5
              </div>
            </div>

            <p>{entry.content}</p>

            {entry.tags.length > 0 ? (
              <div className="tag-row">
                {entry.tags.map((tag) => (
                  <span className="tag" key={`${entry.id}-${tag}`}>
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="button-row">
              <button
                type="button"
                className="ghost-button danger"
                onClick={() => onDeleteEntry(entry.id)}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
