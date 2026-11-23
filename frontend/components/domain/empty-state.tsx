"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { LucideIcon } from "lucide-react";
import { Mascot } from "../ui/mascot";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  mascot?: "retriever" | "owl" | "mole";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  mascot,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-8 py-12 rounded-[20px] border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)]/60",
        className
      )}
    >
      {mascot ? (
        <div className="mb-4">
          <Mascot name={mascot} size={64} />
        </div>
      ) : (
        <div className="w-11 h-11 rounded-[14px] bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)] mb-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <Icon className="w-5 h-5" />
        </div>
      )}

      <h3 className="font-display text-2xl text-[var(--ink)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--muted)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="px-5 py-2 rounded-full bg-[var(--ink)] hover:opacity-90 text-[var(--surface)] text-sm font-medium transition-all shadow-sm cursor-pointer"
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-5 py-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] text-sm font-medium transition-all cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
