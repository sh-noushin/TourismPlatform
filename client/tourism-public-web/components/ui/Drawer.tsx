"use client";

import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-50 pointer-events-none", open && "pointer-events-auto")}>
      <div
        aria-hidden={!open}
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300 backdrop-blur-sm",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal={open}
        aria-label={title ?? "drawer"}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md transform overflow-y-auto border-l border-border bg-surface p-6 shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="flex items-center justify-between">
          {title ? <h2 className="text-lg font-semibold text-text">{title}</h2> : <div />}
          <button
            type="button"
            className="rounded-full border border-border px-3 py-1 text-sm text-text"
            onClick={onClose}
            aria-label="Close drawer"
          >
            X
          </button>
        </header>

        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}