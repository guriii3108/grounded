"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../lib/store/app-context";
import { EmptyState } from "../../components/domain/empty-state";
import { formatRelativeTime } from "../../lib/format";
import {
  FolderKanban,
  Plus,
  Search,
  LayoutGrid,
  List,
  ArrowRight,
  Database,
  X,
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
    <div className="pt-8 pb-16 px-6 sm:px-10 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
            Collections
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Organize knowledge bases, manage chunking strategies, and bind embedding indexes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create collection</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & View Toggle */}
      {collections.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--subtle)]" />
            <input
              type="search"
              placeholder="Filter collections…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] placeholder:text-[var(--subtle)] outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Table View"
              className={cn(
                "p-1.5 rounded-md text-xs transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs"
                  : "text-[var(--subtle)] hover:text-[var(--ink)]"
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
                  ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs"
                  : "text-[var(--subtle)] hover:text-[var(--ink)]"
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
          mascot="retriever"
          title="No collections yet"
          description="Create your first collection to ingest documents, or load our pre-configured SEC 10-K dataset to test the full pipeline immediately."
          action={{
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
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-2)]/70 border-b border-[var(--line)] text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">
                <tr className="h-9">
                  <th className="py-2 px-4">Name & Description</th>
                  <th className="py-2 px-4 text-right">Documents</th>
                  <th className="py-2 px-4 text-right">Chunks</th>
                  <th className="py-2 px-4">Active Index</th>
                  <th className="py-2 px-4">Last Indexed</th>
                  <th className="py-2 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredCollections.map((col) => (
                  <tr
                    key={col.id}
                    onClick={() => router.push(`/collections/${col.id}`)}
                    className="h-12 hover:bg-[var(--surface-2)]/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-2 px-4 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-xs text-[var(--ink)] group-hover:text-[var(--accent-bright)] transition-colors">
                        {col.name}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                        {col.description}
                      </div>
                    </td>
                    <td className="py-2 px-4 text-right font-mono-numbers font-medium text-[var(--ink)] tabular-nums">
                      {col.documentsCount}
                    </td>
                    <td className="py-2 px-4 text-right font-mono-numbers text-[var(--muted)] tabular-nums">
                      {col.chunksCount.toLocaleString()}
                    </td>
                    <td className="py-2 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono-numbers bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]">
                        <Database className="w-3 h-3 text-[var(--accent-bright)]" />
                        {col.activeEmbeddingModel.split("/").pop()}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-[11px] text-[var(--muted)] tabular-nums">
                      {formatRelativeTime(col.lastIndexedAt)}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--muted)] group-hover:text-[var(--accent-bright)] transition-colors">
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
              className="group p-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]/30 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="w-8 h-8 rounded-md bg-[var(--surface-2)] text-[var(--accent-bright)] flex items-center justify-center border border-[var(--line)]">
                    <FolderKanban className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] text-[var(--subtle)]">
                    {formatRelativeTime(col.lastIndexedAt)}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-[var(--ink)] group-hover:text-[var(--accent-bright)] transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono-numbers text-[11px] text-[var(--muted)]">
                  <span>{col.documentsCount} docs</span>
                  <span>•</span>
                  <span>{col.chunksCount.toLocaleString()} chunks</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--subtle)] group-hover:text-[var(--accent-bright)] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsCreateOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-xl bg-[var(--surface)] border border-[var(--line-strong)] shadow-2xl p-6 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
              <h2 className="font-bold text-base text-[var(--ink)] tracking-tight">
                Create Knowledge Collection
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SEC 10-K Filings 2025"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What knowledge does this collection contain?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)] resize-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                  Embedding Model
                </label>
                <select
                  value={embeddingModel}
                  onChange={(e) => setEmbeddingModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)] transition-colors"
                >
                  {embeddingModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[var(--muted)] mt-1.5">
                  Chunking strategy and vector dimensions are bound to this index.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  Create collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
