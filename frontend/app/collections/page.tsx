"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../lib/store/app-context";
import { StatusPill } from "../../components/ui/status-pill";
import { EmptyState } from "../../components/domain/empty-state";
import { formatRelativeTime } from "../../lib/format";
import {
  FolderKanban,
  Plus,
  Search,
  LayoutGrid,
  List,
  FileText,
  Layers,
  ArrowRight,
  Database,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function CollectionsPage() {
  const router = useRouter();
  const { collections, providers, addCollection, loadSampleDataset } = useApp();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New collection form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [embeddingModel, setEmbeddingModel] = useState("openai/text-embedding-3-small");

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Collect available embedding models
  const embeddingModels = providers.flatMap((p) =>
    p.models
      .filter((m) => m.capabilities.includes("embedding"))
      .map((m) => ({
        id: `${p.type}/${m.id}`,
        label: `${p.name} · ${m.name}`,
      }))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newCol = addCollection(name, description, embeddingModel);
    setIsCreateOpen(false);
    setName("");
    setDescription("");
    router.push(`/collections/${newCol.id}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--fg)]">
            Collections
          </h1>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5">
            Organize knowledge bases, manage chunking strategies, and bind embedding indexes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create collection</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & View Toggle */}
      {collections.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)]" />
            <input
              type="search"
              placeholder="Filter collections by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--fg)] placeholder:text-[var(--fg-subtle)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table View"
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs"
                  : "text-[var(--fg-subtle)] hover:text-[var(--fg)]"
              )}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs"
                  : "text-[var(--fg-subtle)] hover:text-[var(--fg)]"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {collections.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No collections yet"
          description="Create your first collection to ingest documents, or load our pre-configured evaluation dataset to test the full pipeline immediately."
          primaryAction={{
            label: "Create collection",
            onClick: () => setIsCreateOpen(true),
          }}
          secondaryAction={{
            label: "Load sample dataset",
            onClick: loadSampleDataset,
          }}
        />
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-subtle)] font-medium">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Name & Description</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Documents</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Chunks</th>
                  <th className="py-2.5 px-4 font-semibold">Active Index</th>
                  <th className="py-2.5 px-4 font-semibold">Last Indexed</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredCollections.map((col) => (
                  <tr
                    key={col.id}
                    onClick={() => router.push(`/collections/${col.id}`)}
                    className="hover:bg-[var(--bg-subtle)]/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                        {col.name}
                      </div>
                      <div className="text-[11px] text-[var(--fg-muted)] truncate mt-0.5">
                        {col.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-[var(--fg)] tabular-nums">
                      {col.documentsCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[var(--fg-muted)] tabular-nums">
                      {col.chunksCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/20">
                        <Database className="w-3 h-3" />
                        {col.activeEmbeddingModel.split("/").pop()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--fg-subtle)] tabular-nums">
                      {formatRelativeTime(col.lastIndexedAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--fg-subtle)] group-hover:text-[var(--accent)] transition-colors">
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCollections.map((col) => (
            <div
              key={col.id}
              onClick={() => router.push(`/collections/${col.id}`)}
              className="group p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                    <FolderKanban className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                    {formatRelativeTime(col.lastIndexedAt)}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-[var(--fg-muted)] mt-1 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--fg-muted)]">
                  <span>{col.documentsCount} docs</span>
                  <span>•</span>
                  <span>{col.chunksCount.toLocaleString()} chunks</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--fg-subtle)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsCreateOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
              <h2 className="text-sm font-bold text-[var(--fg)]">
                Create Knowledge Collection
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-medium text-[var(--fg)] mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SEC 10-K Filings 2025"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--fg)] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What knowledge does this collection contain?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--fg)] mb-1">
                  Initial Embedding Model
                </label>
                <select
                  value={embeddingModel}
                  onChange={(e) => setEmbeddingModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                >
                  {embeddingModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[var(--fg-subtle)] mt-1.5">
                  Note: Chunking strategy and vector dimensions are bound to this index.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] hover:bg-[var(--bg)] text-[var(--fg)] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium cursor-pointer"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
