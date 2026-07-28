import { cn } from "@/lib/cn";

export function Pill({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "emp" | "blue";
  className?: string;
}) {
  return (
    <span className={cn("pill", tone !== "default" && tone, className)}>
      {children}
    </span>
  );
}
