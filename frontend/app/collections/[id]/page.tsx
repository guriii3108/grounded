"use client";

import React, { useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../lib/store/app-context";
import { StatusPill } from "../../../components/ui/status-pill";
import { formatRelativeTime } from "../../../lib/format";
import { DocumentItem } from "../../../lib/types";
import {
  UploadCloud,
  MessageSquare,
  FileText,
  Database,
  Settings as SettingsIcon,
  Trash2,
  AlertTriangle,
  RotateCcw,
  X,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Info,
} from "lucide-react";
import { cn } from "../../../lib/utils";

function CollectionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;
  const { collections, addDocument, retryDocument, deleteCollection } = useApp();

  const collection = collections.find((c) => c.id === collectionId);

  const [activeTab, setActiveTab] = useState<"documents" | "indexes" | "settings">("documents");
  const [selectedFailedDoc, setSelectedFailedDoc] = useState<DocumentItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!collection) {
    return (
      <div className="p-8 text-center text-xs text-[var(--fg-muted)]">
        Collection not found.
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => {
        addDocument(collection.id, file);
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        addDocument(collection.id, file);
      });
    }
  };

  const handleDeleteCollection = () => {
    deleteCollection(collection.id);
    router.push("/collections");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Detail Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[var(--fg)]">
              {collection.name}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--bg-subtle)] text-[var(--fg-subtle)] border border-[var(--border)]">
              ID: {collection.id}
            </span>
          </div>
          <p className="text-xs text-[var(--fg-muted)] mt-1 max-w-2xl">
            {collection.description}
          </p>
        </div>

        {/* Persistent "Open chat" signature button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/collections/${collection.id}/chat`)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Grounded Chat</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer",
            activeTab === "documents"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Documents ({collection.documents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("indexes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer",
            activeTab === "indexes"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
          )}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Indexes ({collection.indexes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer",
            activeTab === "settings"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
          )}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Tab: Documents */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center p-6 rounded-xl border border-dashed transition-all",
              isDragging
                ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                : "border-[var(--border-strong)] bg-[var(--bg-subtle)]/40 hover:bg-[var(--bg-subtle)]"
            )}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.md,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-8 h-8 text-[var(--accent)] mb-2" />
            <div className="text-xs font-semibold text-[var(--fg)]">
              Drop documents here to ingest, or <span className="text-[var(--accent)] underline">browse files</span>
            </div>
            <p className="text-[11px] text-[var(--fg-subtle)] mt-1">
              Supports PDF, DOCX, Markdown, and Plain Text. Ingestion parses sections, chunks, and computes pgvector embeddings asynchronously.
            </p>
          </div>

          {/* Documents Table */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-subtle)] font-medium">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Document</th>
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Size</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Pages</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Chunks</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {collection.documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className={cn(
                        "hover:bg-[var(--bg-subtle)]/60 transition-colors",
                        doc.status === "failed" && "bg-[var(--negative-subtle)]/20"
                      )}
                    >
                      <td className="py-3 px-4 font-medium text-[var(--fg)]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[var(--fg-subtle)] shrink-0" />
                          <span className="truncate max-w-xs">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-semibold bg-[var(--bg-subtle)] text-[var(--fg-muted)] border border-[var(--border)]">
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[var(--fg-muted)] tabular-nums">
                        {(doc.sizeBytes / 1024).toFixed(0)} KB
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[var(--fg-muted)] tabular-nums">
                        {doc.pages}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-[var(--fg)] tabular-nums">
                        {doc.chunksCount > 0 ? doc.chunksCount.toLocaleString() : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <StatusPill
                          status={doc.status}
                          progressPercent={doc.progressPercent}
                          onClick={
                            doc.status === "failed"
                              ? () => setSelectedFailedDoc(doc)
                              : undefined
                          }
                        />
                      </td>
                      <td className="py-3 px-4 text-right text-[var(--fg-subtle)] tabular-nums">
                        {formatRelativeTime(doc.addedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Indexes */}
      {activeTab === "indexes" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-subtle)] flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-[var(--fg)]">
                Index Immutability Architecture
              </span>
              <p className="text-[var(--fg-muted)] leading-relaxed">
                Chunk sizes, overlaps, and embedding models determine the vector space. Any change to chunking or embeddings requires a separate index to preserve evaluation comparability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collection.indexes.map((idx) => (
              <div
                key={idx.id}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[var(--accent)]" />
                    <span className="font-semibold text-xs text-[var(--fg)]">
                      {idx.name}
                    </span>
                  </div>
                  {idx.isDefault && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--positive-subtle)] text-[var(--positive)] border border-[var(--positive)]/30">
                      Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--fg-subtle)] block">
                      Embedding Model
                    </span>
                    <span className="text-[var(--fg)] font-medium truncate block">
                      {idx.embeddingModel}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--fg-subtle)] block">
                      Vector Dimension
                    </span>
                    <span className="text-[var(--fg)] font-medium block">
                      {idx.dimension} dims
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--fg-subtle)] block">
                      Chunk Size / Overlap
                    </span>
                    <span className="text-[var(--fg)] font-medium block">
                      {idx.chunkSize} / {idx.chunkOverlap} tokens
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-subtle)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--fg-subtle)] block">
                      Indexed Chunks
                    </span>
                    <span className="text-[var(--fg)] font-medium block tabular-nums">
                      {idx.chunkCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === "settings" && (
        <div className="max-w-xl space-y-6">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] space-y-4 text-xs">
            <h3 className="font-semibold text-sm text-[var(--fg)]">
              Collection Properties
            </h3>
            <div>
              <label className="block text-[var(--fg-muted)] mb-1">Name</label>
              <input
                type="text"
                defaultValue={collection.name}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)]"
              />
            </div>
            <div>
              <label className="block text-[var(--fg-muted)] mb-1">Description</label>
              <textarea
                rows={3}
                defaultValue={collection.description}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)] resize-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--negative)]/30 bg-[var(--negative-subtle)]/10 space-y-3 text-xs">
            <h3 className="font-semibold text-sm text-[var(--negative)]">
              Danger Zone
            </h3>
            <p className="text-[var(--fg-muted)] leading-relaxed">
              Deleting this collection will permanently purge {collection.documents.length} documents and {collection.chunksCount.toLocaleString()} vector chunks from pgvector.
            </p>
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--negative)] hover:bg-[var(--negative)]/90 text-white font-medium cursor-pointer"
            >
              Delete Collection
            </button>
          </div>
        </div>
      )}

      {/* Failed Document Drawer (Sheet) */}
      {selectedFailedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedFailedDoc(null)}
          />

          <div className="relative w-full max-w-md bg-[var(--bg-elevated)] border-l border-[var(--border-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--negative)]" />
                <span className="font-semibold text-sm text-[var(--fg)]">
                  Ingestion Failure Details
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFailedDoc(null)}
                className="p-1 rounded text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div>
                <span className="text-[10px] text-[var(--fg-subtle)] uppercase tracking-wider font-semibold">
                  Document
                </span>
                <p className="font-mono text-xs text-[var(--fg)] mt-0.5">
                  {selectedFailedDoc.name}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[var(--fg-subtle)] uppercase tracking-wider font-semibold">
                  Error Code
                </span>
                <p className="font-mono text-xs text-[var(--negative)] font-medium mt-0.5">
                  ERR_PDF_CORRUPT_STREAM
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[var(--fg-subtle)] uppercase tracking-wider font-semibold">
                  Stack Trace & Diagnostics
                </span>
                <pre className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-[var(--negative)] whitespace-pre-wrap leading-relaxed mt-1 overflow-x-auto">
                  {selectedFailedDoc.errorMessage || "Unknown parser exception."}
                  {"\n"}at PdfParser.extractStreams (parser/pdf.py:142)
                  {"\n"}at IngestionWorker.process_chunks (worker/ingest.py:88)
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-subtle)] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedFailedDoc(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg)] font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  retryDocument(collection.id, selectedFailedDoc.id);
                  setSelectedFailedDoc(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Ingestion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="fixed inset-0"
            onClick={() => setDeleteConfirmOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] p-5 z-10 text-xs space-y-4">
            <h3 className="text-sm font-bold text-[var(--fg)]">
              Confirm Collection Deletion
            </h3>
            <p className="text-[var(--fg-muted)] leading-relaxed">
              Are you sure you want to delete <strong className="text-[var(--fg)]">{collection.name}</strong>? This cascades and removes {collection.documents.length} documents and {collection.chunksCount.toLocaleString()} vector chunks.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--fg)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCollection}
                className="px-3 py-1.5 rounded-lg bg-[var(--negative)] text-white font-medium"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CollectionDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[var(--fg-muted)]">Loading collection...</div>}>
      <CollectionDetailContent />
    </Suspense>
  );
}
