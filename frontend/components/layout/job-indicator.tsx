"use client";

import React, { useState } from "react";
import { useApp } from "../../lib/store/app-context";
import { Loader2, CheckCircle2, ChevronRight, X } from "lucide-react";
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
          "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30 hover:bg-[var(--accent-subtle)]/80"
        )}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="font-mono">{activeJobs.length} active</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] shadow-2xl z-50 p-3 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)] font-medium text-[var(--fg)]">
              <span>Active Background Jobs</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[var(--fg-subtle)] hover:text-[var(--fg)] p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div key={job.id} className="p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)]">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[var(--fg)] mb-1">
                    <span className="truncate flex-1 pr-2">{job.title}</span>
                    <span className="font-mono text-[var(--accent)]">{job.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-[var(--fg-subtle)]">
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
