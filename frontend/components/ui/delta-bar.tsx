"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface DeltaBarProps {
  delta: number;
  maxScale?: number;
  inverseGood?: boolean;
  className?: string;
}

export function DeltaBar({
  delta,
  maxScale = 0.5,
  inverseGood = false,
  className,
}: DeltaBarProps) {
  const clampedDelta = Math.max(-maxScale, Math.min(maxScale, delta));
  const percent = Math.abs(clampedDelta / maxScale) * 50;

  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const isNeutral = Math.abs(delta) < 0.001;

  const isGood = inverseGood ? isNegative : isPositive;
  const barColor = isNeutral
    ? "bg-transparent"
    : isGood
    ? "bg-[var(--positive)]"
    : "bg-[var(--negative)]";

  return (
    <div
      className={cn(
        "relative w-24 h-1 bg-[var(--line)] rounded-full overflow-hidden flex items-center",
        className
      )}
    >
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[var(--line-strong)] z-10" />

      {isNegative && (
        <div
          className={cn("absolute right-1/2 h-full rounded-l-full transition-all duration-300", barColor)}
          style={{ width: `${percent}%` }}
        />
      )}

      {isPositive && (
        <div
          className={cn("absolute left-1/2 h-full rounded-r-full transition-all duration-300", barColor)}
          style={{ width: `${percent}%` }}
        />
      )}
    </div>
  );
}
