import {
  CalendarClock,
  CheckCircle2,
  Circle,
  ListTodo,
  Plus,
  Trash2,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { daysUntil } from "../../lib/date";
import type { Priority, TaskItem, TaskStatus } from "../../types";

interface TasksSectionProps {
  tasks: TaskItem[];
  onAddTask: (task: Omit<TaskItem, "id" | "createdAt">) => void;
  onChangeStatus: (id: string, status: TaskStatus) => void;
  onDeleteTask: (id: string) => void;
}

const emptyTask = {
  title: "",
  notes: "",
  priority: "medium" as Priority,
  dueDate: "",
  status: "todo" as TaskStatus,
};

export function TasksSection({
  tasks,
  onAddTask,
  onChangeStatus,
  onDeleteTask,
}: TasksSectionProps) {
  const [taskForm, setTaskForm] = useState(emptyTask);

  const submitTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = taskForm.title.trim();
    if (!title) return;
    onAddTask({ ...taskForm, title });
    setTaskForm(emptyTask);
  };

  return (
    <section className="panel stack-lg">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Tasks</p>
          <h2>Priorities that stay manageable</h2>
        </div>
      </div>

      <form className="stack-sm form-card" onSubmit={submitTask}>
        <div className="grid-two">
          <label className="field">
            <span>Task</span>
            <input
              value={taskForm.title}
              onChange={(event) =>
                setTaskForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="What matters next?"
            />
          </label>
          <label className="field">
            <span>Due date</span>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(event) =>
                setTaskForm((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="grid-two">
          <label className="field">
            <span>Priority</span>
            <select
              value={taskForm.priority}
              onChange={(event) =>
                setTaskForm((current) => ({
                  ...current,
                  priority: event.target.value as Priority,
                }))
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select
              value={taskForm.status}
              onChange={(event) =>
                setTaskForm((current) => ({
                  ...current,
                  status: event.target.value as TaskStatus,
                }))
              }
            >
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span>Notes</span>
          <textarea
            rows={3}
            value={taskForm.notes}
            onChange={(event) =>
              setTaskForm((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
            placeholder="Keep it short and actionable."
          />
        </label>

        <button type="submit" className="primary-button">
          <Plus size={16} />
          Add task
        </button>
      </form>

      <div className="list-grid">
        {tasks.map((task) => {
          const dueIn = daysUntil(task.dueDate);
          const dueLabel =
            dueIn === null
              ? "No due date"
              : dueIn < 0
                ? `Overdue by ${Math.abs(dueIn)}d`
                : dueIn === 0
                  ? "Due today"
                  : `${dueIn}d left`;

          return (
            <article className="list-card" key={task.id}>
              <div className="list-card-top">
                <div>
                  <h3>{task.title}</h3>
                  <p className="muted">{task.notes || "No notes added."}</p>
                </div>
                <div className={`pill priority-${task.priority}`}>
                  <ListTodo size={14} />
                  {task.priority}
                </div>
              </div>

              <div className="meta-row">
                <span>
                  <CalendarClock size={14} />
                  {dueLabel}
                </span>
                <span>
                  {task.status === "done" ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Circle size={14} />
                  )}
                  {task.status}
                </span>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() =>
                    onChangeStatus(
                      task.id,
                      task.status === "done" ? "todo" : "done"
                    )
                  }
                >
                  <CheckCircle2 size={16} />
                  {task.status === "done" ? "Reopen" : "Complete"}
                </button>
                <button
                  type="button"
                  className="ghost-button danger"
                  onClick={() => onDeleteTask(task.id)}
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
