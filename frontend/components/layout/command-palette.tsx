"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useApp } from "../../lib/store/app-context";
import {
  FolderKanban,
  CheckCircle,
  GitCompare,
  Settings,
  Sun,
  Moon,
  Search,
  FileText,
  Layers,
} from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    collections,
    evalRuns,
    theme,
    toggleTheme,
  } = useApp();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const navigate = (path: string) => {
    setCommandPaletteOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-in fade-in duration-100">
      <div
        className="fixed inset-0"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-[var(--surface)] border border-[var(--line-strong)] rounded-xl shadow-2xl overflow-hidden z-10 text-sm">
        <Command className="w-full">
          <div className="flex items-center px-4 border-b border-[var(--line)]">
            <Search className="w-4 h-4 text-[var(--subtle)] mr-2.5 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search collections, runs, models or actions…"
              className="w-full py-3.5 bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--subtle)] outline-none"
            />
            <span className="px-1.5 py-0.5 rounded border border-[var(--line)] text-[10px] text-[var(--subtle)] font-mono-numbers shrink-0">
              ESC
            </span>
          </div>

          <Command.List className="max-h-[320px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-xs text-[var(--muted)]">
              No results found.
            </Command.Empty>

            {/* Navigation group */}
            <Command.Group
              heading="Navigation"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--subtle)] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              {[
                { label: "Collections", href: "/collections", icon: FolderKanban, kbd: "G C" },
                { label: "Evaluations", href: "/evals", icon: CheckCircle, kbd: "G E" },
                { label: "Compare runs", href: "/compare", icon: GitCompare, kbd: "G P" },
                { label: "Settings", href: "/settings", icon: Settings, kbd: "G S" },
              ].map((item) => (
                <Command.Item
                  key={item.href}
                  onSelect={() => navigate(item.href)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[var(--ink)] data-[selected=true]:bg-[var(--surface-2)] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 text-[var(--accent-bright)]" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono-numbers text-[10px] text-[var(--subtle)] px-1.5 py-0.5 rounded border border-[var(--line)] bg-[var(--surface-2)]">
                    {item.kbd}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Collections group */}
            {collections.length > 0 && (
              <Command.Group
                heading="Collections"
                className="mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--subtle)] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
              >
                {collections.slice(0, 5).map((col) => (
                  <Command.Item
                    key={col.id}
                    onSelect={() => navigate(`/collections/${col.id}`)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[var(--ink)] data-[selected=true]:bg-[var(--surface-2)] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-[var(--subtle)] shrink-0" />
                      <span className="truncate">{col.name}</span>
                    </div>
                    <span className="font-mono-numbers text-[11px] text-[var(--muted)] shrink-0">
                      {col.documentsCount} docs
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Evaluation runs group */}
            {evalRuns.length > 0 && (
              <Command.Group
                heading="Recent Evaluations"
                className="mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--subtle)] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
              >
                {evalRuns.slice(0, 4).map((run) => (
                  <Command.Item
                    key={run.id}
                    onSelect={() => navigate(`/evals/runs/${run.id}`)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[var(--ink)] data-[selected=true]:bg-[var(--surface-2)] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Layers className="w-4 h-4 text-[var(--accent-bright)] shrink-0" />
                      <span className="truncate">{run.name}</span>
                    </div>
                    <span className="font-mono-numbers text-[11px] text-[var(--positive)] shrink-0">
                      {run.faithfulness ? `${Math.round(run.faithfulness * 100)}%` : "running"}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Actions */}
            <Command.Group
              heading="Actions"
              className="mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--subtle)] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              <Command.Item
                onSelect={() => {
                  toggleTheme();
                  setCommandPaletteOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[var(--ink)] data-[selected=true]:bg-[var(--surface-2)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-[var(--warning)]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[var(--muted)]" />
                  )}
                  <span>Toggle theme ({theme === "dark" ? "Light" : "Dark"})</span>
                </div>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--line)] bg-[var(--surface-2)]/60 text-[11px] text-[var(--subtle)]">
            <div className="flex items-center gap-3">
              <span>Navigate <kbd className="px-1 py-0.5 rounded bg-[var(--surface)] border border-[var(--line)] font-mono-numbers">↑↓</kbd></span>
              <span>Select <kbd className="px-1 py-0.5 rounded bg-[var(--surface)] border border-[var(--line)] font-mono-numbers">↵</kbd></span>
            </div>
            <span>Grounded Command Palette</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
