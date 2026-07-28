"use client";

import { cn } from "@/lib/cn";

type ButtonVariant =
  | "default"
  | "secondary"
  | "primary"
  | "coral"
  | "ghost";
type ButtonSize = "md" | "sm";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Mockup `.btn` / `.btn.primary` / `.btn.coral` / `.btn.ghost` / `.btn.sm` */
export function Button({
  variant = "default",
  size = "md",
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const tone =
    variant === "default" || variant === "secondary" ? undefined : variant;
  return (
    <button
      type={type}
      className={cn("btn", tone, size === "sm" && "sm", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
