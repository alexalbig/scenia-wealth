"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Eyebrow sobre el título (patrón mockup) */
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-[520px]",
  lg: "max-w-[640px]",
} as const;

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto px-4 py-[6vh]">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-[rgba(12,20,36,0.55)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 w-full rounded-[14px] border border-line-2 bg-paper",
          sizes[size],
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            {eyebrow && <p className="label-upper mb-0.5">{eyebrow}</p>}
            <h2
              id="modal-title"
              className="text-[17px] font-bold tracking-[-0.01em] text-ink"
            >
              {title}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
            ✕
          </Button>
        </div>
        <div className="flex flex-col gap-3.5 px-5 py-[18px]">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 rounded-b-[14px] border-t border-line bg-paper-2 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
