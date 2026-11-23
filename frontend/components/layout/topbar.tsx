"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "../../lib/store/app-context";
import { JobIndicator } from "./job-indicator";
import { Search, Sun, Moon, ChevronRight } from "lucide-react";

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, setCommandPaletteOpen, collections, evalRuns } = useApp();

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
        const runId = pathSegments[idx + 1];
        const run = evalRuns.find((r) => r.id === runId);
        crumbs.push({ label: "Runs", href: "/evals" });
        crumbs.push({ label: run ? run.name : runId, href: currentPath + `/${runId}` });
      } else if (seg === "test-sets") {
        crumbs.push({ label: "Test sets", href: "/evals" });
      } else if (seg === "compare") {
        crumbs.push({ label: "A/B compare", href: "/compare" });
      } else if (seg === "settings") {
        crumbs.push({ label: "Settings", href: "/settings" });
      }
    });

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-13 px-4 border-b border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-4 shrink-0 sticky top-0 z-20">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--muted)] min-w-0">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            {idx > 0 && (
              <ChevronRight className="w-3 h-3 text-[var(--subtle)] shrink-0" />
            )}
            {idx === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-[var(--ink)] truncate max-w-xs">
                {crumb.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => router.push(crumb.href)}
                className="hover:text-[var(--ink)] truncate transition-colors cursor-pointer"
              >
                {crumb.label}
              </button>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* ⌘K search trigger */}
      <div className="flex-1 max-w-sm hidden md:flex items-center justify-center">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--line-strong)] text-xs text-[var(--subtle)] transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span className="text-[var(--muted)]">Quick search…</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--line-strong)] bg-[var(--surface)] font-mono-numbers text-[10px] text-[var(--muted)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: job indicator + theme toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <JobIndicator />

        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
          className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-[var(--warning)]" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--muted)]" />
          )}
        </button>
      </div>
    </header>
  );
}
