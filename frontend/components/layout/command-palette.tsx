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
  Plus,
  Sun,
  Moon,
  Search,
  FileText,
  Layers,
  ArrowRight,
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-in fade-in duration-100">
      <div
        className="fixed inset-0"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden z-10 text-xs">
        <Command className="w-full">
          <div className="flex items-center px-3.5 border-b border-[var(--border)]">
            <Search className="w-4 h-4 text-[var(--fg-subtle)] mr-2 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a command, jump to collection, run, or setting..."
              className="w-full py-3 bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] outline-none"
            />
            <span className="px-1.5 py-0.5 rounded border border-[var(--border)] text-[10px] text-[var(--fg-subtle)] font-mono">
              ESC
            </span>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-[var(--fg-muted)]">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] px-2 py-1.5">
              <Command.Item
                onSelect={() => navigate("/collections")}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-[var(--fg)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-[var(--accent)]" />
                  <span>Collections</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--fg-subtle)]">G C</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate("/evals")}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-[var(--fg)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--accent)]" />
                  <span>Evaluations Hub</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--fg-subtle)]">G E</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate("/compare")}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-[var(--fg)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-[var(--accent)]" />
                  <span>Compare Runs</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--fg-subtle)]">G P</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate("/settings")}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-[var(--fg)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[var(--accent)]" />
                  <span>Settings: Providers & Models</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--fg-subtle)]">G S</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Collections" className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] px-2 py-1.5 mt-2">
              {collections.map((col) => (
                <Command.Item
                  key={col.id}
                  onSelect={() => navigate(`/collections/${col.id}`)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-[var(--fg)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-[var(--fg-subtle)] shrink-0" />
                    <span className="truncate">{col.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--fg-subtle)] shrink-0">
                    {col.documentsCount} docs
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Recent Eval Runs" className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] px-2 py-1.5 mt-2">
              {evalRuns.map((run) => (
                <Command.Item
                  key={run.id}
                  onSelect={() => navigate(`/evals/runs/${run.id}`)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-[var(--fg)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Layers className="w-3.5 h-3.5 text-[var(--fg-subtle)] shrink-0" />
                    <span className="truncate">{run.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--positive)] shrink-0">
                    F: {(run.faithfulness * 100).toFixed(0)}%
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Preferences" className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] px-2 py-1.5 mt-2">
              <Command.Item
                onSelect={toggleTheme}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-[var(--fg)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {theme === "dark" ? <Sun className="w-4 h-4 text-[var(--warning)]" /> : <Moon className="w-4 h-4 text-[var(--accent)]" />}
                  <span>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--fg-subtle)]">Current: {theme}</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--border)] bg-[var(--bg-subtle)] text-[11px] text-[var(--fg-subtle)]">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>[ Sidebar</span>
            </div>
            <span>Grounded v0.1</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
