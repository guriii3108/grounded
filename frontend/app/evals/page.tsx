"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../lib/store/app-context";
import { StatusPill } from "../../components/ui/status-pill";
import { formatRelativeTime } from "../../lib/format";
import {
  Layers,
  Plus,
  Play,
  ArrowRight,
  X,
  FileCheck2,
  GitCompare,
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function EvalsPage() {
  const router = useRouter();
  const { evalRuns, testSets, collections, configs, createEvalRun } = useApp();

  const [activeTab, setActiveTab] = useState<"runs" | "test-sets">("runs");
  const [isNewRunOpen, setIsNewRunOpen] = useState(false);

  // New Eval Run Form
  const [collectionId, setCollectionId] = useState(collections[0]?.id || "");
  const [testSetId, setTestSetId] = useState(testSets[0]?.id || "");
  const [configId, setConfigId] = useState(configs[0]?.id || "");
  const [judgeModel, setJudgeModel] = useState("anthropic/claude-3-7-sonnet");

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

  const selectedTestSet = testSets.find((t) => t.id === testSetId);
  const estimatedQuestions = selectedTestSet?.cases.length || 10;
  const estimatedCost = (estimatedQuestions * 0.015).toFixed(2);
  const estimatedDuration = `${Math.round(estimatedQuestions * 2.5)}s`;

  return (
    <div className="pt-8 pb-16 px-6 sm:px-10 max-w-7xl mx-auto space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
            Evaluation Hub
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Benchmark retrieval recall, faithfulness, latency, and costs against standardized test sets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsNewRunOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New eval run</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("runs")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer",
            activeTab === "runs"
              ? "border-[var(--accent-bright)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Evaluation Runs ({evalRuns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("test-sets")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer",
            activeTab === "test-sets"
              ? "border-[var(--accent-bright)] text-[var(--ink)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          )}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Test Sets ({testSets.length})</span>
        </button>
      </div>

      {/* Tab: Runs */}
      {activeTab === "runs" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-2)]/70 border-b border-[var(--line)] text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">
                  <tr className="h-9">
                    <th className="py-2 px-4">Evaluation Run</th>
                    <th className="py-2 px-4">Test Set</th>
                    <th className="py-2 px-4">Configuration</th>
                    <th className="py-2 px-4 text-right">Faithfulness</th>
                    <th className="py-2 px-4 text-right">Answer Rel.</th>
                    <th className="py-2 px-4 text-right">Recall@K</th>
                    <th className="py-2 px-4 text-right">P95 Latency</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {evalRuns.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => router.push(`/evals/runs/${run.id}`)}
                      className="h-12 hover:bg-[var(--surface-2)]/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-2 px-4 max-w-xs sm:max-w-sm">
                        <div className="font-semibold text-xs text-[var(--ink)] group-hover:text-[var(--accent-bright)] transition-colors">
                          {run.name}
                        </div>
                        <div className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                          {formatRelativeTime(run.startedAt)}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-[11px] text-[var(--muted)]">
                        {run.testSetName}
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-numbers bg-[var(--surface-2)] border border-[var(--line)] text-[var(--muted)]">
                            {run.config.embedding_model.split("/").pop()}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-numbers bg-[var(--surface-2)] border border-[var(--line)] text-[var(--muted)]">
                            {run.config.retrieval_mode}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-right font-mono-numbers font-medium text-[var(--positive)] tabular-nums">
                        {run.faithfulness ? `${Math.round(run.faithfulness * 100)}%` : "—"}
                      </td>
                      <td className="py-2 px-4 text-right font-mono-numbers font-medium text-[var(--positive)] tabular-nums">
                        {run.answerRelevance ? `${Math.round(run.answerRelevance * 100)}%` : "—"}
                      </td>
                      <td className="py-2 px-4 text-right font-mono-numbers font-medium text-[var(--positive)] tabular-nums">
                        {run.recallAtK ? `${Math.round(run.recallAtK * 100)}%` : "—"}
                      </td>
                      <td className="py-2 px-4 text-right font-mono-numbers text-[11px] text-[var(--muted)] tabular-nums">
                        {run.p95LatencyMs ? `${run.p95LatencyMs}ms` : "—"}
                      </td>
                      <td className="py-2 px-4">
                        <StatusPill status={run.status} progressPercent={run.progressPercent} />
                      </td>
                      <td className="py-2 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/compare?a=${run.id}`);
                            }}
                            className="p-1 rounded text-[var(--subtle)] hover:text-[var(--accent-bright)] transition-colors cursor-pointer"
                            title="Compare run"
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                          </button>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--muted)] group-hover:text-[var(--accent-bright)] transition-colors">
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Test Sets */}
      {activeTab === "test-sets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testSets.map((ts) => (
            <div
              key={ts.id}
              onClick={() => router.push(`/evals/test-sets/${ts.id}`)}
              className="p-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]/30 transition-all cursor-pointer flex flex-col justify-between shadow-xs group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="w-8 h-8 rounded-md bg-[var(--surface-2)] text-[var(--accent-bright)] flex items-center justify-center border border-[var(--line)]">
                    <FileCheck2 className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] text-[var(--subtle)] font-mono-numbers">
                    {ts.cases.length} questions
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-[var(--ink)] group-hover:text-[var(--accent-bright)] transition-colors">
                  {ts.name}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1 font-mono-numbers">
                  Created {formatRelativeTime(ts.createdAt)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
                <span className="font-mono-numbers text-[11px] text-[var(--muted)] truncate max-w-[180px]">
                  Collection: {collections.find((c) => c.id === ts.collectionId)?.name || ts.collectionId}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--subtle)] group-hover:text-[var(--accent-bright)] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Eval Run Sheet */}
      {isNewRunOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsNewRunOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-[var(--surface)] border-l border-[var(--line-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-[var(--line)]">
              <span className="font-bold text-sm text-[var(--ink)]">
                Launch Evaluation Run
              </span>
              <button
                type="button"
                onClick={() => setIsNewRunOpen(false)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartRun} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                  Target Collection
                </label>
                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                >
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.documentsCount} docs, {c.chunksCount} chunks)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                  Benchmark Test Set
                </label>
                <select
                  value={testSetId}
                  onChange={(e) => setTestSetId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                >
                  {testSets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.cases.length} questions)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                  Pipeline Configuration
                </label>
                <select
                  value={configId}
                  onChange={(e) => setConfigId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                >
                  {configs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.retrieval_mode} (top_k={c.top_k})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                  LLM Judge Model
                </label>
                <select
                  value={judgeModel}
                  onChange={(e) => setJudgeModel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="anthropic/claude-3-7-sonnet">Claude 3.7 Sonnet (Recommended)</option>
                  <option value="openai/gpt-4o">OpenAI GPT-4o</option>
                  <option value="ollama/llama3.3:70b">Ollama Llama 3.3 70B (Local)</option>
                </select>
              </div>

              {/* Estimate box */}
              <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] space-y-2 text-xs">
                <span className="font-semibold text-[var(--ink)] block">
                  Run Preflight Estimates
                </span>
                <div className="grid grid-cols-3 gap-2 font-mono-numbers text-[11px]">
                  <div>
                    <span className="text-[var(--subtle)] block font-sans text-[10px]">Test questions</span>
                    <span className="text-[var(--ink)] font-medium">{estimatedQuestions}</span>
                  </div>
                  <div>
                    <span className="text-[var(--subtle)] block font-sans text-[10px]">Est. duration</span>
                    <span className="text-[var(--ink)] font-medium">{estimatedDuration}</span>
                  </div>
                  <div>
                    <span className="text-[var(--subtle)] block font-sans text-[10px]">Est. cost</span>
                    <span className="text-[var(--ink)] font-medium">${estimatedCost}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewRunOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start benchmark</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
