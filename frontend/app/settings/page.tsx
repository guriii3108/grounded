"use client";

import React, { useState } from "react";
import { useApp } from "../../lib/store/app-context";
import { StatusPill } from "../../components/ui/status-pill";
import { Provider, ProviderType } from "../../lib/types";
import {
  Settings,
  Plus,
  ShieldCheck,
  Cpu,
  Database,
  Scale,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  Radio,
  Server,
  KeyRound,
  ExternalLink,
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h1 className="text-xl font-bold tracking-tight text-[var(--fg)]">
          Settings: Providers & Models
        </h1>
        <p className="text-xs text-[var(--fg-muted)] mt-0.5">
          Configure API credentials, manage self-hosted endpoints (Ollama/vLLM), and bind global model roles.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("providers")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer",
            activeTab === "providers"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
          )}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Configured Providers ({providers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("models")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer",
            activeTab === "models"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
          )}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Model Roles Binding</span>
        </button>
      </div>

      {/* Providers Tab */}
      {activeTab === "providers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--fg-muted)]">
              All credentials encrypted at rest with AES-256 Fernet tokens and never sent to clients.
            </span>
            <button
              type="button"
              onClick={() => setIsAddProviderOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Provider</span>
            </button>
          </div>

          {/* Providers Table / Row List */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
            <div className="divide-y divide-[var(--border)]">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--bg-subtle)]/60 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center font-semibold text-xs text-[var(--fg)]">
                      {p.name.charAt(0)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--fg)]">{p.name}</span>
                        <StatusPill status={p.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 font-mono text-[11px] text-[var(--fg-subtle)]">
                        <span>{p.baseUrl}</span>
                        <span>•</span>
                        <span>Key: {p.apiKeyMasked}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {p.latencyMs && (
                      <span className="font-mono text-[11px] text-[var(--positive)]">
                        {p.latencyMs}ms latency
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--fg-muted)]">
                      {p.modelsCount} models
                    </span>

                    <button
                      type="button"
                      disabled={testingId === p.id}
                      onClick={() => handleTestConnection(p.id)}
                      className="px-2.5 py-1 rounded-md border border-[var(--border-strong)] bg-[var(--bg)] hover:bg-[var(--bg-subtle)] text-[11px] font-medium text-[var(--fg)] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {testingId === p.id ? "Testing..." : "Test connection"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Models Tab */}
      {activeTab === "models" && (
        <div className="space-y-6 max-w-2xl text-xs">
          {/* Warning notice when Judge == Chat model */}
          {isJudgeSameAsChat && (
            <div className="p-3.5 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning-subtle)]/60 text-xs text-[var(--fg)] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Self-Preference Bias Warning:</span>
                <p className="text-[var(--fg-muted)] mt-0.5 leading-relaxed">
                  The LLM judge and generator share model families. Using the same model as both evaluator and generator artificially inflates faithfulness scores.
                </p>
              </div>
            </div>
          )}

          {/* Model Roles Config Card */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-[var(--accent)]" />
                <label className="font-semibold text-sm text-[var(--fg)]">
                  Primary Chat Generator
                </label>
              </div>
              <p className="text-[var(--fg-subtle)] mb-2">
                Default LLM responsible for answering queries and synthesizing cited responses.
              </p>
              <select
                value={modelRoles.chat}
                onChange={(e) => updateModelRoles({ chat: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)] font-medium"
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

            <div className="pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-[var(--accent)]" />
                <label className="font-semibold text-sm text-[var(--fg)]">
                  Default Embedding Model
                </label>
              </div>
              <p className="text-[var(--fg-subtle)] mb-2">
                Generates dense vector embeddings during ingestion and query execution.
              </p>
              <select
                value={modelRoles.embedding}
                onChange={(e) => updateModelRoles({ embedding: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)] font-medium"
              >
                {allModels
                  .filter((m) => m.capabilities.includes("embedding"))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.provider} · {m.modelName}
                    </option>
                  ))}
              </select>
              <p className="text-[10px] text-[var(--warning)] mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Changing the default embedding model will require re-indexing existing collections.
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-[var(--accent)]" />
                <label className="font-semibold text-sm text-[var(--fg)]">
                  Automated LLM-as-Judge
                </label>
              </div>
              <p className="text-[var(--fg-subtle)] mb-2">
                Impartial judge model responsible for scoring faithfulness and relevance rubrics.
              </p>
              <select
                value={modelRoles.judge}
                onChange={(e) => updateModelRoles({ judge: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)] font-medium"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsAddProviderOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[var(--bg-elevated)] border-l border-[var(--border-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--fg)]">
                Connect New Provider
              </span>
              <button
                type="button"
                onClick={() => setIsAddProviderOpen(false)}
                className="p-1 rounded text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProvider} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block font-medium text-[var(--fg)] mb-1">
                  Provider Ecosystem
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["openai", "anthropic", "ollama", "openai-compatible"] as ProviderType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleProviderTypeChange(type)}
                        className={cn(
                          "p-2.5 rounded-lg border text-left capitalize transition-all cursor-pointer",
                          providerType === type
                            ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold"
                            : "border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
                        )}
                      >
                        {type.replace("-", " ")}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block font-medium text-[var(--fg)] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--fg)] mb-1">
                  Base Endpoint URL
                </label>
                <input
                  type="url"
                  required
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)] font-mono"
                />
                {providerType === "ollama" && (
                  <p className="text-[10px] text-[var(--accent)] mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Running in Docker? Use <code>http://host.docker.internal:11434</code>
                  </p>
                )}
              </div>

              {providerType !== "ollama" && (
                <div>
                  <label className="block font-medium text-[var(--fg)] mb-1">
                    API Key (Encrypted at rest)
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)] font-mono"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddProviderOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--fg)] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold cursor-pointer"
                >
                  Save & Validate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
