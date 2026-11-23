"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { formatDelta } from "../../lib/format";
import { HelpCircle } from "lucide-react";

interface MetricValueProps {
  label: string;
  value: string | number;
  delta?: number;
  inverseDelta?: boolean;
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

  const valueSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  }[size];

  return (
    <div className={cn("flex flex-col min-w-0", className)}>
      {/* Label */}
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs text-[var(--muted)]">{label}</span>
        {tooltip && (
          <span
            title={tooltip}
            className="cursor-help text-[var(--subtle)] hover:text-[var(--muted)] transition-colors"
          >
            <HelpCircle className="w-3 h-3" />
          </span>
        )}
      </div>

      {/* Value + inline delta */}
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono-numbers font-semibold tracking-tight text-[var(--ink)] tabular-nums count-rise",
            valueSizes
          )}
        >
          {value}
        </span>
        {deltaInfo && (
          <span
            className={cn(
              "font-mono-numbers text-xs font-medium tabular-nums",
              deltaInfo.colorClass
            )}
          >
            {deltaInfo.text}
          </span>
        )}
      </div>

      {subtitle && (
        <span className="text-[11px] text-[var(--subtle)] mt-0.5 truncate">
          {subtitle}
        </span>
      )}
    </div>
  );
}
