"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Mockup: `.lbl` encima del `.h2` en modal-head */
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Mockup `.overlay` + `.modal` + `.modal-head` / `.modal-body` / `.modal-foot`
 */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  wide = false,
  size,
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

  const isWide = wide || size === "lg";

  return (
    <div
      className={cn("overlay", open && "on")}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={cn("modal", isWide && "wide")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-head">
            <div>
              {eyebrow && <div className="lbl">{eyebrow}</div>}
              <div className={eyebrow ? "h2" : "h3"} id="modal-title">
                {title}
              </div>
            </div>
            <button
              type="button"
              className="btn ghost sm"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-foot">{footer}</div>}
        </div>
      )}
    </div>
  );
}
