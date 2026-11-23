"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "../../lib/store/app-context";
import {
  FolderKanban,
  CheckCircle,
  GitCompare,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Radio,
} from "lucide-react";
import { cn } from "../../lib/utils";

/* ── Modern Grounded Icon ── */
function GroundedLogo({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xs shadow-indigo-500/20 text-white shrink-0"
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

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
        "relative flex flex-col h-screen border-r border-[var(--line)] bg-[var(--surface)] select-none transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* ── Brand Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-13 px-3 border-b border-[var(--line)]">
        {!sidebarCollapsed ? (
          <button
            type="button"
            onClick={() => router.push("/collections")}
            className="flex items-center gap-2.5 cursor-pointer group min-w-0"
          >
            <GroundedLogo size={22} />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-sm tracking-tight text-[var(--ink)] truncate">
                Grounded
              </span>
              <span className="font-mono-numbers text-[10px] px-1.5 py-0.2 rounded border border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--muted)]">
                v1.2
              </span>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/collections")}
            className="mx-auto cursor-pointer"
            title="Grounded"
          >
            <GroundedLogo size={22} />
          </button>
        )}

        <button
          type="button"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          title="Toggle sidebar ([)"
          className={cn(
            "p-1.5 rounded-md text-[var(--subtle)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer shrink-0",
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

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <button
                type="button"
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all cursor-pointer text-left",
                  item.match
                    ? "bg-[var(--accent-subtle)] text-[var(--accent-bright)] font-semibold shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    item.match ? "text-[var(--accent-bright)]" : "text-[var(--subtle)]"
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {item.match && !sidebarCollapsed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-bright)] shrink-0" />
                )}
              </button>

              {/* Sub-items for Collections */}
              {!sidebarCollapsed && item.href === "/collections" && (
                <div className="mt-1 pl-4 space-y-0.5">
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-[var(--subtle)] tracking-wider uppercase">
                    <span>Recent</span>
                    <button
                      type="button"
                      onClick={() => setCollectionsExpanded((p) => !p)}
                      className="p-0.5 hover:text-[var(--ink)] cursor-pointer transition-colors"
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
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs truncate text-left transition-colors cursor-pointer",
                          pathname.includes(`/collections/${col.id}`)
                            ? "text-[var(--accent-bright)] font-medium bg-[var(--accent-subtle)]"
                            : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
                        )}
                      >
                        <FileText className="w-3 h-3 shrink-0 text-[var(--subtle)]" />
                        <span className="truncate">{col.name}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-[var(--line)] bg-[var(--surface-2)]/50">
          <div className="flex items-center gap-2 text-xs">
            <Radio className="w-3.5 h-3.5 text-[var(--positive)] animate-pulse shrink-0" />
            <span className="text-[var(--ink)] font-medium text-[11px]">Engine ready</span>
            <span className="font-mono-numbers text-[10px] ml-auto px-1.5 py-0.5 rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--subtle)]">
              pgvector
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
