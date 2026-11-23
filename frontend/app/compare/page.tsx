"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "../../lib/store/app-context";
import { ConfigDiff } from "../../components/domain/config-diff";
import { DeltaBar } from "../../components/ui/delta-bar";
import { formatDelta, formatDuration, formatCost } from "../../lib/format";
import { EvalRun, EvalResult } from "../../lib/types";
import {
  GitCompare,
  ArrowRight,
  Copy,
  Check,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
  X,
  FileText,
  Scale,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { evalRuns } = useApp();

  const runAId = searchParams.get("a") || evalRuns[0]?.id || "";
  const runBId = searchParams.get("b") || evalRuns[1]?.id || "";

  const runA = evalRuns.find((r) => r.id === runAId) || evalRuns[0];
  const runB = evalRuns.find((r) => r.id === runBId) || evalRuns[1];

  const [filterChangedOnly, setFilterChangedOnly] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "regressions" | "improvements">("all");
  const [selectedPair, setSelectedPair] = useState<{ resA: EvalResult; resB: EvalResult } | null>(null);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // Match results between runA and runB by questionId or question text
  const pairedResults = useMemo(() => {
    if (!runA || !runB) return [];

    const pairs: {
      questionId: string;
      question: string;
      resA: EvalResult;
      resB: EvalResult;
      deltaFaithfulness: number;
      deltaRelevance: number;
      deltaLatencyMs: number;
    }[] = [];

    runA.results.forEach((resA) => {
      const resB = runB.results.find((b) => b.questionId === resA.questionId || b.question === resA.question);
      if (resB) {
        const deltaFaith = resB.faithfulness - resA.faithfulness;
        const deltaRel = resB.relevance - resA.relevance;
        const deltaLat = resB.latencyMs - resA.latencyMs;
        pairs.push({
          questionId: resA.questionId,
          question: resA.question,
          resA,
          resB,
          deltaFaithfulness: deltaFaith,
          deltaRelevance: deltaRel,
          deltaLatencyMs: deltaLat,
        });
      }
    });

    // Default sort by largest regression (lowest deltaFaithfulness first)
    return pairs.sort((a, b) => a.deltaFaithfulness - b.deltaFaithfulness);
  }, [runA, runB]);

  // Apply filters
  const filteredPairs = useMemo(() => {
    return pairedResults.filter((pair) => {
      if (filterChangedOnly && Math.abs(pair.deltaFaithfulness) < 0.01) {
        return false;
      }
      if (filterType === "regressions" && pair.deltaFaithfulness >= -0.01) {
        return false;
      }
      if (filterType === "improvements" && pair.deltaFaithfulness <= 0.01) {
        return false;
      }
      return true;
    });
  }, [pairedResults, filterChangedOnly, filterType]);

  // Aggregate deltas
  const deltaRecall = runB ? runB.recallAtK - runA.recallAtK : 0;
  const deltaFaith = runB ? runB.faithfulness - runA.faithfulness : 0;
  const deltaLatency = runB ? runB.p95LatencyMs - runA.p95LatencyMs : 0;
  const deltaCost = runB ? runB.tokenCostUsd - runA.tokenCostUsd : 0;
  const deltaMRR = runB ? runB.mrr - runA.mrr : 0;

  const differentTestSets = runA?.testSetId !== runB?.testSetId;
  const differentJudges = runA?.judgeModel !== runB?.judgeModel;

  const copyMarkdownSummary = () => {
    if (!runA || !runB) return;
    const md = `### Grounded A/B Pipeline Evaluation
| Metric | Run A (${runA.config.chat_model.split("/")[1]}) | Run B (${runB.config.chat_model.split("/")[1]}) | Delta |
| :--- | :--- | :--- | :--- |
| **Recall@k** | ${(runA.recallAtK * 100).toFixed(0)}% | ${(runB.recallAtK * 100).toFixed(0)}% | ${deltaRecall >= 0 ? "+" : ""}${(deltaRecall * 100).toFixed(0)}% |
| **Faithfulness** | ${(runA.faithfulness * 100).toFixed(0)}% | ${(runB.faithfulness * 100).toFixed(0)}% | ${deltaFaith >= 0 ? "+" : ""}${(deltaFaith * 100).toFixed(0)}% |
| **p95 Latency** | ${formatDuration(runA.p95LatencyMs)} | ${formatDuration(runB.p95LatencyMs)} | ${deltaLatency <= 0 ? "faster" : "slower"} (${formatDuration(Math.abs(deltaLatency))}) |
| **Token Cost** | ${formatCost(runA.tokenCostUsd)} | ${formatCost(runB.tokenCostUsd)} | ${formatCost(deltaCost)} |
`;
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
  };

  const handleSelectRunA = (id: string) => {
    router.push(`/compare?a=${id}&b=${runBId}`);
  };

  const handleSelectRunB = (id: string) => {
    router.push(`/compare?a=${runAId}&b=${id}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Selector Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[var(--fg)]">
              A/B Pipeline Comparison
            </h1>
          </div>
          <p className="text-xs text-[var(--fg-muted)] mt-1">
            Compare two experimental runs side-by-side to verify improvements and catch regressions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Run A Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[var(--fg-subtle)]">A:</span>
            <select
              value={runA.id}
              onChange={(e) => handleSelectRunA(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--fg)] font-mono"
            >
              {evalRuns.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[var(--fg-subtle)] font-mono text-xs">vs</span>

          {/* Run B Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[var(--fg-subtle)]">B:</span>
            <select
              value={runB.id}
              onChange={(e) => handleSelectRunB(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--fg)] font-mono"
            >
              {evalRuns.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Copy As Markdown Action */}
          <button
            type="button"
            onClick={copyMarkdownSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)] text-xs font-medium text-[var(--fg)] transition-colors shadow-xs cursor-pointer ml-auto"
          >
            {copiedMarkdown ? (
              <Check className="w-3.5 h-3.5 text-[var(--positive)]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedMarkdown ? "Copied Markdown!" : "Copy as Markdown"}</span>
          </button>
        </div>
      </div>

      {/* Warning when test sets or judges differ */}
      {(differentTestSets || differentJudges) && (
        <div className="p-3 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning-subtle)]/60 text-xs text-[var(--fg)] flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0" />
          <span>
            {differentTestSets
              ? "Warning: Run A and Run B evaluated different benchmark test sets. Scores are not strictly comparable."
              : "Notice: Evaluated using different LLM judges. Relative score calibration may differ."}
          </span>
        </div>
      )}

      {/* 1. Config Diff First (Git-diff style) */}
      <ConfigDiff configA={runA.config} configB={runB.config} />

      {/* 2. Aggregate Metric Deltas with Direction Semantics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Recall */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] space-y-1">
          <span className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] tracking-wider">
            Recall@k
          </span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-xs text-[var(--fg-subtle)]">
              {(runA.recallAtK * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-[var(--fg-subtle)]">→</span>
            <span className="text-xl font-bold text-[var(--fg)] tabular-nums">
              {(runB.recallAtK * 100).toFixed(0)}%
            </span>
            <span
              className={cn(
                "text-xs font-semibold tabular-nums ml-auto",
                deltaRecall >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
              )}
            >
              {deltaRecall >= 0 ? "▲ +" : "▼ "}
              {(deltaRecall * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Faithfulness */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] space-y-1">
          <span className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] tracking-wider">
            Faithfulness
          </span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-xs text-[var(--fg-subtle)]">
              {(runA.faithfulness * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-[var(--fg-subtle)]">→</span>
            <span className="text-xl font-bold text-[var(--fg)] tabular-nums">
              {(runB.faithfulness * 100).toFixed(0)}%
            </span>
            <span
              className={cn(
                "text-xs font-semibold tabular-nums ml-auto",
                deltaFaith >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
              )}
            >
              {deltaFaith >= 0 ? "▲ +" : "▼ "}
              {(deltaFaith * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* p95 Latency (Down is green!) */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] space-y-1">
          <span className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] tracking-wider">
            p95 Latency
          </span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-xs text-[var(--fg-subtle)]">
              {formatDuration(runA.p95LatencyMs)}
            </span>
            <span className="text-xs text-[var(--fg-subtle)]">→</span>
            <span className="text-xl font-bold text-[var(--fg)] tabular-nums">
              {formatDuration(runB.p95LatencyMs)}
            </span>
            <span
              className={cn(
                "text-xs font-semibold tabular-nums ml-auto",
                deltaLatency <= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
              )}
            >
              {deltaLatency <= 0 ? "▲ faster" : "▼ slower"}
            </span>
          </div>
        </div>

        {/* Token Cost (Down is green!) */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] space-y-1">
          <span className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] tracking-wider">
            Token Cost
          </span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-xs text-[var(--fg-subtle)]">
              {formatCost(runA.tokenCostUsd)}
            </span>
            <span className="text-xs text-[var(--fg-subtle)]">→</span>
            <span className="text-xl font-bold text-[var(--fg)] tabular-nums">
              {formatCost(runB.tokenCostUsd)}
            </span>
            <span
              className={cn(
                "text-xs font-semibold tabular-nums ml-auto",
                deltaCost <= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
              )}
            >
              {deltaCost <= 0 ? "▲ saving" : "▼ higher"}
            </span>
          </div>
        </div>

        {/* MRR */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] tracking-wider">
            MRR Quality
          </span>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-xs text-[var(--fg-subtle)]">
              {runA.mrr.toFixed(2)}
            </span>
            <span className="text-xs text-[var(--fg-subtle)]">→</span>
            <span className="text-xl font-bold text-[var(--fg)] tabular-nums">
              {runB.mrr.toFixed(2)}
            </span>
            <span
              className={cn(
                "text-xs font-semibold tabular-nums ml-auto",
                deltaMRR >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
              )}
            >
              {deltaMRR >= 0 ? "+" : ""}
              {deltaMRR.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Toolbar & Regression Focus */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-[var(--fg)] font-medium">
            <input
              type="checkbox"
              checked={filterChangedOnly}
              onChange={(e) => setFilterChangedOnly(e.target.checked)}
              className="rounded border-[var(--border-strong)] text-[var(--accent)]"
            />
            <span>Only Changed ({filteredPairs.length})</span>
          </label>

          <span className="text-[var(--fg-subtle)]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--fg-subtle)]">Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-2 py-1 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--fg)]"
            >
              <option value="all">All Paired Questions</option>
              <option value="regressions">Regressions (A &gt; B)</option>
              <option value="improvements">Improvements (B &gt; A)</option>
            </select>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[var(--fg-subtle)]">
          Default sorted by largest regression
        </span>
      </div>

      {/* 4. Per-Question High-Density Table with Diverging Delta Bars */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-subtle)] font-medium">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Question Benchmark</th>
                <th className="py-2.5 px-4 font-semibold text-right w-24">Run A</th>
                <th className="py-2.5 px-4 font-semibold text-right w-24">Run B</th>
                <th className="py-2.5 px-4 font-semibold text-center w-36">Faithfulness Δ</th>
                <th className="py-2.5 px-4 font-semibold text-center w-32">Diverging Bar</th>
                <th className="py-2.5 px-4 text-right w-20">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredPairs.map((pair) => {
                const delta = pair.deltaFaithfulness;
                const isRegression = delta < -0.01;
                const isImprovement = delta > 0.01;

                return (
                  <tr
                    key={pair.questionId}
                    onClick={() => setSelectedPair({ resA: pair.resA, resB: pair.resB })}
                    className={cn(
                      "hover:bg-[var(--bg-subtle)]/70 transition-colors cursor-pointer group",
                      isRegression && "bg-[var(--negative-subtle)]/15"
                    )}
                  >
                    <td className="py-3 px-4 font-medium text-[var(--fg)]">
                      <p className="line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                        {pair.question}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[var(--fg-muted)] tabular-nums">
                      {(pair.resA.faithfulness * 100).toFixed(0)}%
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-[var(--fg)] tabular-nums">
                      {(pair.resB.faithfulness * 100).toFixed(0)}%
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                      <span
                        className={
                          isImprovement
                            ? "text-[var(--positive)]"
                            : isRegression
                            ? "text-[var(--negative)]"
                            : "text-[var(--fg-subtle)]"
                        }
                      >
                        {delta > 0 ? "▲ +" : delta < 0 ? "▼ " : ""}
                        {(delta * 100).toFixed(0)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <DeltaBar delta={delta} maxScale={0.5} />
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="text-[11px] text-[var(--accent)] group-hover:underline">
                        Diff
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Side-by-Side Drill-In Drawer on Row Click */}
      {selectedPair && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedPair(null)}
          />

          <div className="relative w-full max-w-4xl bg-[var(--bg-elevated)] border-l border-[var(--border-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] shrink-0">
              <div>
                <span className="font-semibold text-sm text-[var(--fg)]">
                  Side-by-Side Answer & Chunk Diff
                </span>
                <p className="text-[11px] text-[var(--fg-muted)] mt-0.5 line-clamp-1">
                  {selectedPair.resA.question}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPair(null)}
                className="p-1 rounded text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Column: Run A */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] space-y-4 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] font-semibold text-[var(--fg)]">
                  <span>Run A: {runA.name}</span>
                  <span className="font-mono text-[var(--positive)]">
                    F: {(selectedPair.resA.faithfulness * 100).toFixed(0)}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wider block mb-1">
                    Generated Answer
                  </span>
                  <p className="text-xs leading-relaxed text-[var(--fg)] bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)]">
                    {selectedPair.resA.generatedAnswer}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wider block mb-1">
                    Judge Reasoning
                  </span>
                  <p className="text-[11px] leading-relaxed text-[var(--fg-muted)] italic">
                    &ldquo;{selectedPair.resA.judgeReasoning}&rdquo;
                  </p>
                </div>

                <div className="mt-auto pt-2 border-t border-[var(--border)]">
                  <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                    Retrieved Hit: {selectedPair.resA.retrievedHit ? "Yes (✓)" : "No (✗)"} · Latency: {formatDuration(selectedPair.resA.latencyMs)}
                  </span>
                </div>
              </div>

              {/* Column: Run B */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] space-y-4 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] font-semibold text-[var(--fg)]">
                  <span>Run B: {runB.name}</span>
                  <span className="font-mono text-[var(--positive)]">
                    F: {(selectedPair.resB.faithfulness * 100).toFixed(0)}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wider block mb-1">
                    Generated Answer
                  </span>
                  <p className="text-xs leading-relaxed text-[var(--fg)] bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)]">
                    {selectedPair.resB.generatedAnswer}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wider block mb-1">
                    Judge Reasoning
                  </span>
                  <p className="text-[11px] leading-relaxed text-[var(--fg-muted)] italic">
                    &ldquo;{selectedPair.resB.judgeReasoning}&rdquo;
                  </p>
                </div>

                <div className="mt-auto pt-2 border-t border-[var(--border)]">
                  <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                    Retrieved Hit: {selectedPair.resB.retrievedHit ? "Yes (✓)" : "No (✗)"} · Latency: {formatDuration(selectedPair.resB.latencyMs)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-subtle)] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedPair(null)}
                className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium cursor-pointer"
              >
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[var(--fg-muted)]">Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
