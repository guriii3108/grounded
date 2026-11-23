"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { Mascot, MascotName } from "../ui/mascot";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  mascot?: MascotName;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  mascot,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)]/40 max-w-lg mx-auto my-8",
        className
      )}
    >
      {mascot ? (
        <div className="mb-4">
          <Mascot name={mascot} pose="idle" size={80} />
        </div>
      ) : Icon ? (
        <div className="w-12 h-12 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center mb-4 text-[var(--muted)]">
          <Icon className="w-6 h-6" />
        </div>
      ) : null}

      <h3 className="font-semibold text-lg text-[var(--ink)] mb-1.5 tracking-tight">{title}</h3>
      <p className="text-xs text-[var(--muted)] leading-relaxed max-w-sm mb-6">{description}</p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ink)] hover:opacity-90 text-[var(--surface)] text-xs font-medium cursor-pointer transition-all shadow-xs"
            >
              {action.icon && <action.icon className="w-3.5 h-3.5" />}
              <span>{action.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-4 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-medium cursor-pointer transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
