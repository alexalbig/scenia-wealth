import { cn } from "@/lib/cn";

type CardVariant = "paper" | "dark";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
} as const;

export function Card({
  variant = "paper",
  padding = "md",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[8px] border",
        variant === "paper" && "border-line-2 bg-paper text-ink",
        variant === "dark" &&
          "border-dark-border bg-ink-2 text-dark-text",
        paddingMap[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
