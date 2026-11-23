"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "../../lib/store/app-context";
import {
  FolderKanban,
  CheckCircle,
  GitCompare,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { cn } from "../../lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collections, sidebarCollapsed, setSidebarCollapsed } = useApp();
  const [collectionsExpanded, setCollectionsExpanded] = useState(true);

  const navItems = [
    {
      label: "Collections",
      href: "/collections",
      icon: FolderKanban,
      match: pathname.startsWith("/collections"),
    },
    {
      label: "Evals",
      href: "/evals",
      icon: CheckCircle,
      match: pathname.startsWith("/evals"),
    },
    {
      label: "Compare",
      href: "/compare",
      icon: GitCompare,
      match: pathname.startsWith("/compare"),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      match: pathname.startsWith("/settings"),
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-[var(--border)] bg-[var(--bg-subtle)] select-none transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-13 px-3.5 border-b border-[var(--border)]">
        {!sidebarCollapsed ? (
          <div
            onClick={() => router.push("/collections")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center text-white shadow-xs">
              <span className="font-mono font-bold text-xs">G</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xs tracking-tight text-[var(--fg)]">
                Grounded
              </span>
              <span className="text-[9px] font-mono text-[var(--fg-subtle)] uppercase tracking-wider">
                RAG Engine
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => router.push("/collections")}
            className="mx-auto w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center text-white cursor-pointer"
          >
            <span className="font-mono font-bold text-xs">G</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          title="Toggle sidebar ([)"
          className={cn(
            "p-1.5 rounded-md text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer",
            sidebarCollapsed && "mx-auto"
          )}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <button
                type="button"
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left",
                  item.match
                    ? "bg-[var(--bg-elevated)] text-[var(--fg)] border border-[var(--border)] shadow-xs"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)]/60"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    item.match ? "text-[var(--accent)]" : "text-[var(--fg-subtle)]"
                  )}
                />
                {!sidebarCollapsed && <span className="flex-1 truncate">{item.label}</span>}
              </button>

              {/* Expandable sub-items for Collections */}
              {!sidebarCollapsed && item.href === "/collections" && (
                <div className="mt-1 pl-4 space-y-0.5">
                  <div className="flex items-center justify-between px-2 py-1 text-[10px] uppercase font-semibold text-[var(--fg-subtle)] tracking-wider">
                    <span>Recent</span>
                    <button
                      type="button"
                      onClick={() => setCollectionsExpanded((p) => !p)}
                      className="p-0.5 hover:text-[var(--fg)] cursor-pointer"
                    >
                      {collectionsExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {collectionsExpanded &&
                    collections.slice(0, 4).map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => router.push(`/collections/${col.id}`)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1 rounded text-[11px] truncate text-left transition-colors cursor-pointer",
                          pathname.includes(`/collections/${col.id}`)
                            ? "text-[var(--accent)] font-medium bg-[var(--accent-subtle)]"
                            : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                        )}
                      >
                        <FileText className="w-3 h-3 shrink-0 text-[var(--fg-subtle)]" />
                        <span className="truncate">{col.name}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-elevated)]/50">
          <div className="flex items-center justify-between text-[11px] text-[var(--fg-subtle)]">
            <span className="flex items-center gap-1.5 font-medium text-[var(--fg)]">
              <span className="w-2 h-2 rounded-full bg-[var(--positive)] animate-pulse" />
              Engine Online
            </span>
            <span className="font-mono text-[10px]">pgvector</span>
          </div>
          <p className="text-[10px] text-[var(--fg-subtle)] mt-1 truncate">
            Every answer grounded.
          </p>
        </div>
      )}
    </aside>
  );
}
