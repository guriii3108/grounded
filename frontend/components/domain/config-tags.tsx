"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { PipelineConfig } from "../../lib/types";

interface ConfigTagsProps {
  config: PipelineConfig;
  className?: string;
  size?: "sm" | "md";
}

export function ConfigTags({ config, className, size = "sm" }: ConfigTagsProps) {
  const modelShortName = config.chat_model.split("/").pop() || config.chat_model;
  const embedShortName = config.embedding_model.split("/").pop() || config.embedding_model;

  const baseTagClass = cn(
    "inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[11px] font-medium border",
    size === "sm" ? "text-[10px]" : "text-xs"
  );

  return (
    <div className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <span className={cn(baseTagClass, "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30")}>
        {modelShortName}
      </span>
      <span className={cn(baseTagClass, "bg-[var(--bg-subtle)] text-[var(--fg-muted)] border-[var(--border)]")}>
        {config.retrieval_mode}
      </span>
      <span className={cn(baseTagClass, "bg-[var(--bg-subtle)] text-[var(--fg-muted)] border-[var(--border)]")}>
        k={config.top_k}
      </span>
      <span className={cn(baseTagClass, "bg-[var(--bg-subtle)] text-[var(--fg-subtle)] border-[var(--border)]")}>
        {config.chunk_size}/{config.chunk_overlap}
      </span>
      <span className={cn(baseTagClass, "bg-[var(--bg-subtle)] text-[var(--fg-subtle)] border-[var(--border)] hidden sm:inline-flex")}>
        {embedShortName}
      </span>
    </div>
  );
}
