import { BarChart2, BookOpenText, Minus, Plus, Target, User } from "lucide-react";
import { Button } from "../../ui-compat";

export type MobileDashboardTab = "character" | "stats" | "habits" | "journal";
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

interface StepperControlProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (nextValue: number) => void;
  ariaLabel: string;
  compact?: boolean;
}

export function StepperControl({
  value,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel,
  compact = false,
}: StepperControlProps) {
  const buttonSize = compact
    ? "h-11 w-11 min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0"
    : "h-11 w-11 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0";
  const valueClass = compact ? "min-w-[2.5rem] text-xs" : "min-w-[3rem] text-sm";

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-1 py-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`${buttonSize} rounded-full`}
        onClick={() => onChange(clamp(value - step, min, max))}
        aria-label={`Decrease ${ariaLabel}`}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className={`${valueClass} text-center font-medium tabular-nums`}>
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`${buttonSize} rounded-full`}
        onClick={() => onChange(clamp(value + step, min, max))}
        aria-label={`Increase ${ariaLabel}`}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface DashboardMobileNavProps {
  activeTab: MobileDashboardTab;
  onTabChange: (tab: MobileDashboardTab) => void;
}

export function DashboardMobileNav({
  activeTab,
  onTabChange,
}: DashboardMobileNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
      aria-label="Dashboard sections"
    >
      <div className="mx-auto flex max-w-[1680px] items-stretch justify-around gap-1 px-2">
        {[
          { id: "character" as const, label: "Character", icon: User },
          { id: "stats" as const, label: "Stats", icon: BarChart2 },
          { id: "habits" as const, label: "Habits", icon: Target },
          { id: "journal" as const, label: "Journal", icon: BookOpenText },
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            type="button"
            variant={activeTab === id ? "default" : "ghost"}
            size="sm"
            className="flex h-auto min-w-0 flex-1 flex-col gap-0.5 py-2 px-1 text-[0.65rem] font-medium"
            onClick={() => onTabChange(id)}
          >
            <Icon className="mx-auto h-5 w-5 shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
