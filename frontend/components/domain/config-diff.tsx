"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { PipelineConfig } from "../../lib/types";
import { GitCompare } from "lucide-react";

interface ConfigDiffProps {
  configA: PipelineConfig;
  configB: PipelineConfig;
  className?: string;
}

export function ConfigDiff({ configA, configB, className }: ConfigDiffProps) {
  const keys: (keyof PipelineConfig)[] = [
    "chat_model",
    "retrieval_mode",
    "top_k",
    "chunk_size",
    "chunk_overlap",
    "embedding_model",
    "score_threshold",
    "temperature",
    "system_prompt_template",
  ];

  const diffs = keys
    .map((key) => {
      const valA = configA[key];
      const valB = configB[key];
      const isDifferent = String(valA) !== String(valB);
      return { key, valA, valB, isDifferent };
    })
    .filter((d) => d.isDifferent);

  if (diffs.length === 0) {
    return (
      <div
        className={cn(
          "p-3 rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--muted)] flex items-center gap-2",
          className
        )}
      >
        <GitCompare className="w-4 h-4" />
        <span>Identical configurations — no parameter differences.</span>
      </div>
    );
  }

  return (
    <div className={cn("text-xs", className)}>
      <div className="flex items-center gap-2 text-[var(--muted)] mb-2">
        <GitCompare className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>
          {diffs.length} parameter{diffs.length === 1 ? "" : "s"} changed
        </span>
      </div>

      {/* Compact inline list */}
      <ul className="space-y-1.5">
        {diffs.map(({ key, valA, valB }) => (
          <li key={key} className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono-numbers text-[11px] text-[var(--subtle)] shrink-0">
              {key.replace(/_/g, " ")}
            </span>
            <span className="font-mono-numbers text-[11px] line-through text-[var(--negative)] shrink-0">
              {String(valA)}
            </span>
            <span className="text-[var(--subtle)]">→</span>
            <span className="font-mono-numbers text-[11px] text-[var(--positive)] font-medium shrink-0">
              {String(valB)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
