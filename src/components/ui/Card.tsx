import { cn } from "@/lib/cn";

type CardVariant = "paper" | "dark" | "white";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "sm" | "md" | "lg" | "none";
}

const paddingMap = {
  none: "p-0",
  sm: "p-3.5",
  md: "p-4",
  lg: "p-[18px]",
} as const;

export function Card({
  variant = "white",
  padding = "md",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[10px] border",
        variant === "white" && "border-line-2 bg-white text-ink",
        variant === "paper" && "border-line-2 bg-paper text-ink",
        variant === "dark" &&
          "border-dark-border bg-ink-2 text-dark-text rounded-[12px]",
        paddingMap[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
