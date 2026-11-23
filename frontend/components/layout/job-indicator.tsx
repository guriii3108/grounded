"use client";

import React, { useState } from "react";
import { useApp } from "../../lib/store/app-context";
import { Loader2, X } from "lucide-react";
import { cn } from "../../lib/utils";

export function JobIndicator() {
  const { activeJobs } = useApp();
  const [open, setOpen] = useState(false);

  if (activeJobs.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer",
          "bg-[var(--accent-subtle)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--accent-subtle)]/80"
        )}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
        <span className="font-mono-numbers">{activeJobs.length} active</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 rounded-[14px] bg-[var(--surface)] border border-[var(--line-strong)] shadow-2xl z-50 p-4 text-xs animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--line)] font-medium text-[var(--ink)]">
              <span>Active background jobs</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[var(--subtle)] hover:text-[var(--ink)] p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div key={job.id} className="p-2.5 rounded-[10px] bg-[var(--surface-2)] border border-[var(--line)]">
                  <div className="flex items-center justify-between text-xs font-medium text-[var(--ink)] mb-1">
                    <span className="truncate flex-1 pr-2">{job.title}</span>
                    <span className="font-mono-numbers text-[var(--accent)]">{job.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[11px] text-[var(--muted)]">
                    <span className="truncate">{job.target}</span>
                    <span className="capitalize">{job.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
