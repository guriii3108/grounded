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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in duration-100">
      <div
        className="fixed inset-0"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-[var(--surface)] border border-[var(--line-strong)] rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden z-10 text-sm">
        <Command className="w-full">
          <div className="flex items-center px-4 border-b border-[var(--line)]">
            <Search className="w-4 h-4 text-[var(--subtle)] mr-2.5 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a command, collection, or eval run…"
              className="w-full py-3.5 bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--subtle)] outline-none"
            />
            <span className="px-1.5 py-0.5 rounded-[6px] border border-[var(--line)] text-[11px] text-[var(--subtle)] font-mono-numbers shrink-0">
              ESC
            </span>
          </div>

          <Command.List className="max-h-[320px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-[var(--muted)]">
              No results found.
            </Command.Empty>

            {/* Navigation group */}
            <Command.Group
              heading="Navigation"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-[var(--subtle)]"
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
                  className="flex items-center justify-between px-3 py-2 rounded-[10px] text-sm text-[var(--ink)] data-[selected=true]:bg-[var(--surface-2)] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 text-[var(--accent)]" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono-numbers text-[11px] text-[var(--subtle)]">
                    {item.kbd}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Collections */}
            <Command.Group
              heading="Collections"
              className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-[var(--subtle)]"
            >
              {collections.map((col) => (
                <Command.Item
                  key={col.id}
                  onSelect={() => navigate(`/collections/${col.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-[10px] text-sm text-[var(--ink)] data-[selected=true]:bg-[var(--surface-2)] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-[var(--subtle)] shrink-0" />
                    <span className="truncate">{col.name}</span>
                  </div>
                  <span className="font-mono-numbers text-[11px] text-[var(--subtle)] shrink-0">
                    {col.documentsCount} docs
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Eval runs */}
            <Command.Group
              heading="Recent eval runs"
              className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-[var(--subtle)]"
            >
              {evalRuns.map((run) => (
                <Command.Item
                  key={run.id}
                  onSelect={() => navigate(`/evals/runs/${run.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-[10px] text-sm text-[var(--ink)] data-[selected=true]:bg-[var(--surface-2)] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Layers className="w-3.5 h-3.5 text-[var(--subtle)] shrink-0" />
                    <span className="truncate">{run.name}</span>
                  </div>
                  <span className="font-mono-numbers text-[11px] text-[var(--positive)] shrink-0">
                    F {(run.faithfulness * 100).toFixed(0)}%
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Preferences */}
            <Command.Group
              heading="Preferences"
              className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-[var(--subtle)]"
            >
              <Command.Item
                onSelect={toggleTheme}
                className="flex items-center justify-between px-3 py-2 rounded-[10px] text-sm text-[var(--ink)] data-[selected=true]:bg-[var(--surface-2)] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-[var(--warning)]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[var(--muted)]" />
                  )}
                  <span>Toggle {theme === "dark" ? "light" : "dark"} mode</span>
                </div>
                <span className="font-mono-numbers text-[11px] text-[var(--subtle)] capitalize">
                  {theme}
                </span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--line)] bg-[var(--surface-2)] text-[11px] text-[var(--subtle)]">
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
