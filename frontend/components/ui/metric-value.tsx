"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { formatDelta } from "../../lib/format";
import { HelpCircle } from "lucide-react";

interface MetricValueProps {
  label: string;
  value: string | number;
  delta?: number;
  inverseDelta?: boolean; // If true, negative delta is good (e.g. latency, cost)
  isPercentDelta?: boolean;
  tooltip?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MetricValue({
  label,
  value,
  delta,
  inverseDelta = false,
  isPercentDelta = false,
  tooltip,
  subtitle,
  size = "md",
  className,
}: MetricValueProps) {
  const deltaInfo = delta !== undefined ? formatDelta(delta, inverseDelta, isPercentDelta) : null;

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }[size];

  return (
    <div className={cn("flex flex-col p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]", className)}>
      <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-1">
        <span className="font-medium tracking-wide uppercase text-[10px]">{label}</span>
        {tooltip && (
          <span title={tooltip} className="cursor-help text-[var(--fg-subtle)] hover:text-[var(--fg)] transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn("font-mono font-semibold tracking-tight text-[var(--fg)] tabular-nums", sizeClasses)}>
          {value}
        </span>
        {deltaInfo && (
          <span className={cn("font-mono text-xs font-medium tabular-nums", deltaInfo.colorClass)}>
            {deltaInfo.text}
          </span>
        )}
      </div>

      {subtitle && (
        <span className="text-[11px] text-[var(--fg-subtle)] mt-1 truncate">
          {subtitle}
        </span>
      )}
    </div>
  );
}
