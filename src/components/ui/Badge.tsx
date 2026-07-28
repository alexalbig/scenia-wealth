import { Pill } from "./Pill";
import { LiqBadge } from "./LiqBadge";

export function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: "neutral" | "blue" | "coral" | "green" | "amber" | "segment" | "emp";
  className?: string;
}) {
  const tone =
    variant === "coral" || variant === "emp"
      ? "emp"
      : variant === "blue"
        ? "blue"
        : "default";
  return <Pill tone={tone}>{children}</Pill>;
}

export function LiquidityBadge({
  level,
}: {
  level: "alta" | "media" | "baja";
}) {
  return <LiqBadge level={level === "alta" ? "a" : "b"} />;
}
