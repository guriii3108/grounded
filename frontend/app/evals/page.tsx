"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../lib/store/app-context";
import { StatusPill } from "../../components/ui/status-pill";
import { ConfigTags } from "../../components/domain/config-tags";
import { formatDuration, formatCost, formatRelativeTime } from "../../lib/format";
import {
  CheckCircle,
  Plus,
  GitCompare,
  Layers,
  ArrowRight,
  FileCheck2,
  Clock,
  Sparkles,
  DollarSign,
  X,
  Sliders,
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function EvalsPage() {
  const router = useRouter();
  const { evalRuns, testSets, collections, configs, providers, createEvalRun } = useApp();

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
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--fg)]">
            Evaluation Hub
          </h1>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5">
            Benchmark retrieval recall, faithfulness, latency, and costs against standardized test sets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsNewRunOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Eval Run</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("runs")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer",
            activeTab === "runs"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Evaluation Runs ({evalRuns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("test-sets")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer",
            activeTab === "test-sets"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
          )}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Benchmark Test Sets ({testSets.length})</span>
        </button>
      </div>

      {/* Runs Tab */}
      {activeTab === "runs" && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border)] text-[var(--fg-subtle)] font-medium">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="py-2.5 px-3 font-semibold">Run & Pipeline</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Recall@k</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Faithfulness</th>
                  <th className="py-2.5 px-3 font-semibold text-right">p95 Latency</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Token Cost</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {evalRuns.map((run) => {
                  const isSelected = selectedRunIds.includes(run.id);
                  return (
                    <tr
                      key={run.id}
                      onClick={() => router.push(`/evals/runs/${run.id}`)}
                      className={cn(
                        "hover:bg-[var(--bg-subtle)]/70 transition-colors cursor-pointer group",
                        isSelected && "bg-[var(--accent-subtle)]/40"
                      )}
                    >
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => toggleSelectRun(run.id, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-[var(--border-strong)] text-[var(--accent)] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                          {run.name}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-[var(--fg-subtle)]">
                            {run.collectionName}
                          </span>
                          <span className="text-[var(--fg-subtle)]">•</span>
                          <ConfigTags config={run.config} size="sm" />
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <StatusPill
                          status={run.status}
                          progressPercent={run.progressPercent}
                        />
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-[var(--fg)] tabular-nums">
                        {(run.recallAtK * 100).toFixed(0)}%
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-[var(--positive)]">
                        {(run.faithfulness * 100).toFixed(0)}%
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-[var(--fg-muted)] tabular-nums">
                        {formatDuration(run.p95LatencyMs)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-[var(--fg-muted)] tabular-nums">
                        {formatCost(run.tokenCostUsd)}
                      </td>

                      <td className="py-3 px-3 text-right text-[var(--fg-subtle)] tabular-nums">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testSets.map((ts) => (
            <div
              key={ts.id}
              onClick={() => router.push(`/evals/test-sets/${ts.id}`)}
              className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                    <FileCheck2 className="w-4 h-4" />
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-medium bg-[var(--bg-subtle)] text-[var(--fg-subtle)] border border-[var(--border)]">
                    {ts.source}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                  {ts.name}
                </h3>
                <p className="text-xs text-[var(--fg-muted)] mt-1">
                  Collection: {ts.collectionName}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-[var(--fg-muted)]">
                  {ts.caseCount} Ground Truth Test Cases
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]">
                  <span>Inspect & Edit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky Bottom Comparison Bar when exactly 2 runs are selected */}
      {selectedRunIds.length === 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--bg-elevated)] border border-[var(--accent)] shadow-2xl rounded-xl px-5 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="font-medium text-[var(--fg)]">2 Runs Selected</span>
            <span className="text-[var(--fg-subtle)]">•</span>
            <span className="font-mono text-[11px] text-[var(--fg-muted)] truncate max-w-xs">
              {evalRuns.find((r) => r.id === selectedRunIds[0])?.name} vs{" "}
              {evalRuns.find((r) => r.id === selectedRunIds[1])?.name}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(`/compare?a=${selectedRunIds[0]}&b=${selectedRunIds[1]}`)
            }
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare 2 runs →</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRunIds([])}
            className="p-1 rounded text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* New Eval Run Sheet */}
      {isNewRunOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsNewRunOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-[var(--bg-elevated)] border-l border-[var(--border-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--accent)]" />
                <span className="font-semibold text-sm text-[var(--fg)]">
                  Launch New Evaluation Run
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRunOpen(false)}
                className="p-1 rounded text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartRun} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block font-medium text-[var(--fg)] mb-1">
                  Target Collection
                </label>
                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                >
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.documentsCount} docs, {c.chunksCount} chunks)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[var(--fg)] mb-1">
                  Benchmark Test Set
                </label>
                <select
                  value={testSetId}
                  onChange={(e) => setTestSetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                >
                  {testSets.map((ts) => (
                    <option key={ts.id} value={ts.id}>
                      {ts.name} ({ts.caseCount} test cases)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[var(--fg)] mb-1">
                  Pipeline Configuration
                </label>
                <select
                  value={configId}
                  onChange={(e) => setConfigId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                >
                  {configs.map((cfg) => (
                    <option key={cfg.id} value={cfg.id}>
                      {cfg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-[var(--fg)] mb-1">
                  LLM-as-Judge Model
                </label>
                <select
                  value={judgeModel}
                  onChange={(e) => setJudgeModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                >
                  <option value="anthropic/claude-3-7-sonnet">Anthropic · Claude 3.7 Sonnet (Recommended)</option>
                  <option value="openai/gpt-4o">OpenAI · GPT-4o</option>
                  <option value="ollama/llama3.3:70b">Ollama · Llama 3.3 (70B)</option>
                </select>
                <p className="text-[10px] text-[var(--fg-subtle)] mt-1">
                  Recommendation: Don&apos;t let the judge be the same model as the generator to avoid self-preference bias.
                </p>
              </div>

              {/* Pre-Run Estimate Box */}
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] space-y-2 mt-4 font-mono text-xs">
                <span className="text-[10px] uppercase font-semibold text-[var(--fg-subtle)] font-sans">
                  Estimated Run Profile
                </span>
                <div className="flex items-center justify-between text-[var(--fg)]">
                  <span>Questions evaluated:</span>
                  <span>{estimatedQuestions} cases</span>
                </div>
                <div className="flex items-center justify-between text-[var(--fg)]">
                  <span>Estimated duration:</span>
                  <span>~{estimatedDuration}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--fg)]">
                  <span>Estimated token cost:</span>
                  <span className="text-[var(--positive)]">${estimatedCost}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewRunOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--fg)] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold cursor-pointer"
                >
                  Confirm & Start Eval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
