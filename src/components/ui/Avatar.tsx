import { cn } from "@/lib/cn";

export function Avatar({
  initials,
  className,
  style,
}: {
  initials: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={cn("av", className)} style={style}>
      {initials}
    </span>
  );
}

export function initialsFromName(nombre: string) {
  return nombre
    .replace(/^Familia\s+/i, "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
