"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { Loader2, CheckCircle2, AlertCircle, Clock, XCircle, ShieldCheck } from "lucide-react";

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

  const config = {
    queued: {
      text: label || "Queued",
      color: "bg-[var(--bg-subtle)] text-[var(--fg-muted)] border-[var(--border)]",
      dot: "bg-[var(--fg-subtle)]",
      icon: Clock,
    },
    processing: {
      text: label || (progressPercent !== undefined ? `Processing ${progressPercent}%` : "Processing"),
      color: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30",
      dot: "bg-[var(--accent)] animate-pulse",
      icon: Loader2,
      spin: true,
    },
    running: {
      text: label || (progressPercent !== undefined ? `Running ${progressPercent}%` : "Running"),
      color: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30",
      dot: "bg-[var(--accent)] animate-pulse",
      icon: Loader2,
      spin: true,
    },
    ready: {
      text: label || "Ready",
      color: "bg-[var(--positive-subtle)] text-[var(--positive)] border-[var(--positive)]/30",
      dot: "bg-[var(--positive)]",
      icon: CheckCircle2,
    },
    completed: {
      text: label || "Completed",
      color: "bg-[var(--positive-subtle)] text-[var(--positive)] border-[var(--positive)]/30",
      dot: "bg-[var(--positive)]",
      icon: CheckCircle2,
    },
    failed: {
      text: label || "Failed",
      color: "bg-[var(--negative-subtle)] text-[var(--negative)] border-[var(--negative)]/30",
      dot: "bg-[var(--negative)]",
      icon: AlertCircle,
    },
    cancelled: {
      text: label || "Cancelled",
      color: "bg-[var(--bg-subtle)] text-[var(--fg-subtle)] border-[var(--border)]",
      dot: "bg-[var(--fg-subtle)]",
      icon: XCircle,
    },
    connected: {
      text: label || "Connected",
      color: "bg-[var(--positive-subtle)] text-[var(--positive)] border-[var(--positive)]/30",
      dot: "bg-[var(--positive)]",
      icon: ShieldCheck,
    },
    error: {
      text: label || "Error",
      color: "bg-[var(--negative-subtle)] text-[var(--negative)] border-[var(--negative)]/30",
      dot: "bg-[var(--negative)]",
      icon: AlertCircle,
    },
    untested: {
      text: label || "Untested",
      color: "bg-[var(--warning-subtle)] text-[var(--warning)] border-[var(--warning)]/30",
      dot: "bg-[var(--warning)]",
      icon: Clock,
    },
  }[status] || {
    text: status,
    color: "bg-[var(--bg-subtle)] text-[var(--fg-muted)] border-[var(--border)]",
    dot: "bg-[var(--fg-subtle)]",
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border tabular-nums transition-colors",
        config.color,
        isClickable && "cursor-pointer hover:brightness-95",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      {config.spin ? (
        <Icon className="w-3 h-3 animate-spin shrink-0" />
      ) : null}
      <span>{config.text}</span>
    </span>
  );
}
