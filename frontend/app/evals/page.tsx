"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../lib/store/app-context";
import { StatusPill } from "../../components/ui/status-pill";
import { ConfigTags } from "../../components/domain/config-tags";
import { formatDuration, formatCost, formatRelativeTime } from "../../lib/format";
import {
  Plus,
  GitCompare,
  Layers,
  ArrowRight,
  FileCheck2,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function EvalsPage() {
  const router = useRouter();
  const { evalRuns, testSets, collections, configs, createEvalRun } = useApp();

  const [activeTab, setActiveTab] = useState<"runs" | "test-sets">("runs");
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([]);
  const [isNewRunOpen, setIsNewRunOpen] = useState(false);

  // New run form state
  const [collectionId, setCollectionId] = useState(collections[0]?.id || "");
  const [testSetId, setTestSetId] = useState(testSets[0]?.id || "");
  const [configId, setConfigId] = useState(configs[0]?.id || "");
  const [judgeModel, setJudgeModel] = useState("anthropic/claude-3-7-sonnet");

  const toggleSelectRun = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRunIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((r) => r !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleStartRun = (e: React.FormEvent) => {
    e.preventDefault();
    const run = createEvalRun({
      collectionId,
      testSetId,
      configId,
      judgeModel,
    });
    setIsNewRunOpen(false);
    router.push(`/evals/runs/${run.id}`);
  };

  const selectedTestSet = testSets.find((ts) => ts.id === testSetId);
  const estimatedQuestions = selectedTestSet ? selectedTestSet.caseCount : 20;
  const estimatedCost = (estimatedQuestions * 0.015).toFixed(2);
  const estimatedDuration = `${Math.round(estimatedQuestions * 2.5)}s`;

  return (
    <div className="pt-12 pb-24 px-6 sm:px-10 max-w-7xl mx-auto space-y-8 relative">
      {/* Header: generous 48px top spacing, serif title, pill action */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-[var(--ink)]">
            Evaluation hub
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
            Benchmark retrieval recall, faithfulness, latency, and costs against standardized test sets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsNewRunOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--ink)] hover:opacity-90 text-[var(--surface)] text-sm font-medium shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New eval run</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("runs")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer text-sm",
            activeTab === "runs"
              ? "border-[var(--accent)] text-[var(--ink)] font-medium"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          )}
        >
          <Layers className="w-4 h-4" />
          <span>Evaluation runs ({evalRuns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("test-sets")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer text-sm",
            activeTab === "test-sets"
              ? "border-[var(--accent)] text-[var(--ink)] font-medium"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          )}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Benchmark test sets ({testSets.length})</span>
        </button>
      </div>

      {/* Runs Tab: borderless rows, hairline separators, 44px rows, hover tint, no outer shadow */}
      {activeTab === "runs" && (
        <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-xs text-[var(--muted)] font-medium">
                <tr className="h-10">
                  <th className="py-2.5 px-4 w-8 text-center font-normal">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="py-2.5 px-4 font-normal">Run & Pipeline</th>
                  <th className="py-2.5 px-4 font-normal">Status</th>
                  <th className="py-2.5 px-4 font-normal text-right">Recall@k</th>
                  <th className="py-2.5 px-4 font-normal text-right">Faithfulness</th>
                  <th className="py-2.5 px-4 font-normal text-right">p95 Latency</th>
                  <th className="py-2.5 px-4 font-normal text-right">Token Cost</th>
                  <th className="py-2.5 px-4 font-normal text-right">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {evalRuns.map((run) => {
                  const isSelected = selectedRunIds.includes(run.id);
                  return (
                    <tr
                      key={run.id}
                      onClick={() => router.push(`/evals/runs/${run.id}`)}
                      className={cn(
                        "h-11 hover:bg-[var(--surface-2)]/60 transition-colors cursor-pointer group",
                        isSelected && "bg-[var(--accent-subtle)]"
                      )}
                    >
                      <td
                        className="py-2.5 px-4 text-center"
                        onClick={(e) => toggleSelectRun(run.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-[var(--line-strong)] text-[var(--accent)] cursor-pointer"
                        />
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                          {run.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs text-[var(--muted)]">
                            {run.collectionName}
                          </span>
                          <span className="text-[var(--subtle)]">•</span>
                          <ConfigTags config={run.config} size="sm" />
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <StatusPill
                          status={run.status}
                          progressPercent={run.progressPercent}
                        />
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono-numbers text-xs text-[var(--ink)] tabular-nums">
                        {(run.recallAtK * 100).toFixed(0)}%
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono-numbers text-xs font-semibold tabular-nums text-[var(--positive)]">
                        {(run.faithfulness * 100).toFixed(0)}%
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono-numbers text-xs text-[var(--muted)] tabular-nums">
                        {formatDuration(run.p95LatencyMs)}
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono-numbers text-xs text-[var(--muted)] tabular-nums">
                        {formatCost(run.tokenCostUsd)}
                      </td>

                      <td className="py-2.5 px-4 text-right text-xs text-[var(--muted)] tabular-nums">
                        {formatRelativeTime(run.startedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test Sets Tab */}
      {activeTab === "test-sets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testSets.map((ts) => (
            <div
              key={ts.id}
              onClick={() => router.push(`/evals/test-sets/${ts.id}`)}
              className="p-5 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all cursor-pointer group flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-9 h-9 rounded-[10px] bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center">
                    <FileCheck2 className="w-4 h-4" />
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-numbers bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
                    {ts.source}
                  </span>
                </div>
                <h3 className="font-medium text-base text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                  {ts.name}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Collection: {ts.collectionName}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[var(--line)] flex items-center justify-between text-xs">
                <span className="font-mono-numbers text-xs text-[var(--muted)]">
                  {ts.caseCount} ground truth cases
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                  <span>Inspect & edit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky Bottom Comparison Pill when exactly 2 runs are selected */}
      {selectedRunIds.length === 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--surface)] border border-[var(--line-strong)] shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-full px-6 py-3 flex items-center gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="font-medium text-[var(--ink)]">2 runs selected</span>
            <span className="text-[var(--subtle)]">•</span>
            <span className="font-mono-numbers text-xs text-[var(--muted)] truncate max-w-xs">
              {evalRuns.find((r) => r.id === selectedRunIds[0])?.name} vs{" "}
              {evalRuns.find((r) => r.id === selectedRunIds[1])?.name}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(`/compare?a=${selectedRunIds[0]}&b=${selectedRunIds[1]}`)
            }
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--ink)] hover:opacity-90 text-[var(--surface)] text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <GitCompare className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Compare 2 runs →</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRunIds([])}
            className="p-1 rounded-full text-[var(--subtle)] hover:text-[var(--ink)] cursor-pointer"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* New Eval Run Sheet */}
      {isNewRunOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsNewRunOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-[var(--surface)] border-l border-[var(--line-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-5 border-b border-[var(--line)]">
              <span className="font-display text-lg text-[var(--ink)]">
                Launch new evaluation run
              </span>
              <button
                type="button"
                onClick={() => setIsNewRunOpen(false)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartRun} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                  Target collection
                </label>
                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                >
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.documentsCount} docs, {c.chunksCount} chunks)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                  Benchmark test set
                </label>
                <select
                  value={testSetId}
                  onChange={(e) => setTestSetId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                >
                  {testSets.map((ts) => (
                    <option key={ts.id} value={ts.id}>
                      {ts.name} ({ts.caseCount} test cases)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                  Pipeline configuration
                </label>
                <select
                  value={configId}
                  onChange={(e) => setConfigId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                >
                  {configs.map((cfg) => (
                    <option key={cfg.id} value={cfg.id}>
                      {cfg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                  LLM-as-judge model
                </label>
                <select
                  value={judgeModel}
                  onChange={(e) => setJudgeModel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="anthropic/claude-3-7-sonnet">Anthropic · Claude 3.7 Sonnet (Recommended)</option>
                  <option value="openai/gpt-4o">OpenAI · GPT-4o</option>
                  <option value="ollama/llama3.3:70b">Ollama · Llama 3.3 (70B)</option>
                </select>
                <p className="text-[11px] text-[var(--muted)] mt-1.5">
                  Recommendation: Don&apos;t let the judge be the same model as the generator to avoid self-preference bias.
                </p>
              </div>

              {/* Pre-Run Estimate Box */}
              <div className="p-4 rounded-[14px] border border-[var(--line)] bg-[var(--surface-2)] space-y-2 mt-4 text-xs font-mono-numbers">
                <span className="text-xs font-sans text-[var(--muted)] font-medium block">
                  Estimated run profile
                </span>
                <div className="flex items-center justify-between text-[var(--ink)]">
                  <span>Questions evaluated:</span>
                  <span>{estimatedQuestions} cases</span>
                </div>
                <div className="flex items-center justify-between text-[var(--ink)]">
                  <span>Estimated duration:</span>
                  <span>~{estimatedDuration}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--ink)]">
                  <span>Estimated token cost:</span>
                  <span className="text-[var(--positive)] font-semibold">${estimatedCost}</span>
                </div>
              </div>

              <div className="pt-5 border-t border-[var(--line)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewRunOpen(false)}
                  className="px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[var(--ink)] text-[var(--surface)] hover:opacity-90 font-medium cursor-pointer transition-opacity"
                >
                  Confirm & start eval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
