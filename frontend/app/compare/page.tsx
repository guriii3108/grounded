"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "../../lib/store/app-context";
import { ConfigDiff } from "../../components/domain/config-diff";
import { DeltaBar } from "../../components/ui/delta-bar";
import { formatDuration, formatCost } from "../../lib/format";
import { EvalResult } from "../../lib/types";
import {
  Copy,
  Check,
  AlertTriangle,
  X,
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
    <div className="pt-12 pb-16 px-6 sm:px-10 max-w-7xl mx-auto space-y-8">
      {/* Header Selector Strip: generous 48px top spacing, serif title, pill actions */}
      <div className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
              A/B Pipeline Comparison
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
            Compare two experimental runs side-by-side to verify improvements and catch regressions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Run A Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-[var(--muted)]">A:</span>
            <select
              value={runA.id}
              onChange={(e) => handleSelectRunA(e.target.value)}
              className="px-3 py-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)] font-mono-numbers"
            >
              {evalRuns.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[var(--subtle)] text-xs">vs</span>

          {/* Run B Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-[var(--muted)]">B:</span>
            <select
              value={runB.id}
              onChange={(e) => handleSelectRunB(e.target.value)}
              className="px-3 py-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)] font-mono-numbers"
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
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--ink)] transition-colors cursor-pointer ml-auto shadow-xs"
          >
            {copiedMarkdown ? (
              <Check className="w-3.5 h-3.5 text-[var(--positive)]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[var(--muted)]" />
            )}
            <span>{copiedMarkdown ? "Copied markdown" : "Copy markdown summary"}</span>
          </button>
        </div>
      </div>

      {/* Warning when test sets or judges differ */}
      {(differentTestSets || differentJudges) && (
        <div className="p-4 rounded-[14px] border border-[var(--warning)]/30 bg-[var(--warning-subtle)] text-xs text-[var(--ink)] flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0" />
          <span>
            {differentTestSets
              ? "Warning: Run A and Run B evaluated different benchmark test sets. Scores are not strictly comparable."
              : "Notice: Evaluated using different LLM judges. Relative score calibration may differ."}
          </span>
        </div>
      )}

      {/* 1. Config Diff First: compact inline list */}
      <ConfigDiff configA={runA.config} configB={runB.config} />

      {/* 2. Aggregate Metric Deltas: one row, no individual boxes, dividers between metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--line)] py-5 border-y border-[var(--line)] bg-[var(--surface)] rounded-[14px]">
        {/* Recall */}
        <div className="p-4 space-y-1">
          <span className="text-xs text-[var(--muted)] block">Recall@k</span>
          <div className="flex items-baseline gap-2 font-mono-numbers">
            <span className="text-xs text-[var(--subtle)]">
              {(runA.recallAtK * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-[var(--subtle)]">→</span>
            <span className="text-2xl font-semibold text-[var(--ink)] tabular-nums">
              {(runB.recallAtK * 100).toFixed(0)}%
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-mono-numbers block tabular-nums",
              deltaRecall >= 0 ? "text-[var(--positive)] font-medium" : "text-[var(--negative)] font-medium"
            )}
          >
            {deltaRecall >= 0 ? "+" : ""}
            {(deltaRecall * 100).toFixed(0)}% delta
          </span>
        </div>

        {/* Faithfulness */}
        <div className="p-4 space-y-1">
          <span className="text-xs text-[var(--muted)] block">Faithfulness</span>
          <div className="flex items-baseline gap-2 font-mono-numbers">
            <span className="text-xs text-[var(--subtle)]">
              {(runA.faithfulness * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-[var(--subtle)]">→</span>
            <span className="text-2xl font-semibold text-[var(--ink)] tabular-nums">
              {(runB.faithfulness * 100).toFixed(0)}%
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-mono-numbers block tabular-nums",
              deltaFaith >= 0 ? "text-[var(--positive)] font-medium" : "text-[var(--negative)] font-medium"
            )}
          >
            {deltaFaith >= 0 ? "+" : ""}
            {(deltaFaith * 100).toFixed(0)}% delta
          </span>
        </div>

        {/* p95 Latency */}
        <div className="p-4 space-y-1">
          <span className="text-xs text-[var(--muted)] block">p95 Latency</span>
          <div className="flex items-baseline gap-2 font-mono-numbers">
            <span className="text-xs text-[var(--subtle)]">
              {formatDuration(runA.p95LatencyMs)}
            </span>
            <span className="text-xs text-[var(--subtle)]">→</span>
            <span className="text-2xl font-semibold text-[var(--ink)] tabular-nums">
              {formatDuration(runB.p95LatencyMs)}
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-mono-numbers block tabular-nums",
              deltaLatency <= 0 ? "text-[var(--positive)] font-medium" : "text-[var(--negative)] font-medium"
            )}
          >
            {deltaLatency <= 0 ? "faster" : "slower"} ({formatDuration(Math.abs(deltaLatency))})
          </span>
        </div>

        {/* Token Cost */}
        <div className="p-4 space-y-1">
          <span className="text-xs text-[var(--muted)] block">Token Cost</span>
          <div className="flex items-baseline gap-2 font-mono-numbers">
            <span className="text-xs text-[var(--subtle)]">
              {formatCost(runA.tokenCostUsd)}
            </span>
            <span className="text-xs text-[var(--subtle)]">→</span>
            <span className="text-2xl font-semibold text-[var(--ink)] tabular-nums">
              {formatCost(runB.tokenCostUsd)}
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-mono-numbers block tabular-nums",
              deltaCost <= 0 ? "text-[var(--positive)] font-medium" : "text-[var(--negative)] font-medium"
            )}
          >
            {deltaCost <= 0 ? "saving" : "increase"} ({formatCost(Math.abs(deltaCost))})
          </span>
        </div>

        {/* MRR */}
        <div className="p-4 space-y-1">
          <span className="text-xs text-[var(--muted)] block">MRR Rank Quality</span>
          <div className="flex items-baseline gap-2 font-mono-numbers">
            <span className="text-xs text-[var(--subtle)]">
              {runA.mrr.toFixed(2)}
            </span>
            <span className="text-xs text-[var(--subtle)]">→</span>
            <span className="text-2xl font-semibold text-[var(--ink)] tabular-nums">
              {runB.mrr.toFixed(2)}
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-mono-numbers block tabular-nums",
              deltaMRR >= 0 ? "text-[var(--positive)] font-medium" : "text-[var(--negative)] font-medium"
            )}
          >
            {deltaMRR >= 0 ? "+" : ""}
            {deltaMRR.toFixed(2)} delta
          </span>
        </div>
      </div>

      {/* 3. Filter Toolbar & Regression Focus */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-[var(--ink)] font-medium">
            <input
              type="checkbox"
              checked={filterChangedOnly}
              onChange={(e) => setFilterChangedOnly(e.target.checked)}
              className="rounded border-[var(--line-strong)] text-[var(--accent)] cursor-pointer"
            />
            <span>Only changed ({filteredPairs.length})</span>
          </label>

          <span className="text-[var(--subtle)]">•</span>

          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)]">Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "regressions" | "improvements")}
              className="px-3 py-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)]"
            >
              <option value="all">All paired questions</option>
              <option value="regressions">Regressions (A &gt; B)</option>
              <option value="improvements">Improvements (B &gt; A)</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-[var(--muted)]">
          Sorted by largest regression first
        </span>
      </div>

      {/* 4. Per-Question High-Density Table with Diverging Delta Bars (44px rows, hairline borders) */}
      <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-xs text-[var(--muted)] font-medium">
              <tr className="h-10">
                <th className="py-2.5 px-4 font-normal">Question Benchmark</th>
                <th className="py-2.5 px-4 font-normal text-right w-24">Run A</th>
                <th className="py-2.5 px-4 font-normal text-right w-24">Run B</th>
                <th className="py-2.5 px-4 font-normal text-center w-36">Faithfulness Δ</th>
                <th className="py-2.5 px-4 font-normal text-center w-32">Diverging Bar</th>
                <th className="py-2.5 px-4 text-right font-normal w-20">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredPairs.map((pair) => {
                const delta = pair.deltaFaithfulness;
                const isRegression = delta < -0.01;
                const isImprovement = delta > 0.01;

                return (
                  <tr
                    key={pair.questionId}
                    onClick={() => setSelectedPair({ resA: pair.resA, resB: pair.resB })}
                    className={cn(
                      "h-11 hover:bg-[var(--surface-2)]/60 transition-colors cursor-pointer group",
                      isRegression && "bg-[var(--negative-subtle)]"
                    )}
                  >
                    <td className="py-2.5 px-4 font-medium text-[var(--ink)]">
                      <p className="line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                        {pair.question}
                      </p>
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono-numbers text-xs text-[var(--muted)] tabular-nums">
                      {(pair.resA.faithfulness * 100).toFixed(0)}%
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono-numbers text-xs font-semibold text-[var(--ink)] tabular-nums">
                      {(pair.resB.faithfulness * 100).toFixed(0)}%
                    </td>

                    <td className="py-2.5 px-4 text-center font-mono-numbers text-xs font-semibold tabular-nums">
                      <span
                        className={
                          isImprovement
                            ? "text-[var(--positive)] font-bold"
                            : isRegression
                            ? "text-[var(--negative)] font-bold"
                            : "text-[var(--subtle)]"
                        }
                      >
                        {delta > 0 ? "+" : ""}
                        {(delta * 100).toFixed(0)}%
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <div className="flex justify-center">
                        <DeltaBar delta={delta} maxScale={0.5} />
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <span className="text-xs text-[var(--accent)] group-hover:underline">
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

      {/* 5. Side-by-Side Drill-In Drawer */}
      {selectedPair && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedPair(null)}
          />

          <div className="relative w-full max-w-4xl bg-[var(--surface)] border-l border-[var(--line-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-5 border-b border-[var(--line)] shrink-0">
              <div>
                <span className="font-bold text-sm text-[var(--ink)]">
                  Side-by-side Answer & Chunk Diff
                </span>
                <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">
                  {selectedPair.resA.question}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPair(null)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column: Run A */}
              <div className="p-5 rounded-[14px] border border-[var(--line)] bg-[var(--surface-2)] space-y-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] font-medium text-sm text-[var(--ink)]">
                  <span>Run A: {runA.name}</span>
                  <span className="font-mono-numbers text-[var(--positive)] font-semibold">
                    F: {(selectedPair.resA.faithfulness * 100).toFixed(0)}%
                  </span>
                </div>

                <div>
                  <span className="text-xs text-[var(--muted)] font-medium block mb-1">
                    Generated answer
                  </span>
                  <p className="text-xs leading-relaxed text-[var(--ink)] bg-[var(--surface)] p-3.5 rounded-[10px] border border-[var(--line)]">
                    {selectedPair.resA.generatedAnswer}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-[var(--muted)] font-medium block mb-1">
                    Judge reasoning
                  </span>
                  <p className="text-xs leading-relaxed text-[var(--muted)] italic">
                    &ldquo;{selectedPair.resA.judgeReasoning}&rdquo;
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-[var(--line)]">
                  <span className="text-[11px] font-mono-numbers text-[var(--subtle)]">
                    Retrieved Hit: {selectedPair.resA.retrievedHit ? "Yes (✓)" : "No (✗)"} · Latency: {formatDuration(selectedPair.resA.latencyMs)}
                  </span>
                </div>
              </div>

              {/* Column: Run B */}
              <div className="p-5 rounded-[14px] border border-[var(--line)] bg-[var(--surface-2)] space-y-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] font-medium text-sm text-[var(--ink)]">
                  <span>Run B: {runB.name}</span>
                  <span className="font-mono-numbers text-[var(--positive)] font-semibold">
                    F: {(selectedPair.resB.faithfulness * 100).toFixed(0)}%
                  </span>
                </div>

                <div>
                  <span className="text-xs text-[var(--muted)] font-medium block mb-1">
                    Generated answer
                  </span>
                  <p className="text-xs leading-relaxed text-[var(--ink)] bg-[var(--surface)] p-3.5 rounded-[10px] border border-[var(--line)]">
                    {selectedPair.resB.generatedAnswer}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-[var(--muted)] font-medium block mb-1">
                    Judge reasoning
                  </span>
                  <p className="text-xs leading-relaxed text-[var(--muted)] italic">
                    &ldquo;{selectedPair.resB.judgeReasoning}&rdquo;
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-[var(--line)]">
                  <span className="text-[11px] font-mono-numbers text-[var(--subtle)]">
                    Retrieved Hit: {selectedPair.resB.retrievedHit ? "Yes (✓)" : "No (✗)"} · Latency: {formatDuration(selectedPair.resB.latencyMs)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-2)] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedPair(null)}
                className="px-5 py-2 rounded-full bg-[var(--ink)] text-[var(--surface)] text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity"
              >
                Close diff
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
    <Suspense fallback={<div className="p-8 text-xs text-[var(--muted)]">Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
