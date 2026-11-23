"use client";

import React, { useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../../lib/store/app-context";
import { MetricValue } from "../../../../components/ui/metric-value";
import { StatusPill } from "../../../../components/ui/status-pill";
import { Mascot } from "../../../../components/ui/mascot";
import { ConfigTags } from "../../../../components/domain/config-tags";
import { ChunkView } from "../../../../components/domain/chunk-view";
import { EvalResult } from "../../../../lib/types";
import { formatDuration, formatCost } from "../../../../lib/format";
import {
  ArrowLeft,
  GitCompare,
  Sparkles,
  CheckCircle2,
  XCircle,
  Filter,
  X,
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
      <div className="pt-16 p-8 text-center text-sm text-[var(--muted)]">
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
    <div className="pt-12 pb-16 px-6 sm:px-10 max-w-7xl mx-auto space-y-8">
      {/* Header: generous 48px top spacing, serif display title, actions on right */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/evals")}
              className="p-1.5 rounded-full hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-[var(--ink)]">
              {run.name}
            </h1>
            <StatusPill status={run.status} progressPercent={run.progressPercent} />
          </div>

          <div className="flex items-center gap-2.5 mt-2 text-xs text-[var(--muted)]">
            <span>Test set: {run.testSetName}</span>
            <span>•</span>
            <span>Judge: {run.judgeModel}</span>
            <span>•</span>
            <ConfigTags config={run.config} />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => router.push(`/compare?a=${run.id}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--ink)] text-[var(--surface)] hover:opacity-90 text-sm font-medium shadow-sm transition-all cursor-pointer"
          >
            <GitCompare className="w-4 h-4 text-[var(--accent)]" />
            <span>Compare with…</span>
          </button>
        </div>
      </div>

      {/* Mascot Status Banners */}
      {run.status === "running" && (
        <div className="p-4 rounded-[14px] border border-[var(--accent)]/30 bg-[var(--accent-subtle)] flex items-center gap-4">
          <Mascot name="owl" pose="judging" size={40} />
          <div>
            <h3 className="font-medium text-sm text-[var(--ink)]">Evaluation benchmark in progress</h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Evaluating test cases against ground truth anchors and computing automated rubric metrics.
            </p>
          </div>
        </div>
      )}

      {run.status === "completed" && (
        <div className="p-4 rounded-[14px] border border-[var(--positive)]/30 bg-[var(--positive-subtle)] flex items-center gap-4">
          <Mascot name="owl" pose="celebrating" size={40} />
          <div>
            <h3 className="font-medium text-sm text-[var(--ink)]">Evaluation completed successfully</h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              All questions scored by {run.judgeModel}. Faithfulness reached {(run.faithfulness * 100).toFixed(0)}%.
            </p>
          </div>
        </div>
      )}

      {/* Metric Strip: one row, no individual boxes. Large mono value, small label, delta beneath. Dividers between metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[var(--line)] py-5 border-y border-[var(--line)] bg-[var(--surface)] rounded-[14px]">
        <div className="p-4">
          <MetricValue
            label="Recall@k"
            value={`${(run.recallAtK * 100).toFixed(0)}%`}
            tooltip="Proportion of test cases where the ground-truth chunk was successfully retrieved in the top-k."
            subtitle="Deterministic recall"
          />
        </div>
        <div className="p-4">
          <MetricValue
            label="MRR"
            value={run.mrr.toFixed(2)}
            tooltip="Mean Reciprocal Rank of the first relevant chunk in the retrieved candidates."
            subtitle="Rank quality"
          />
        </div>
        <div className="p-4">
          <MetricValue
            label="Faithfulness"
            value={`${(run.faithfulness * 100).toFixed(0)}%`}
            tooltip="LLM-as-judge score assessing whether every generated claim is strictly derived from retrieved context."
            subtitle="Groundedness"
          />
        </div>
        <div className="p-4">
          <MetricValue
            label="Relevance"
            value={`${(run.answerRelevance * 100).toFixed(0)}%`}
            tooltip="Semantic relevance of the generated answer to the original test question."
            subtitle="Answer utility"
          />
        </div>
        <div className="p-4">
          <MetricValue
            label="p95 Latency"
            value={formatDuration(run.p95LatencyMs)}
            tooltip="95th percentile end-to-end response latency across all evaluated queries."
            subtitle="System speed"
          />
        </div>
        <div className="p-4">
          <MetricValue
            label="Token Cost"
            value={formatCost(run.tokenCostUsd)}
            tooltip="Total inference cost incurred for embedding, generation, and judge tokens."
            subtitle="Evaluation spend"
          />
        </div>
      </div>

      {/* Diagnostic Strip */}
      <div className="p-4 rounded-[14px] border border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <span className="font-medium text-[var(--ink)]">Diagnostic insight:</span>
          <span className="text-[var(--muted)]">
            85% of low-faithfulness questions had their ground-truth chunk retrieved; failures are primarily caused by generation synthesis rather than retrieval recall.
          </span>
        </div>
        <span className="text-[11px] font-mono-numbers text-[var(--subtle)] shrink-0 hidden sm:inline">
          Rule-based telemetry
        </span>
      </div>

      {/* Filter Toolbar: pill style */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-[var(--muted)] font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium",
              filterMode === "all"
                ? "bg-[var(--ink)] text-[var(--surface)]"
                : "bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
            )}
          >
            All questions ({run.results.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("failed-retrieval")}
            className={cn(
              "px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium",
              filterMode === "failed-retrieval"
                ? "bg-[var(--negative)] text-white"
                : "bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
            )}
          >
            Missed retrieval ({run.results.filter((r) => !r.retrievedHit).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("low-faithfulness")}
            className={cn(
              "px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium",
              filterMode === "low-faithfulness"
                ? "bg-[var(--warning)] text-white"
                : "bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
            )}
          >
            Low faithfulness (&lt;0.80)
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("slowest")}
            className={cn(
              "px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium",
              filterMode === "slowest"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
            )}
          >
            Slowest (&gt;1.5s)
          </button>
        </div>
      </div>

      {/* Results Table: borderless rows with hairline separators, 44px rows, hover tint, no outer shadow */}
      <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-xs text-[var(--muted)] font-medium">
              <tr className="h-10">
                <th className="py-2.5 px-4 font-normal">Question</th>
                <th className="py-2.5 px-4 font-normal text-center w-28">Retrieval Hit</th>
                <th className="py-2.5 px-4 font-normal text-right w-28">Faithfulness</th>
                <th className="py-2.5 px-4 font-normal text-right w-28">Relevance</th>
                <th className="py-2.5 px-4 font-normal text-right w-28">Latency</th>
                <th className="py-2.5 px-4 text-right font-normal w-20">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredResults.map((res) => (
                <tr
                  key={res.id}
                  onClick={() => setSelectedResult(res)}
                  className="h-11 hover:bg-[var(--surface-2)]/60 transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 px-4 font-medium text-[var(--ink)]">
                    <span className="line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                      {res.question}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {res.retrievedHit ? (
                      <span className="inline-flex items-center gap-1 text-[var(--positive)] font-mono-numbers text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[var(--negative)] font-mono-numbers text-xs font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> Miss
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono-numbers font-medium tabular-nums">
                    <span
                      className={
                        res.faithfulness >= 0.85
                          ? "text-[var(--positive)] font-semibold"
                          : res.faithfulness >= 0.7
                          ? "text-[var(--warning)] font-semibold"
                          : "text-[var(--negative)] font-semibold"
                      }
                    >
                      {(res.faithfulness * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono-numbers text-[var(--ink)] tabular-nums">
                    {(res.relevance * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono-numbers text-[var(--muted)] tabular-nums">
                    {formatDuration(res.latencyMs)}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="text-xs text-[var(--accent)] group-hover:underline">
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedResult(null)}
          />

          <div className="relative w-full max-w-2xl bg-[var(--surface)] border-l border-[var(--line-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-5 border-b border-[var(--line)]">
              <span className="font-display text-lg text-[var(--ink)]">
                Question benchmark drill-in
              </span>
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Question & Expected Answer */}
              <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] space-y-2">
                <span className="text-xs text-[var(--muted)] font-medium">Question</span>
                <p className="font-medium text-sm text-[var(--ink)]">
                  {selectedResult.question}
                </p>
                <div className="pt-2 border-t border-[var(--line)]">
                  <span className="text-xs text-[var(--muted)] font-medium block mb-1">
                    Ground truth reference
                  </span>
                  <p className="text-[var(--muted)] italic leading-relaxed">
                    {selectedResult.expectedAnswer}
                  </p>
                </div>
              </div>

              {/* Generated Answer */}
              <div className="p-4 rounded-[14px] bg-[var(--surface)] border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--accent)] font-medium">
                    Pipeline generated answer
                  </span>
                  <span className="font-mono-numbers text-[11px] text-[var(--subtle)]">
                    Latency: {formatDuration(selectedResult.latencyMs)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--ink)]">
                  {selectedResult.generatedAnswer}
                </p>
              </div>

              {/* LLM-as-Judge Evaluation & Reasoning */}
              <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)] font-medium">
                    Judge evaluation ({run.judgeModel})
                  </span>
                  <div className="flex items-center gap-3 font-mono-numbers text-xs">
                    <span>
                      Faithfulness:{" "}
                      <strong className="text-[var(--positive)]">
                        {(selectedResult.faithfulness * 100).toFixed(0)}%
                      </strong>
                    </span>
                    <span>
                      Relevance:{" "}
                      <strong className="text-[var(--ink)]">
                        {(selectedResult.relevance * 100).toFixed(0)}%
                      </strong>
                    </span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  {selectedResult.judgeReasoning}
                </p>
              </div>

              {/* Retrieved Chunks */}
              <div className="space-y-3">
                <span className="text-xs text-[var(--muted)] font-medium block">
                  Retrieved chunks in context
                </span>
                {selectedResult.retrievedChunks.map((chunk, i) => (
                  <ChunkView key={chunk.id} chunk={chunk} citationIndex={i + 1} />
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-2)] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="px-5 py-2 rounded-full bg-[var(--ink)] text-[var(--surface)] text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity"
              >
                Close drill-in
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
    <Suspense fallback={<div className="p-8 text-xs text-[var(--muted)]">Loading evaluation run...</div>}>
      <RunDetailContent />
    </Suspense>
  );
}
