"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { FileText, CheckCircle2 } from "lucide-react";
import { RetrievedChunk } from "../../lib/types";

interface ChunkViewProps {
  chunk: RetrievedChunk;
  citationIndex?: number;
  highlighted?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function ChunkView({
  chunk,
  citationIndex,
  highlighted = false,
  onSelect,
  className,
}: ChunkViewProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative p-3 rounded-lg border transition-all text-xs",
        highlighted
          ? "bg-[var(--accent-subtle)] border-[var(--accent)] ring-1 ring-[var(--accent)]"
          : "bg-[var(--bg-elevated)] border-[var(--border)] hover:border-[var(--border-strong)]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {citationIndex !== undefined ? (
            <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold bg-[var(--accent)] text-white shrink-0">
              [{citationIndex}]
            </span>
          ) : (
            <FileText className="w-3.5 h-3.5 text-[var(--fg-subtle)] shrink-0" />
          )}
          <span className="font-medium text-[var(--fg)] truncate">
            {chunk.docName}
          </span>
          <span className="text-[10px] font-mono text-[var(--fg-subtle)] shrink-0">
            p. {chunk.page}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {chunk.isGroundTruth && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--positive-subtle)] text-[var(--positive)] border border-[var(--positive)]/20">
              <CheckCircle2 className="w-3 h-3" />
              Ground Truth
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--bg-subtle)] text-[var(--fg-muted)] border border-[var(--border)]">
            {(chunk.score * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <p className="text-[var(--fg-muted)] leading-relaxed text-[11px] font-sans">
        {chunk.text}
      </p>

      <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-[var(--fg-subtle)] border-t border-[var(--border)]/50">
        <span className="font-mono">ID: {chunk.id}</span>
        <span className="capitalize">{chunk.retrievalType} retrieval</span>
      </div>
    </div>
  );
}
