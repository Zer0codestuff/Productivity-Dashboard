import React from "react";

type ClassNameProps = {
  className?: string;
  children?: React.ReactNode;
};

function join(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Accordion({ children }: ClassNameProps) {
  return <>{children}</>;
}

export const AccordionContent = Accordion;
export const AccordionItem = Accordion;
export const AccordionTrigger = Accordion;
export const Alert = Accordion;
export const AlertDescription = Accordion;
export const AlertTitle = Accordion;
export const Avatar = Accordion;
export const AvatarFallback = Accordion;
export const AvatarImage = Accordion;
export const CardFooter = Accordion;
export const ChartContainer = Accordion;
export const ChartLegend = Accordion;
export const ChartLegendContent = Accordion;
export const ChartStyle = Accordion;
export const ChartTooltipContent = Accordion;
export const Select = Accordion;
export const SelectContent = Accordion;
export const SelectGroup = Accordion;
export const SelectItem = Accordion;
export const SelectLabel = Accordion;
export const SelectScrollDownButton = Accordion;
export const SelectScrollUpButton = Accordion;
export const SelectSeparator = Accordion;
export const SelectTrigger = Accordion;
export const SelectValue = Accordion;
export const Separator = Accordion;
export const Skeleton = Accordion;
export const Switch = Accordion;
export const TableCaption = Accordion;
export const TableFooter = Accordion;
export const Tabs = Accordion;
export const TabsContent = Accordion;
export const TabsList = Accordion;
export const TabsTrigger = Accordion;

export function Badge({
  className,
  children,
}: ClassNameProps & { variant?: string }) {
  return (
    <span
      className={join(
        "inline-flex items-center rounded-full border border-border/70 px-2.5 py-0.5 font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  className,
  children,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost";
  size?: "default" | "sm" | "icon";
}) {
  return (
    <button
      className={join(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "ghost" && "hover:bg-muted",
        (!variant || variant === "default") &&
          "bg-primary text-primary-foreground hover:opacity-90",
        size === "sm" && "h-9 rounded-md px-3",
        size === "icon" && "h-10 w-10",
        (!size || size === "default") && "h-10 px-4 py-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ className, children }: ClassNameProps) {
  return <div className={join("rounded-xl bg-card text-card-foreground", className)}>{children}</div>;
}

export function CardHeader({ className, children }: ClassNameProps) {
  return <div className={join("flex flex-col space-y-1.5", className)}>{children}</div>;
}

export function CardTitle({ className, children }: ClassNameProps) {
  return <h3 className={join("font-semibold leading-none tracking-tight", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: ClassNameProps) {
  return <p className={join("text-sm text-muted-foreground", className)}>{children}</p>;
}

export function CardContent({ className, children }: ClassNameProps) {
  return <div className={className}>{children}</div>;
}

export function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      className={join("rounded border border-border bg-background accent-[hsl(var(--primary))]", className)}
      checked={Boolean(checked)}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={join(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={join("text-sm font-medium leading-none", className)} {...props}>
      {children}
    </label>
  );
}

export function Table({ className, children }: ClassNameProps) {
  return <table className={join("w-full caption-bottom text-sm", className)}>{children}</table>;
}

export function TableHeader({ className, children }: ClassNameProps) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ className, children }: ClassNameProps) {
  return <tbody className={join("[&_tr:last-child]:border-0", className)}>{children}</tbody>;
}

export function TableRow({ className, children }: ClassNameProps) {
  return <tr className={join("border-b border-border transition-colors", className)}>{children}</tr>;
}

export function TableHead({ className, children }: ClassNameProps) {
  return <th className={join("h-10 px-2 text-left align-middle font-medium text-muted-foreground", className)}>{children}</th>;
}

export function TableCell({ className, children }: ClassNameProps) {
  return <td className={join("p-2 align-middle", className)}>{children}</td>;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={join(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function TooltipProvider({ children }: ClassNameProps) {
  return <>{children}</>;
}

export function Tooltip({ children }: ClassNameProps) {
  return <>{children}</>;
}

export function TooltipTrigger({
  children,
  asChild,
}: {
  children?: React.ReactNode;
  asChild?: boolean;
}) {
  if (asChild) return <>{children}</>;
  return <span>{children}</span>;
}

export function TooltipContent({
  children,
}: ClassNameProps & { side?: "top" | "right" | "bottom" | "left" }) {
  return <span className="hidden">{children}</span>;
}
