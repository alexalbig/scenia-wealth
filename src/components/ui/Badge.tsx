import { cn } from "@/lib/cn";

type BadgeVariant =
  | "neutral"
  | "blue"
  | "coral"
  | "green"
  | "amber"
  | "segment";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-paper-2 text-slate",
  blue: "bg-blue-soft text-blue",
  coral: "bg-coral-soft text-coral-deep",
  green: "bg-green-bg text-green",
  amber: "bg-amber-bg text-amber",
  segment: "bg-paper-2 text-slate",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] px-2 py-[3px] text-[10.5px] font-semibold tracking-[0.02em]",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function LiquidityBadge({ level }: { level: "alta" | "media" | "baja" }) {
  if (level === "alta") {
    return <Badge variant="green">Liquidez alta</Badge>;
  }
  return (
    <Badge variant="amber">
      {level === "media" ? "Liquidez media" : "Liquidez baja"}
    </Badge>
  );
}
