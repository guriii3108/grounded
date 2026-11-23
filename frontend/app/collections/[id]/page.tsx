"use client";

import React, { useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../lib/store/app-context";
import { StatusPill } from "../../../components/ui/status-pill";
import { formatRelativeTime } from "../../../lib/format";
import {
  FileText,
  UploadCloud,
  Database,
  MessageSquare,
  AlertTriangle,
  RotateCcw,
  X,
  Info,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { DocumentItem } from "../../../lib/types";

function CollectionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { collections, addDocument, retryDocument, deleteCollection } = useApp();

  const collectionId = params.id as string;
  const collection = collections.find((c) => c.id === collectionId);

  const [activeTab, setActiveTab] = useState<"documents" | "indexes" | "settings">("documents");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFailedDoc, setSelectedFailedDoc] = useState<DocumentItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  if (!collection) {
    return (
      <div className="pt-16 pb-24 px-6 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-[var(--ink)]">Collection not found</h2>
        <p className="text-xs text-[var(--muted)]">The requested collection does not exist or was removed.</p>
        <button
          type="button"
          onClick={() => router.push("/collections")}
          className="px-4 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--ink)] cursor-pointer"
        >
          Back to collections
        </button>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        addDocument(collection.id, file);
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
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
    <div className="pt-8 pb-16 px-6 sm:px-10 max-w-7xl mx-auto space-y-6">
      {/* Detail Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
              {collection.name}
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono-numbers bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
              {collection.id}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl leading-relaxed">
            {collection.description}
          </p>
        </div>

        {/* Action button to Grounded Chat */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => router.push(`/collections/${collection.id}/chat`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Grounded Chat</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer",
            activeTab === "documents"
              ? "border-[var(--accent-bright)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Documents ({collection.documents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("indexes")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer",
            activeTab === "indexes"
              ? "border-[var(--accent-bright)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          )}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Indexes ({collection.indexes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer",
            activeTab === "settings"
              ? "border-[var(--accent-bright)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          )}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Tab: Documents */}
      {activeTab === "documents" && (
        <div className="space-y-5">
          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center p-7 rounded-lg border border-dashed transition-all",
              isDragging
                ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                : "border-[var(--line-strong)] bg-[var(--surface-2)]/40 hover:bg-[var(--surface-2)]/70"
            )}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.md,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-7 h-7 text-[var(--accent-bright)] mb-2" />
            <div className="text-xs font-medium text-[var(--ink)]">
              Drop documents here to ingest, or <span className="text-[var(--accent-bright)] underline">browse files</span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-0.5 text-center max-w-md">
              Supports PDF, DOCX, Markdown, and Plain Text. Chunking and embeddings run asynchronously.
            </p>
          </div>

          {/* Documents Table */}
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-2)]/70 border-b border-[var(--line)] text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">
                  <tr className="h-9">
                    <th className="py-2 px-4 font-semibold">Document</th>
                    <th className="py-2 px-4 font-semibold">Type</th>
                    <th className="py-2 px-4 font-semibold text-right">Size</th>
                    <th className="py-2 px-4 font-semibold text-right">Pages</th>
                    <th className="py-2 px-4 font-semibold text-right">Chunks</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                    <th className="py-2 px-4 font-semibold text-right">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {collection.documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className={cn(
                        "h-11 hover:bg-[var(--surface-2)]/50 transition-colors",
                        doc.status === "failed" && "bg-[var(--negative-subtle)]"
                      )}
                    >
                      <td className="py-2 px-4 font-medium text-[var(--ink)]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[var(--subtle)] shrink-0" />
                          <span className="truncate max-w-xs">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-numbers bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right font-mono-numbers text-[11px] text-[var(--muted)] tabular-nums">
                        {(doc.sizeBytes / 1024).toFixed(0)} KB
                      </td>
                      <td className="py-2 px-4 text-right font-mono-numbers text-[11px] text-[var(--muted)] tabular-nums">
                        {doc.pages}
                      </td>
                      <td className="py-2 px-4 text-right font-mono-numbers font-medium text-[var(--ink)] tabular-nums">
                        {doc.chunksCount > 0 ? doc.chunksCount.toLocaleString() : "—"}
                      </td>
                      <td className="py-2 px-4">
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
                      <td className="py-2 px-4 text-right text-[11px] text-[var(--muted)] tabular-nums">
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
        <div className="space-y-5">
          <div className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] flex items-start gap-2.5 text-xs">
            <Info className="w-4 h-4 text-[var(--accent-bright)] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-[var(--ink)]">
                Index Immutability Architecture
              </span>
              <p className="text-[var(--muted)] text-[11px] leading-relaxed">
                Chunk sizes, overlaps, and embedding models determine the vector space. Any change to chunking or embeddings requires a separate index to preserve evaluation comparability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collection.indexes.map((idx) => (
              <div
                key={idx.id}
                className="p-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[var(--accent-bright)]" />
                    <span className="font-semibold text-xs text-[var(--ink)]">
                      {idx.name}
                    </span>
                  </div>
                  {idx.isDefault && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--positive-subtle)] text-[var(--positive)] border border-[var(--positive)]/30">
                      Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono-numbers">
                  <div className="p-2.5 rounded-md bg-[var(--surface-2)] border border-[var(--line)]">
                    <span className="text-[10px] text-[var(--muted)] block font-sans">
                      Embedding model
                    </span>
                    <span className="text-[var(--ink)] font-medium truncate block mt-0.5">
                      {idx.embeddingModel}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-[var(--surface-2)] border border-[var(--line)]">
                    <span className="text-[10px] text-[var(--muted)] block font-sans">
                      Vector dimension
                    </span>
                    <span className="text-[var(--ink)] font-medium block mt-0.5">
                      {idx.dimension} dims
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-[var(--surface-2)] border border-[var(--line)]">
                    <span className="text-[10px] text-[var(--muted)] block font-sans">
                      Chunk size / overlap
                    </span>
                    <span className="text-[var(--ink)] font-medium block mt-0.5">
                      {idx.chunkSize} / {idx.chunkOverlap} tokens
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-[var(--surface-2)] border border-[var(--line)]">
                    <span className="text-[10px] text-[var(--muted)] block font-sans">
                      Indexed chunks
                    </span>
                    <span className="text-[var(--ink)] font-medium block tabular-nums mt-0.5">
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
        <div className="max-w-xl space-y-5">
          <div className="p-5 rounded-lg border border-[var(--line)] bg-[var(--surface)] space-y-3.5 text-xs shadow-xs">
            <h3 className="font-bold text-sm text-[var(--ink)]">
              Collection Properties
            </h3>
            <div>
              <label className="block text-xs font-medium text-[var(--ink)] mb-1">Name</label>
              <input
                type="text"
                defaultValue={collection.name}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--ink)] mb-1">Description</label>
              <textarea
                rows={3}
                defaultValue={collection.description}
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] resize-none outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="p-5 rounded-lg border border-[var(--negative)]/30 bg-[var(--negative-subtle)] space-y-2.5 text-xs">
            <h3 className="font-bold text-sm text-[var(--negative)]">
              Danger Zone
            </h3>
            <p className="text-[var(--muted)] text-[11px] leading-relaxed">
              Deleting this collection will permanently purge {collection.documents.length} documents and {collection.chunksCount.toLocaleString()} vector chunks from the database.
            </p>
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--negative)] hover:opacity-90 text-white font-medium cursor-pointer transition-opacity"
            >
              Delete collection
            </button>
          </div>
        </div>
      )}

      {/* Failed Document Drawer (Sheet) */}
      {selectedFailedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedFailedDoc(null)}
          />

          <div className="relative w-full max-w-md bg-[var(--surface)] border-l border-[var(--line-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--negative)]" />
                <span className="font-semibold text-xs text-[var(--ink)]">
                  Ingestion Failure Details
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFailedDoc(null)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div>
                <span className="text-[11px] text-[var(--muted)]">Document</span>
                <p className="font-mono-numbers text-xs text-[var(--ink)] mt-0.5">
                  {selectedFailedDoc.name}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-[var(--muted)]">Error Code</span>
                <p className="font-mono-numbers text-xs text-[var(--negative)] font-medium mt-0.5">
                  ERR_PDF_CORRUPT_STREAM
                </p>
              </div>

              <div>
                <span className="text-[11px] text-[var(--muted)]">Diagnostics</span>
                <pre className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-[11px] font-mono-numbers text-[var(--negative)] whitespace-pre-wrap leading-relaxed mt-1 overflow-x-auto">
                  {selectedFailedDoc.errorMessage || "Unknown parser exception."}
                  {"\n"}at PdfParser.extractStreams (parser/pdf.py:142)
                  {"\n"}at IngestionWorker.process_chunks (worker/ingest.py:88)
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedFailedDoc(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  retryDocument(collection.id, selectedFailedDoc.id);
                  setSelectedFailedDoc(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry ingestion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="fixed inset-0"
            onClick={() => setDeleteConfirmOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-xl bg-[var(--surface)] border border-[var(--line-strong)] p-5 z-10 text-xs space-y-3.5 shadow-2xl">
            <h3 className="font-bold text-sm text-[var(--ink)]">
              Confirm Collection Deletion
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Are you sure you want to delete <strong className="text-[var(--ink)]">{collection.name}</strong>? This cascades and removes {collection.documents.length} documents and {collection.chunksCount.toLocaleString()} vector chunks.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCollection}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--negative)] text-white font-medium cursor-pointer"
              >
                Delete forever
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
    <Suspense fallback={<div className="p-8 text-xs text-[var(--muted)]">Loading collection...</div>}>
      <CollectionDetailContent />
    </Suspense>
  );
}
