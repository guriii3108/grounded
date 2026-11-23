"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "../../lib/store/app-context";
import { JobIndicator } from "./job-indicator";
import {
  Search,
  Sun,
  Moon,
  ChevronRight,
  Database,
  ExternalLink,
} from "lucide-react";
import { cn } from "../../lib/utils";

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, setCommandPaletteOpen, collections, evalRuns } = useApp();

  // Generate dynamic breadcrumb items
  const pathSegments = pathname.split("/").filter(Boolean);

  const getBreadcrumbs = () => {
    if (pathSegments.length === 0) return [{ label: "Home", href: "/" }];

    const crumbs: { label: string; href: string }[] = [];
    let currentPath = "";

    pathSegments.forEach((seg, idx) => {
      currentPath += `/${seg}`;

      if (seg === "collections") {
        crumbs.push({ label: "Collections", href: "/collections" });
      } else if (pathSegments[idx - 1] === "collections") {
        const col = collections.find((c) => c.id === seg);
        crumbs.push({ label: col ? col.name : seg, href: currentPath });
      } else if (seg === "chat") {
        crumbs.push({ label: "Grounded Chat", href: currentPath });
      } else if (seg === "evals") {
        crumbs.push({ label: "Evaluations", href: "/evals" });
      } else if (seg === "runs" && pathSegments[idx + 1]) {
        // Run detail
        const runId = pathSegments[idx + 1];
        const run = evalRuns.find((r) => r.id === runId);
        crumbs.push({ label: "Runs", href: "/evals" });
        crumbs.push({ label: run ? run.name : runId, href: currentPath + `/${runId}` });
      } else if (seg === "test-sets") {
        crumbs.push({ label: "Test Sets", href: "/evals" });
      } else if (seg === "compare") {
        crumbs.push({ label: "A/B Compare Runs", href: "/compare" });
      } else if (seg === "settings") {
        crumbs.push({ label: "Settings", href: "/settings" });
      }
    });

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-13 px-4 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between gap-4 shrink-0 select-none sticky top-0 z-20">
      {/* Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)] min-w-0">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--fg-subtle)] shrink-0" />}
            {idx === breadcrumbs.length - 1 ? (
              <span className="font-medium text-[var(--fg)] truncate max-w-xs">
                {crumb.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => router.push(crumb.href)}
                className="hover:text-[var(--fg)] truncate transition-colors cursor-pointer"
              >
                {crumb.label}
              </button>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Center ⌘K Trigger */}
      <div className="flex-1 max-w-md hidden md:flex items-center justify-center">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full max-w-sm flex items-center justify-between px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-strong)] text-xs text-[var(--fg-subtle)] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[var(--fg-subtle)]" />
            <span>Search collections, runs, models...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--border-strong)] bg-[var(--bg)] font-mono text-[10px] text-[var(--fg-muted)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Job Indicator, Theme Toggle, Version */}
      <div className="flex items-center gap-2.5 shrink-0">
        <JobIndicator />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-[var(--warning)]" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--accent)]" />
          )}
        </button>
      </div>
    </header>
  );
}
