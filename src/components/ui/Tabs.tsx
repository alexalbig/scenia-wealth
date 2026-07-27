"use client";

import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  /** coral = pestañas Patrimonio (mockup); ink = genérico */
  accent?: "coral" | "ink";
}

export function Tabs({
  items,
  value,
  onChange,
  className,
  accent = "coral",
}: TabsProps) {
  const activeBorder =
    accent === "coral" ? "border-coral text-ink" : "border-ink text-ink";

  return (
    <div
      role="tablist"
      className={cn(
        "flex flex-wrap gap-0.5 border-b border-line bg-paper px-3.5 pt-2.5",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative -mb-px shrink-0 rounded-t-[8px] px-3 py-2 text-[12px] font-semibold transition-colors",
              active
                ? cn("border-b-2 bg-transparent", activeBorder)
                : "border-b-2 border-transparent text-slate hover:bg-paper-2 hover:text-ink",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
