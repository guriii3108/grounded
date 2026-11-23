"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export type StatusVariant =
  | "queued"
  | "processing"
  | "running"
  | "ready"
  | "failed"
  | "completed"
  | "cancelled"
  | "connected"
  | "error"
  | "untested";

interface StatusPillProps {
  status: StatusVariant;
  progressPercent?: number;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export function StatusPill({
  status,
  progressPercent,
  label,
  className,
  onClick,
}: StatusPillProps) {
  const isClickable = !!onClick;

  const config: Record<
    StatusVariant,
    { text: string; dot: string; spin?: boolean }
  > = {
    queued: {
      text: label || "Queued",
      dot: "bg-[var(--subtle)]",
    },
    processing: {
      text: label || (progressPercent !== undefined ? `Processing ${progressPercent}%` : "Processing"),
      dot: "bg-[var(--accent)] animate-pulse",
      spin: true,
    },
    running: {
      text: label || (progressPercent !== undefined ? `Running ${progressPercent}%` : "Running"),
      dot: "bg-[var(--accent)] animate-pulse",
      spin: true,
    },
    ready: {
      text: label || "Ready",
      dot: "bg-[var(--positive)]",
    },
    completed: {
      text: label || "Completed",
      dot: "bg-[var(--positive)]",
    },
    failed: {
      text: label || "Failed",
      dot: "bg-[var(--negative)]",
    },
    cancelled: {
      text: label || "Cancelled",
      dot: "bg-[var(--subtle)]",
    },
    connected: {
      text: label || "Connected",
      dot: "bg-[var(--positive)]",
    },
    error: {
      text: label || "Error",
      dot: "bg-[var(--negative)]",
    },
    untested: {
      text: label || "Untested",
      dot: "bg-[var(--warning)]",
    },
  };

  const c = config[status] ?? {
    text: status,
    dot: "bg-[var(--subtle)]",
  };

  return (
    <span
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-[var(--muted)] tabular-nums transition-colors",
        isClickable && "cursor-pointer hover:text-[var(--ink)]",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.dot)} />
      {c.spin && (
        <Loader2 className="w-3 h-3 animate-spin shrink-0 text-[var(--accent)]" />
      )}
      <span>{c.text}</span>
    </span>
  );
}
