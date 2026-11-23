"use client";

import React, { useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../../lib/store/app-context";
import { MetricValue } from "../../../../components/ui/metric-value";
import { StatusPill } from "../../../../components/ui/status-pill";
import { ConfigTags } from "../../../../components/domain/config-tags";
import { CitationChip } from "../../../../components/domain/citation-chip";
import { ChunkView } from "../../../../components/domain/chunk-view";
import { EvalResult } from "../../../../lib/types";
import { formatDuration, formatCost, formatRelativeTime } from "../../../../lib/format";
import {
  ArrowLeft,
  GitCompare,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Filter,
  X,
  FileText,
  Search,
  Scale,
  Zap,
} from "lucide-react";
import { cn } from "../../../../lib/utils";

function RunDetailContent() {
  const params = useParams();
  const router = useRouter();
  const runId = params.id as string;
  const { evalRuns } = useApp();

  const run = evalRuns.find((r) => r.id === runId);

  const [filterMode, setFilterMode] = useState<"all" | "failed-retrieval" | "low-faithfulness" | "slowest">("all");
  const [selectedResult, setSelectedResult] = useState<EvalResult | null>(null);

  if (!run) {
    return (
      <div className="p-8 text-center text-xs text-[var(--fg-muted)]">
        Evaluation run not found.
      </div>
    );
  }

  // Filter logic
  const filteredResults = run.results.filter((res) => {
    if (filterMode === "failed-retrieval") return !res.retrievedHit;
    if (filterMode === "low-faithfulness") return res.faithfulness < 0.8;
    if (filterMode === "slowest") return res.latencyMs > 1500;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push("/evals")}
              className="p-1 rounded text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-[var(--fg)]">
              {run.name}
            </h1>
            <StatusPill status={run.status} progressPercent={run.progressPercent} />
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-[var(--fg-subtle)]">
            <span>Test Set: {run.testSetName}</span>
            <span>•</span>
            <span>Judge: {run.judgeModel}</span>
            <span>•</span>
            <ConfigTags config={run.config} />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.push(`/compare?a=${run.id}`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--fg)] shadow-xs transition-colors cursor-pointer"
          >
            <GitCompare className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Compare with...</span>
          </button>
        </div>
      </div>

      {/* Metric Strip (5 Compact KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricValue
          label="Recall@k"
          value={`${(run.recallAtK * 100).toFixed(0)}%`}
          tooltip="Proportion of test cases where the ground-truth chunk was successfully retrieved in the top-k."
          subtitle="Retrieval deterministic"
        />
        <MetricValue
          label="MRR"
          value={run.mrr.toFixed(2)}
          tooltip="Mean Reciprocal Rank of the first relevant chunk in the retrieved candidates."
          subtitle="Rank quality"
        />
        <MetricValue
          label="Faithfulness"
          value={`${(run.faithfulness * 100).toFixed(0)}%`}
          tooltip="LLM-as-judge score assessing whether every generated claim is strictly derived from retrieved context."
          subtitle="Groundedness"
        />
        <MetricValue
          label="Relevance"
          value={`${(run.answerRelevance * 100).toFixed(0)}%`}
          tooltip="Semantic relevance of the generated answer to the original test question."
          subtitle="Answer utility"
        />
        <MetricValue
          label="p95 Latency"
          value={formatDuration(run.p95LatencyMs)}
          tooltip="95th percentile end-to-end response latency across all evaluated queries."
          subtitle="System speed"
        />
        <MetricValue
          label="Token Cost"
          value={formatCost(run.tokenCostUsd)}
          tooltip="Total inference cost incurred for embedding, generation, and judge tokens."
          subtitle="Evaluation spend"
        />
      </div>

      {/* Diagnostic Strip (Key Differentiator Auto-Insight) */}
      <div className="p-3.5 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-subtle)]/70 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <span className="font-semibold text-[var(--fg)]">Diagnostic Insight:</span>
          <span className="text-[var(--fg-muted)]">
            85% of low-faithfulness questions had their ground-truth chunk retrieved; failures are primarily caused by generation synthesis rather than retrieval recall.
          </span>
        </div>
        <span className="text-[10px] font-mono text-[var(--fg-subtle)] shrink-0 hidden sm:inline">
          Rule-based telemetry
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[var(--fg-subtle)] font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
              filterMode === "all"
                ? "bg-[var(--accent)] text-white font-medium"
                : "bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            )}
          >
            All Questions ({run.results.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("failed-retrieval")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
              filterMode === "failed-retrieval"
                ? "bg-[var(--negative)] text-white font-medium"
                : "bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            )}
          >
            Missed Retrieval ({run.results.filter((r) => !r.retrievedHit).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("low-faithfulness")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
              filterMode === "low-faithfulness"
                ? "bg-[var(--warning)] text-white font-medium"
                : "bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            )}
          >
            Low Faithfulness (&lt;0.80)
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("slowest")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
              filterMode === "slowest"
                ? "bg-[var(--accent)] text-white font-medium"
                : "bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            )}
          >
            Slowest (&gt;1.5s)
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-subtle)] font-medium">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Question</th>
                <th className="py-2.5 px-4 font-semibold text-center w-28">Retrieval Hit</th>
                <th className="py-2.5 px-4 font-semibold text-right w-28">Faithfulness</th>
                <th className="py-2.5 px-4 font-semibold text-right w-28">Relevance</th>
                <th className="py-2.5 px-4 font-semibold text-right w-28">Latency</th>
                <th className="py-2.5 px-4 text-right w-20">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredResults.map((res) => (
                <tr
                  key={res.id}
                  onClick={() => setSelectedResult(res)}
                  className="hover:bg-[var(--bg-subtle)]/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-medium text-[var(--fg)]">
                    <span className="line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                      {res.question}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {res.retrievedHit ? (
                      <span className="inline-flex items-center gap-1 text-[var(--positive)] font-mono text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[var(--negative)] font-mono text-[11px] font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> Miss
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                    <span
                      className={
                        res.faithfulness >= 0.85
                          ? "text-[var(--positive)]"
                          : res.faithfulness >= 0.7
                          ? "text-[var(--warning)]"
                          : "text-[var(--negative)]"
                      }
                    >
                      {(res.faithfulness * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-[var(--fg)] tabular-nums">
                    {(res.relevance * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[var(--fg-muted)] tabular-nums">
                    {formatDuration(res.latencyMs)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[11px] text-[var(--accent)] group-hover:underline">
                      Inspect
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-Question Drill-in Drawer */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedResult(null)}
          />

          <div className="relative w-full max-w-2xl bg-[var(--bg-elevated)] border-l border-[var(--border-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--fg)]">
                Question Benchmark Drill-In
              </span>
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="p-1 rounded text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {/* Question & Expected Answer */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] space-y-2">
                <span className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] tracking-wider">
                  Question
                </span>
                <p className="font-medium text-sm text-[var(--fg)]">
                  {selectedResult.question}
                </p>
                <div className="pt-2 border-t border-[var(--border)]">
                  <span className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] tracking-wider block mb-1">
                    Ground Truth Reference
                  </span>
                  <p className="text-[var(--fg-muted)] italic">
                    {selectedResult.expectedAnswer}
                  </p>
                </div>
              </div>

              {/* Generated Answer with Citations */}
              <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-wider">
                    Pipeline Generated Answer
                  </span>
                  <span className="font-mono text-[10px] text-[var(--fg-subtle)]">
                    Latency: {formatDuration(selectedResult.latencyMs)}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-[var(--fg)]">
                  {selectedResult.generatedAnswer}
                </p>
              </div>

              {/* LLM-as-Judge Evaluation & Reasoning */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] tracking-wider">
                    Judge Evaluation ({run.judgeModel})
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span>
                      Faithfulness:{" "}
                      <strong className="text-[var(--positive)]">
                        {(selectedResult.faithfulness * 100).toFixed(0)}%
                      </strong>
                    </span>
                    <span>
                      Relevance:{" "}
                      <strong className="text-[var(--fg)]">
                        {(selectedResult.relevance * 100).toFixed(0)}%
                      </strong>
                    </span>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--fg-muted)]">
                  {selectedResult.judgeReasoning}
                </p>
              </div>

              {/* Retrieved Chunks */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] tracking-wider block">
                  Retrieved Chunks in Context
                </span>
                {selectedResult.retrievedChunks.map((chunk, i) => (
                  <ChunkView key={chunk.id} chunk={chunk} citationIndex={i + 1} />
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-subtle)] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium cursor-pointer"
              >
                Close Drill-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RunDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[var(--fg-muted)]">Loading evaluation run...</div>}>
      <RunDetailContent />
    </Suspense>
  );
}
