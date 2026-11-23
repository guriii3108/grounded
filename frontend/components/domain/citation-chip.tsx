"use client";

import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { FileText } from "lucide-react";
import { RetrievedChunk } from "../../lib/types";

interface CitationChipProps {
  index: number;
  chunk?: RetrievedChunk;
  onClick?: () => void;
  className?: string;
}

export function CitationChip({ index, chunk, onClick, className }: CitationChipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span className="relative inline-block mx-0.5 align-baseline">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "inline-flex items-center justify-center min-w-[20px] h-[18px] px-1 text-[11px] font-mono-numbers rounded-[4px] transition-all duration-150 cursor-pointer",
          "bg-[var(--accent-subtle)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-fg)]",
          className
        )}
        aria-label={`Citation ${index}${chunk ? `: ${chunk.docName} page ${chunk.page}` : ""}`}
      >
        {index}
      </button>

      {/* Popover on hover */}
      {isHovered && chunk && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 rounded-[14px] bg-[var(--surface)] border border-[var(--line-strong)] shadow-xl z-50 text-left text-xs pointer-events-none animate-in fade-in duration-100">
          <div className="flex items-center gap-1.5 font-medium text-[var(--ink)] mb-1.5 pb-1.5 border-b border-[var(--line)]">
            <FileText className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span className="truncate flex-1">{chunk.docName}</span>
            <span className="font-mono-numbers text-[10px] text-[var(--subtle)] shrink-0">
              p. {chunk.page}
            </span>
          </div>

          <p className="text-[var(--muted)] line-clamp-3 text-[11px] leading-relaxed italic">
            &ldquo;{chunk.text}&rdquo;
          </p>

          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--line)] text-[10px] text-[var(--subtle)] font-mono-numbers">
            <span>Score {(chunk.score * 100).toFixed(0)}%</span>
            <span className="text-[var(--accent)]">Click to highlight</span>
          </div>
        </div>
      )}
    </span>
  );
}
