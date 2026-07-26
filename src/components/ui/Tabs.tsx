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
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-0 border-b border-line-2 overflow-x-auto",
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
              "relative shrink-0 px-3.5 py-2.5 text-[12px] font-semibold transition-colors",
              active ? "text-blue" : "text-mute hover:text-ink-3",
            )}
          >
            {item.label}
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue" />
            )}
          </button>
        );
      })}
    </div>
  );
}
