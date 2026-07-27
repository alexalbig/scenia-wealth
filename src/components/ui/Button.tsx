"use client";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "coral";
type ButtonSize = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Primary = ink (mockup). Coral = CTA fuerte (+ Nuevo cliente). */
const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white border border-ink hover:bg-ink-2",
  secondary:
    "bg-white text-ink border border-line-2 hover:bg-paper-2 hover:border-faintest",
  ghost:
    "bg-transparent text-slate border border-transparent hover:bg-paper-2 hover:text-ink",
  coral:
    "bg-coral text-white border border-coral hover:bg-coral-deep hover:border-coral-deep",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-[11px] rounded-[6px]",
  md: "px-3.5 py-2 text-[12px] rounded-[8px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
