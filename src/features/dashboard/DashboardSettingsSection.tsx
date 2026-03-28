import { Download, Upload } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "../../ui-compat";
import { colorThemes } from "./dashboard-data";
import { themeColorKeys } from "./dashboard-display";

interface DashboardSettingsSectionProps {
  avatarSrc: string;
  profileName: string;
  themeMode: "dark" | "light";
  primaryColorKey: keyof typeof colorThemes;
  habitsCount: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  importInputRef: React.RefObject<HTMLInputElement | null>;
  setProfileName: React.Dispatch<React.SetStateAction<string>>;
  setThemeMode: React.Dispatch<React.SetStateAction<"dark" | "light">>;
  setPrimaryColorKey: React.Dispatch<React.SetStateAction<keyof typeof colorThemes>>;
  exportData: () => void;
  importData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DashboardSettingsSection({
  avatarSrc,
  profileName,
  themeMode,
  primaryColorKey,
  habitsCount,
  fileInputRef,
  importInputRef,
  setProfileName,
  setThemeMode,
  setPrimaryColorKey,
  exportData,
  importData,
}: DashboardSettingsSectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Card className="border border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Profile Settings</CardTitle>
          <CardDescription className="text-xs">
            Update your main identity details.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2 space-y-4">
          <label className="space-y-2 block">
            <span className="text-xs text-muted-foreground">Display name</span>
            <Input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value.slice(0, 32))}
              className="bg-background"
              placeholder="Your name"
            />
          </label>
          <div className="flex items-center gap-3">
            <img
              src={avatarSrc}
              alt="Profile preview"
              className="h-16 w-16 rounded-xl object-cover border border-border/70"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Change Photo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription className="text-xs">
            Choose global mode and accent.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2 space-y-4">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground block">Mode</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={themeMode === "dark" ? "default" : "ghost"}
                size="sm"
                onClick={() => setThemeMode("dark")}
              >
                Dark
              </Button>
              <Button
                type="button"
                variant={themeMode === "light" ? "default" : "ghost"}
                size="sm"
                onClick={() => setThemeMode("light")}
              >
                Light
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground block">Accent</span>
            <div className="flex flex-wrap gap-2">
              {themeColorKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPrimaryColorKey(key)}
                  className={[
                    "relative flex h-8 w-8 items-center justify-center rounded-full border transition-all",
                    primaryColorKey === key
                      ? "border-primary ring-2 ring-primary/60"
                      : "border-border/70 hover:border-primary/60",
                  ].join(" ")}
                  aria-label={`Use ${key} accent`}
                >
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ backgroundColor: `hsl(${colorThemes[key].primary})` }}
                  />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Data</CardTitle>
          <CardDescription className="text-xs">
            Export or import your current dashboard data.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2 space-y-3">
          <Button type="button" variant="secondary" onClick={exportData}>
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => importInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={importData}
          />
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Quick Summary</CardTitle>
          <CardDescription className="text-xs">
            Main settings currently in use.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Name</span>
            <strong>{profileName}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Theme mode</span>
            <strong className="capitalize">{themeMode}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Accent</span>
            <strong className="capitalize">{primaryColorKey}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Habits tracked</span>
            <strong>{habitsCount}</strong>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
