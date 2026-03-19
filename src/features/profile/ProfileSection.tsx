import {
  Download,
  ImagePlus,
  Paintbrush,
  Plus,
  Upload,
  Trash2,
} from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import type { AppState, LifeStat } from "../../types";

interface ProfileSectionProps {
  state: AppState;
  onProfileChange: (updates: Partial<AppState["profile"]>) => void;
  onEnergyChange: (key: string, value: number) => void;
  onAddStat: (stat: Omit<LifeStat, "id">) => void;
  onUpdateStat: (id: string, value: number) => void;
  onDeleteStat: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const themes = [
  { key: "sunrise", label: "Sunrise", accent: "#ff8a5b" },
  { key: "forest", label: "Forest", accent: "#65c18c" },
  { key: "ocean", label: "Ocean", accent: "#5aa9ff" },
  { key: "berry", label: "Berry", accent: "#ea5c8d" },
];

export function ProfileSection({
  state,
  onProfileChange,
  onEnergyChange,
  onAddStat,
  onUpdateStat,
  onDeleteStat,
  onExport,
  onImport,
}: ProfileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);
  const [statForm, setStatForm] = useState({ area: "", value: 50 });

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      onProfileChange({ avatar: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onImport(file);
    event.target.value = "";
  };

  const submitStat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const area = statForm.area.trim();
    if (!area) return;
    onAddStat({ area, value: statForm.value });
    setStatForm({ area: "", value: 50 });
  };

  return (
    <section className="panel stack-lg">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Customize your space</h2>
        </div>
      </div>

      <div className="content-grid">
        <article className="profile-card stack-md">
          <div className="avatar-shell">
            <img src={state.profile.avatar} alt={state.profile.name} />
            <button
              type="button"
              className="ghost-button avatar-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus size={16} />
              Change avatar
            </button>
          </div>

          <label className="field">
            <span>Name</span>
            <input
              value={state.profile.name}
              onChange={(event) =>
                onProfileChange({ name: event.target.value.slice(0, 32) })
              }
              placeholder="Your name"
            />
          </label>

          <label className="field">
            <span>Guiding phrase</span>
            <textarea
              value={state.profile.focus}
              rows={4}
              onChange={(event) =>
                onProfileChange({ focus: event.target.value.slice(0, 220) })
              }
            />
          </label>

          <div className="stack-sm">
            <div className="inline-heading">
              <Paintbrush size={16} />
              <span>Theme</span>
            </div>
            <div className="theme-grid">
              {themes.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  className={
                    state.profile.theme === theme.key
                      ? "theme-swatch active"
                      : "theme-swatch"
                  }
                  onClick={() => onProfileChange({ theme: theme.key })}
                >
                  <span
                    className="theme-dot"
                    style={{ background: theme.accent }}
                  />
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          <div className="button-row">
            <button type="button" className="ghost-button" onClick={onExport}>
              <Download size={16} />
              Export
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => importRef.current?.click()}
            >
              <Upload size={16} />
              Import
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarUpload}
          />
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            hidden
            onChange={handleImport}
          />
        </article>

        <article className="profile-card stack-md">
          <div className="card-header">
            <div>
              <p className="eyebrow">Daily energy</p>
              <h3>Quick calibration</h3>
            </div>
          </div>

          <div className="stack-sm">
            {state.energy.map((entry) => (
              <label className="field" key={entry.key}>
                <span>{entry.key}</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={entry.value}
                  onChange={(event) =>
                    onEnergyChange(entry.key, Number(event.target.value))
                  }
                />
                <small>{entry.value}/10</small>
              </label>
            ))}
          </div>

          <div className="card-header">
            <div>
              <p className="eyebrow">Life stats</p>
              <h3>Keep the radar relevant</h3>
            </div>
          </div>

          <div className="stack-sm">
            {state.lifeStats.map((stat) => (
              <div className="inline-edit" key={stat.id}>
                <span>{stat.area}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={stat.value}
                  onChange={(event) =>
                    onUpdateStat(stat.id, Number(event.target.value))
                  }
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onDeleteStat(stat.id)}
                  aria-label={`Remove ${stat.area}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <form className="inline-form" onSubmit={submitStat}>
            <input
              value={statForm.area}
              onChange={(event) =>
                setStatForm((current) => ({
                  ...current,
                  area: event.target.value,
                }))
              }
              placeholder="New area"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={statForm.value}
              onChange={(event) =>
                setStatForm((current) => ({
                  ...current,
                  value: Number(event.target.value),
                }))
              }
            />
            <button type="submit" className="primary-button">
              <Plus size={16} />
              Add
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
