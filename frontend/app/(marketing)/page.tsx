"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mascot } from "../../components/ui/mascot";
import { useApp } from "../../lib/store/app-context";
import {
  ArrowRight,
  Check,
  Copy,
  Terminal,
  ShieldCheck,
  Sparkles,
  Database,
  Cpu,
  Layers,
  FileText,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "../../lib/utils";

/* ── Retriever glyph for navbar ── */
function RetrieverGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <ellipse cx="10" cy="12" rx="6" ry="5" fill="var(--accent)" opacity="0.9" />
      <circle cx="10" cy="7" r="4" fill="var(--accent)" opacity="0.9" />
      <ellipse cx="6.5" cy="5" rx="2" ry="3" fill="var(--accent)" opacity="0.75" transform="rotate(-15 6.5 5)" />
      <ellipse cx="13.5" cy="5" rx="2" ry="3" fill="var(--accent)" opacity="0.75" transform="rotate(15 13.5 5)" />
      <circle cx="8.5" cy="6.5" r="0.8" fill="var(--bg)" />
      <circle cx="11.5" cy="6.5" r="0.8" fill="var(--bg)" />
    </svg>
  );
}

export default function MarketingLandingPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const dockerCommand = "git clone https://github.com/grounded-ai/grounded.git && cd grounded && docker compose up -d";

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(dockerCommand);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const steps = [
    {
      title: "1. Ingest",
      subtitle: "Deterministic chunking & pgvector indexes",
      desc: "Drop financial filings, PDF research, or technical docs. Automatic section preservation, sentence-boundary chunking, and index immutability ensure reproducible embeddings.",
      mascot: "mole" as const,
      preview: (
        <div className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] space-y-3 font-mono-numbers text-xs">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent)]" /> Apple_FY2025_10K.pdf
            </span>
            <span className="text-[var(--positive)] font-semibold">Indexed</span>
          </div>
          <div className="p-2.5 rounded-[8px] bg-[var(--surface)] border border-[var(--line)] text-[11px] text-[var(--muted)]">
            Chunk #142 · Tokens: 488 · Hybrid Vector (1536 dims) + tsvector
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--subtle)]">
            <span>Recall anchor: p. 34 § Services Net Sales</span>
            <span>0.94 score</span>
          </div>
        </div>
      ),
    },
    {
      title: "2. Ask",
      subtitle: "Grounded chat with verifiable source anchors",
      desc: "Every answer generated cites exact source chunks with interactive number anchors. Refuses to hallucinate when facts aren't present in your documentation.",
      mascot: "retriever" as const,
      preview: (
        <div className="p-4 rounded-[12px] bg-[var(--surface)] border border-[var(--line)] space-y-3 text-xs shadow-xs">
          <div className="p-2.5 rounded-[10px] bg-[var(--surface-2)] text-[var(--ink)] font-medium">
            &ldquo;What were Services net sales in fiscal 2025?&rdquo;
          </div>
          <div className="p-3 rounded-[10px] bg-[var(--surface)] border border-[var(--line)] text-sm leading-relaxed text-[var(--ink)]">
            Services net sales reached $96,169 million in fiscal 2025{" "}
            <span className="px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-mono-numbers font-medium text-xs">
              [1]
            </span>
            , representing an increase of 13% over 2024.
          </div>
        </div>
      ),
    },
    {
      title: "3. Evaluate",
      subtitle: "Automated LLM-as-judge rubrics",
      desc: "Benchmark full pipelines against ground-truth test sets. Impartial judges score Faithfulness, Answer Relevance, and Recall@k with automated telemetry.",
      mascot: "owl" as const,
      preview: (
        <div className="p-4 rounded-[12px] bg-[var(--surface)] border border-[var(--line)] space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
            <span className="font-medium text-[var(--ink)]">Benchmark Run #4 · Claude 3.7 Judge</span>
            <span className="text-[var(--positive)] font-mono-numbers font-bold">96% Faithfulness</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono-numbers text-[11px]">
            <div className="p-2 rounded bg-[var(--surface-2)]">
              <span className="text-[var(--muted)] block">Recall@k</span>
              <span className="font-semibold text-[var(--ink)]">100%</span>
            </div>
            <div className="p-2 rounded bg-[var(--surface-2)]">
              <span className="text-[var(--muted)] block">p95 Latency</span>
              <span className="font-semibold text-[var(--ink)]">1,120ms</span>
            </div>
            <div className="p-2 rounded bg-[var(--surface-2)]">
              <span className="text-[var(--muted)] block">Cost/Run</span>
              <span className="font-semibold text-[var(--positive)]">$0.04</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "4. Compare",
      subtitle: "A/B regression detection & parameter diffs",
      desc: "Compare two experimental runs side-by-side. Track per-question improvements and catch regressions with diverging delta bars and inline config diffs.",
      mascot: "owl" as const,
      preview: (
        <div className="p-4 rounded-[12px] bg-[var(--surface)] border border-[var(--line)] space-y-3 text-xs">
          <div className="flex items-center justify-between font-mono-numbers text-xs">
            <span className="text-[var(--muted)]">GPT-4o vs Claude 3.5 Haiku</span>
            <span className="text-[var(--positive)] font-bold">▲ +12% Faithfulness</span>
          </div>
          <div className="w-full bg-[var(--line)] h-1.5 rounded-full overflow-hidden flex">
            <div className="w-1/2" />
            <div className="w-[35%] bg-[var(--positive)] h-full rounded-r-full" />
          </div>
          <p className="text-[11px] text-[var(--muted)] font-mono-numbers">
            top_k: <span className="line-through text-[var(--negative)]">3</span> → <span className="text-[var(--positive)] font-semibold">5</span> (Hybrid RRF)
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      {/* ── Global Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 w-full border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur-md px-6 sm:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <RetrieverGlyph size={24} />
          <span className="font-display text-2xl font-normal tracking-tight text-[var(--ink)]">
            Grounded
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--muted)]">
          <a href="#workflow" className="hover:text-[var(--ink)] transition-colors">
            Workflow
          </a>
          <a href="#features" className="hover:text-[var(--ink)] transition-colors">
            Features
          </a>
          <a href="#docker" className="hover:text-[var(--ink)] transition-colors">
            Self-Host
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--ink)] transition-colors flex items-center gap-1"
          >
            GitHub
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[var(--warning)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--muted)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push("/collections")}
            className="px-5 py-2 rounded-full bg-[var(--ink)] text-[var(--surface)] text-sm font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            Open platform →
          </button>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 px-6 sm:px-12 max-w-6xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Single small uppercase eyebrow */}
        <div className="eyebrow-caps mb-4 px-3.5 py-1 rounded-full border border-[var(--line)] bg-[var(--surface)] shadow-xs">
          RAG ENGINE & BENCHMARK SUITE
        </div>

        {/* Serif headline */}
        <h1 className="font-display text-5xl sm:text-7xl font-normal tracking-tight text-[var(--ink)] max-w-4xl leading-[1.08] mb-6">
          Every answer grounded, <br className="hidden sm:inline" />
          every claim measured.
        </h1>

        {/* One-line subhead */}
        <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl leading-relaxed mb-9">
          Provider-agnostic retrieval augmented generation with built-in automated LLM-as-judge evaluation and regression-proof A/B comparisons.
        </p>

        {/* Action pills */}
        <div className="flex items-center gap-4 flex-wrap justify-center mb-16">
          <button
            type="button"
            onClick={() => router.push("/collections")}
            className="px-7 py-3 rounded-full bg-[var(--ink)] text-[var(--surface)] text-sm font-medium hover:opacity-90 transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <span>Launch Grounded</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-7 py-3 rounded-full border border-[var(--line-strong)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-4 h-4 text-[var(--muted)]" />
          </a>
        </div>

        {/* Mascot Cluster with faint oversized background word */}
        <div className="relative w-full max-w-2xl flex items-center justify-center py-10 select-none">
          {/* Faint oversized background word */}
          <span className="absolute inset-0 flex items-center justify-center font-display font-black text-7xl sm:text-9xl tracking-[0.2em] text-[var(--ink)] opacity-[0.04] pointer-events-none uppercase">
            GROUNDED
          </span>

          {/* Three mascots cluster */}
          <div className="relative z-10 flex items-end justify-center gap-4 sm:gap-8">
            <div className="flex flex-col items-center">
              <Mascot name="mole" size={72} />
              <span className="text-xs font-medium text-[var(--muted)] mt-2">Mole · Ingest</span>
            </div>
            <div className="flex flex-col items-center -translate-y-4">
              <Mascot name="retriever" size={96} />
              <span className="text-xs font-semibold text-[var(--ink)] mt-2">Retriever · Ground</span>
            </div>
            <div className="flex flex-col items-center">
              <Mascot name="owl" size={72} />
              <span className="text-xs font-medium text-[var(--muted)] mt-2">Owl · Evaluate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4-Step Workflow Section ──────────────────────────────────── */}
      <section id="workflow" className="py-20 px-6 sm:px-12 border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow-caps block mb-2">END-TO-END VERIFICATION</span>
            <h2 className="font-display text-3xl sm:text-4xl text-[var(--ink)] tracking-tight">
              Ingest → Ask → Evaluate → Compare
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2">
              From raw documents to verifiable claims in production, measured against regression rubrics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "p-6 rounded-[20px] border transition-all cursor-pointer flex flex-col justify-between",
                  activeStep === idx
                    ? "border-[var(--accent)] bg-[var(--surface-2)] shadow-[0_4px_20px_rgba(233,166,107,0.12)]"
                    : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display text-lg text-[var(--ink)]">
                      {step.title}
                    </span>
                    <Mascot name={step.mascot} size={36} />
                  </div>
                  <h3 className="font-medium text-xs text-[var(--ink)] mb-2">
                    {step.subtitle}
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-6">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-[var(--line)]">
                  {step.preview}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6-Item Feature Grid ──────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 sm:px-12 border-t border-[var(--line)] bg-[var(--bg)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="eyebrow-caps block mb-2">ARCHITECTURAL INTEGRITY</span>
            <h2 className="font-display text-3xl sm:text-4xl text-[var(--ink)] tracking-tight">
              Engineered for absolute groundedness
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Verifiable Citation Anchors",
                desc: "Answers map assertions directly to source chunks with interactive number anchors. Refuses to hallucinate when context is absent.",
              },
              {
                icon: Sparkles,
                title: "Self-Preference Bias Detection",
                desc: "Automated warnings when evaluator judges share the generator model family, preventing inflated synthetic scores.",
              },
              {
                icon: Database,
                title: "Hybrid Reciprocal Rank Fusion",
                desc: "Combines dense pgvector semantic similarity with sparse tsvector BM25 keyword matching for optimal recall.",
              },
              {
                icon: Layers,
                title: "Immutable Index Versioning",
                desc: "Chunk sizes and embedding weights are strictly bound to indexes. Any configuration change creates a clean, comparable benchmark.",
              },
              {
                icon: Cpu,
                title: "High-Density Cost & Latency Telemetry",
                desc: "Measure inference spend, embedding costs, and p95 latency down to the millisecond and fractional cent.",
              },
              {
                icon: Terminal,
                title: "Self-Hosted & Provider Agnostic",
                desc: "Deploy with Docker in minutes. Connect seamlessly to Ollama, vLLM, OpenAI, Anthropic, Groq, or any OpenAI-compatible gateway.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-[20px] border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-base text-[var(--ink)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Providers Strip ─────────────────────────────────────────── */}
      <section className="py-14 px-6 sm:px-12 border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs text-[var(--muted)] block mb-6 font-medium">
            Seamlessly works with any model, embedding, or vector provider:
          </span>
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap text-sm font-mono-numbers text-[var(--muted)]">
            <span>OpenAI</span>
            <span>Anthropic Claude</span>
            <span>Ollama</span>
            <span>Groq</span>
            <span>vLLM</span>
            <span>PostgreSQL pgvector</span>
          </div>
        </div>
      </section>

      {/* ── Docker Compose Up Block ─────────────────────────────────── */}
      <section id="docker" className="py-20 px-6 sm:px-12 border-t border-[var(--line)] bg-[var(--surface-2)]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="eyebrow-caps block">ZERO DEPENDENCIES BEYOND DOCKER</span>
          <h2 className="font-display text-3xl sm:text-4xl text-[var(--ink)] tracking-tight">
            Deploy Grounded locally in seconds
          </h2>
          <p className="text-sm text-[var(--muted)] max-w-lg mx-auto leading-relaxed">
            Includes PostgreSQL with pgvector pre-configured, database migrations, and the full Next.js UI suite.
          </p>

          <div className="relative p-4 rounded-[14px] bg-[var(--surface)] border border-[var(--line-strong)] text-left font-mono-numbers text-xs text-[var(--ink)] flex items-center justify-between gap-4 shadow-sm overflow-x-auto">
            <div className="flex items-center gap-3">
              <span className="text-[var(--accent)] font-bold">$</span>
              <span className="truncate">{dockerCommand}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCommand}
              className="px-3.5 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--ink)] text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--positive)]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="mt-auto py-12 px-6 sm:px-12 border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <RetrieverGlyph size={20} />
            <span className="font-display text-base text-[var(--ink)]">Grounded</span>
            <span>—</span>
            <span>Every answer grounded, every claim measured.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/collections" className="hover:text-[var(--ink)] transition-colors">
              Platform
            </Link>
            <Link href="/evals" className="hover:text-[var(--ink)] transition-colors">
              Evals
            </Link>
            <Link href="/compare" className="hover:text-[var(--ink)] transition-colors">
              Compare
            </Link>
            <Link href="/settings" className="hover:text-[var(--ink)] transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
