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
} from "lucide-react";
import { cn } from "../../lib/utils";

/* ── Retriever glyph (placeholder until mascot assets exist) ── */
function RetrieverGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Dog silhouette placeholder — simple rounded shape */}
      <ellipse cx="10" cy="12" rx="6" ry="5" fill="var(--accent)" opacity="0.9" />
      <circle cx="10" cy="7" r="4" fill="var(--accent)" opacity="0.9" />
      {/* ears */}
      <ellipse cx="6.5" cy="5" rx="2" ry="3" fill="var(--accent)" opacity="0.75" transform="rotate(-15 6.5 5)" />
      <ellipse cx="13.5" cy="5" rx="2" ry="3" fill="var(--accent)" opacity="0.75" transform="rotate(15 13.5 5)" />
      {/* eye */}
      <circle cx="8.5" cy="6.5" r="0.8" fill="var(--bg)" />
      <circle cx="11.5" cy="6.5" r="0.8" fill="var(--bg)" />
    </svg>
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
        "relative flex flex-col h-screen border-r border-[var(--line)] bg-[var(--surface-2)] select-none transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* ── Brand Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-13 px-3 border-b border-[var(--line)]">
        {!sidebarCollapsed ? (
          <button
            type="button"
            onClick={() => router.push("/collections")}
            className="flex items-center gap-2 cursor-pointer group min-w-0"
          >
            <RetrieverGlyph size={22} />
            <span
              className="font-display text-lg leading-none text-[var(--ink)] tracking-tight truncate"
            >
              Grounded
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/collections")}
            className="mx-auto cursor-pointer"
            title="Grounded"
          >
            <RetrieverGlyph size={22} />
          </button>
        )}

        <button
          type="button"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          title="Toggle sidebar ([)"
          className={cn(
            "p-1.5 rounded-lg text-[var(--subtle)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors cursor-pointer shrink-0",
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
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <button
                type="button"
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-sm font-medium transition-all cursor-pointer text-left",
                  item.match
                    ? "bg-[var(--surface)] text-[var(--ink)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)]/60"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {/* Accent dot for active item */}
                {item.match && !sidebarCollapsed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                )}
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    item.match ? "text-[var(--ink)]" : "text-[var(--subtle)]",
                    // No dot in collapsed mode — icon serves as indicator
                    sidebarCollapsed && item.match && "text-[var(--accent)]"
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
              </button>

              {/* Sub-items for Collections */}
              {!sidebarCollapsed && item.href === "/collections" && (
                <div className="mt-1 pl-5 space-y-0.5">
                  <div className="flex items-center justify-between px-2 py-1 text-xs text-[var(--subtle)]">
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
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded-[8px] text-xs truncate text-left transition-colors cursor-pointer",
                          pathname.includes(`/collections/${col.id}`)
                            ? "text-[var(--accent)] font-medium bg-[var(--accent-subtle)]"
                            : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)]/60"
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
        <div className="p-3 border-t border-[var(--line)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)] shrink-0" />
            <span className="text-[var(--ink)] font-medium">Engine online</span>
            <span className="font-mono-numbers text-[11px] ml-auto text-[var(--subtle)]">pgvector</span>
          </div>
        </div>
      )}
    </aside>
  );
}
