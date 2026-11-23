"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface DeltaBarProps {
  delta: number; // e.g. -0.5 to +0.5 or -1 to +1
  maxScale?: number; // max absolute value represented, default 0.5 or 1.0
  inverseGood?: boolean; // if true, negative is positive/green (latency/cost)
  className?: string;
}

export function DeltaBar({
  delta,
  maxScale = 0.5,
  inverseGood = false,
  className,
}: DeltaBarProps) {
  const clampedDelta = Math.max(-maxScale, Math.min(maxScale, delta));
  const percent = Math.abs(clampedDelta / maxScale) * 50; // max 50% width from center

  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const isNeutral = Math.abs(delta) < 0.001;

  // Good vs bad color determination
  const isGood = inverseGood ? isNegative : isPositive;
  const barColor = isNeutral
    ? "bg-transparent"
    : isGood
    ? "bg-[var(--positive)]"
    : "bg-[var(--negative)]";

  return (
    <div className={cn("relative w-24 h-2 bg-[var(--border)] rounded-full overflow-hidden flex items-center", className)}>
      {/* Center zero divider line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[var(--border-strong)] z-10" />

      {/* Negative bar (stretches left from center) */}
      {isNegative && (
        <div
          className={cn("absolute right-1/2 h-full rounded-l-full transition-all duration-300", barColor)}
          style={{ width: `${percent}%` }}
        />
      )}

      {/* Positive bar (stretches right from center) */}
      {isPositive && (
        <div
          className={cn("absolute left-1/2 h-full rounded-r-full transition-all duration-300", barColor)}
          style={{ width: `${percent}%` }}
        />
      )}
    </div>
  );
}
