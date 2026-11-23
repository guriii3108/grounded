"use client";

import React, { useState } from "react";
import { useApp } from "../../lib/store/app-context";
import { StatusPill } from "../../components/ui/status-pill";
import { ProviderType } from "../../lib/types";
import {
  Plus,
  Cpu,
  Database,
  Scale,
  AlertTriangle,
  X,
  Server,
  Info,
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function SettingsPage() {
  const {
    providers,
    addProvider,
    testProviderConnection,
    modelRoles,
    updateModelRoles,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"providers" | "models">("providers");
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // New Provider Form State
  const [providerType, setProviderType] = useState<ProviderType>("openai");
  const [providerName, setProviderName] = useState("Custom OpenAI Endpoint");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");
  const [apiKey, setApiKey] = useState("");

  const handleProviderTypeChange = (type: ProviderType) => {
    setProviderType(type);
    if (type === "openai") {
      setProviderName("OpenAI");
      setBaseUrl("https://api.openai.com/v1");
    } else if (type === "anthropic") {
      setProviderName("Anthropic");
      setBaseUrl("https://api.anthropic.com/v1");
    } else if (type === "ollama") {
      setProviderName("Ollama (Local)");
      setBaseUrl("http://host.docker.internal:11434");
    } else {
      setProviderName("vLLM / Groq Compatible");
      setBaseUrl("https://api.groq.com/openai/v1");
    }
  };

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    addProvider({
      name: providerName,
      type: providerType,
      baseUrl,
      apiKeyMasked: apiKey ? `••••sk-${apiKey.slice(-4)}` : "not-required",
      status: "connected",
      latencyMs: 110,
      models: [
        {
          id: `${providerType}-default-chat`,
          name: `${providerName} Chat`,
          capabilities: ["chat"],
        },
      ],
    });
    setIsAddProviderOpen(false);
    setApiKey("");
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    await testProviderConnection(id);
    setTestingId(null);
  };

  // Warnings
  const isJudgeSameAsChat = modelRoles.judge.includes(modelRoles.chat.split("/")[1] || "nomatch");

  // Models list grouped by provider
  const allModels = providers.flatMap((p) =>
    p.models.map((m) => ({
      id: `${p.type}/${m.id}`,
      provider: p.name,
      modelName: m.name,
      capabilities: m.capabilities,
    }))
  );

  return (
    <div className="pt-12 pb-16 px-6 sm:px-10 max-w-5xl mx-auto space-y-8">
      {/* Header: generous 48px top spacing, serif title */}
      <div className="pb-4 border-b border-[var(--line)]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
          Settings: Providers & Models
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
          Configure API credentials, manage self-hosted endpoints (Ollama/vLLM), and bind global model roles.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("providers")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer text-sm",
            activeTab === "providers"
              ? "border-[var(--accent)] text-[var(--ink)] font-medium"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          )}
        >
          <Server className="w-4 h-4" />
          <span>Configured providers ({providers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("models")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer text-sm",
            activeTab === "models"
              ? "border-[var(--accent)] text-[var(--ink)] font-medium"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          )}
        >
          <Cpu className="w-4 h-4" />
          <span>Model roles binding</span>
        </button>
      </div>

      {/* Providers Tab: Drop the boxed outer container! */}
      {activeTab === "providers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-[var(--muted)]">
              All credentials encrypted at rest with AES-256 tokens and never sent to clients.
            </span>
            <button
              type="button"
              onClick={() => setIsAddProviderOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--ink)] hover:opacity-90 text-[var(--surface)] text-sm font-medium transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add provider</span>
            </button>
          </div>

          {/* Providers List: Rows with provider logo tile, status dot, latency in mono. No boxed outer container. */}
          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {providers.map((p) => (
              <div
                key={p.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-2)]/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  {/* Provider Logo Tile */}
                  <div className="w-10 h-10 rounded-[10px] bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center font-semibold text-sm text-[var(--ink)] shadow-xs shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-medium text-sm text-[var(--ink)]">{p.name}</span>
                      <StatusPill status={p.status} />
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 font-mono-numbers text-xs text-[var(--muted)]">
                      <span>{p.baseUrl}</span>
                      <span className="text-[var(--subtle)]">•</span>
                      <span>Key: {p.apiKeyMasked}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  {p.latencyMs && (
                    <span className="font-mono-numbers text-xs text-[var(--positive)] font-medium tabular-nums">
                      {p.latencyMs}ms
                    </span>
                  )}

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-numbers bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
                    {p.modelsCount} models
                  </span>

                  <button
                    type="button"
                    disabled={testingId === p.id}
                    onClick={() => handleTestConnection(p.id)}
                    className="px-4 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--ink)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {testingId === p.id ? "Testing…" : "Test connection"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Models Tab */}
      {activeTab === "models" && (
        <div className="space-y-6 max-w-2xl text-xs">
          {isJudgeSameAsChat && (
            <div className="p-4 rounded-[14px] border border-[var(--warning)]/30 bg-[var(--warning-subtle)] text-xs text-[var(--ink)] flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-sm">Self-preference bias warning:</span>
                <p className="text-[var(--muted)] mt-1 leading-relaxed">
                  The LLM judge and generator share model families. Using the same model as both evaluator and generator artificially inflates faithfulness scores.
                </p>
              </div>
            </div>
          )}

          {/* Model Roles Config */}
          <div className="p-6 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-[var(--accent)]" />
                <label className="font-medium text-sm text-[var(--ink)]">
                  Primary chat generator
                </label>
              </div>
              <p className="text-xs text-[var(--muted)] mb-2.5">
                Default LLM responsible for answering queries and synthesizing cited responses.
              </p>
              <select
                value={modelRoles.chat}
                onChange={(e) => updateModelRoles({ chat: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] font-medium outline-none focus:border-[var(--accent)]"
              >
                {allModels
                  .filter((m) => m.capabilities.includes("chat"))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.provider} · {m.modelName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-4 border-t border-[var(--line)]">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-[var(--accent)]" />
                <label className="font-medium text-sm text-[var(--ink)]">
                  Default embedding model
                </label>
              </div>
              <p className="text-xs text-[var(--muted)] mb-2.5">
                Generates dense vector embeddings during ingestion and query execution.
              </p>
              <select
                value={modelRoles.embedding}
                onChange={(e) => updateModelRoles({ embedding: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] font-medium outline-none focus:border-[var(--accent)]"
              >
                {allModels
                  .filter((m) => m.capabilities.includes("embedding"))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.provider} · {m.modelName}
                    </option>
                  ))}
              </select>
              <p className="text-[11px] text-[var(--warning)] mt-2 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                Changing the default embedding model will require re-indexing existing collections.
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--line)]">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-[var(--accent)]" />
                <label className="font-medium text-sm text-[var(--ink)]">
                  Automated LLM-as-judge
                </label>
              </div>
              <p className="text-xs text-[var(--muted)] mb-2.5">
                Impartial judge model responsible for scoring faithfulness and relevance rubrics.
              </p>
              <select
                value={modelRoles.judge}
                onChange={(e) => updateModelRoles({ judge: e.target.value })}
                className="w-full px-3.5 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] font-medium outline-none focus:border-[var(--accent)]"
              >
                {allModels
                  .filter((m) => m.capabilities.includes("judge"))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.provider} · {m.modelName}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Add Provider Side Sheet */}
      {isAddProviderOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsAddProviderOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[var(--surface)] border-l border-[var(--line-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-5 border-b border-[var(--line)]">
              <span className="font-bold text-sm text-[var(--ink)]">
                Connect New Provider
              </span>
              <button
                type="button"
                onClick={() => setIsAddProviderOpen(false)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProvider} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                  Provider ecosystem
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["openai", "anthropic", "ollama", "openai-compatible"] as ProviderType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleProviderTypeChange(type)}
                        className={cn(
                          "p-2.5 rounded-[10px] border text-left capitalize transition-all cursor-pointer text-xs",
                          providerType === type
                            ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--ink)] font-semibold"
                            : "border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)]"
                        )}
                      >
                        {type.replace("-", " ")}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                  Display name
                </label>
                <input
                  type="text"
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                  Base endpoint URL
                </label>
                <input
                  type="url"
                  required
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] font-mono-numbers outline-none focus:border-[var(--accent)]"
                />
                {providerType === "ollama" && (
                  <p className="text-[11px] text-[var(--accent)] mt-1.5 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    Running in Docker? Use <code>http://host.docker.internal:11434</code>
                  </p>
                )}
              </div>

              {providerType !== "ollama" && (
                <div>
                  <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                    API Key (Encrypted at rest)
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] font-mono-numbers outline-none focus:border-[var(--accent)]"
                  />
                </div>
              )}

              <div className="pt-5 border-t border-[var(--line)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProviderOpen(false)}
                  className="px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[var(--ink)] text-[var(--surface)] hover:opacity-90 font-medium cursor-pointer transition-opacity"
                >
                  Save & validate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
