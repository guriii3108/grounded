"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketing = pathname === "/";

  if (isMarketing) {
    return (
      <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--ink)] overflow-x-hidden">
        {children}
        <CommandPalette />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--ink)]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto min-w-0 bg-[var(--bg)] page-enter">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
