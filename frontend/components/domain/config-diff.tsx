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
  // Check which keys differ between A and B
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
      <div className={cn("p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-xs text-[var(--fg-subtle)] flex items-center gap-2", className)}>
        <GitCompare className="w-4 h-4" />
        <span>Identical configurations: No parameter differences.</span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3 text-xs", className)}>
      <div className="flex items-center gap-2 font-medium text-[var(--fg)] mb-2.5 pb-2 border-b border-[var(--border)]">
        <GitCompare className="w-4 h-4 text-[var(--accent)]" />
        <span>Configuration Diff</span>
        <span className="text-[10px] text-[var(--fg-subtle)] font-mono">
          ({diffs.length} parameter{diffs.length === 1 ? "" : "s"} modified)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {diffs.map(({ key, valA, valB }) => (
          <div
            key={key}
            className="flex flex-col p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border)] font-mono text-[11px]"
          >
            <span className="text-[var(--fg-subtle)] text-[10px] uppercase font-sans font-medium tracking-wider mb-1">
              {key.replace(/_/g, " ")}
            </span>
            <div className="flex items-center gap-2">
              <span className="line-through text-[var(--negative)] bg-[var(--negative-subtle)] px-1 rounded truncate">
                {String(valA)}
              </span>
              <span className="text-[var(--fg-subtle)]">→</span>
              <span className="text-[var(--positive)] font-semibold bg-[var(--positive-subtle)] px-1 rounded truncate">
                {String(valB)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
