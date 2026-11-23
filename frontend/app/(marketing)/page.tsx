"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Copy,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
  Terminal,
  Database,
  GitCompare,
  Layers,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Mascot } from "../../components/ui/mascot";
import { useApp } from "../../lib/store/app-context";

const steps = [
  {
    step: "01",
    title: "Ingest with Immutable Structure",
    desc: "Parse filings, technical docs, and policies. Grounded splits documents into semantic chunks and binds them to immutable vector indexes for reliable regression testing.",
    badge: "Vector + Keyword",
    mascot: "retriever" as const,
  },
  {
    step: "02",
    title: "Synthesize with Cited Grounding",
    desc: "Answers are delivered with bidirectional chunk citations [1]. Every single sentence is grounded against raw passage sources so reviewers can verify claims in milliseconds.",
    badge: "Hallucination-Proof",
    mascot: "retriever" as const,
  },
  {
    step: "03",
    title: "Automated Benchmark Rubrics",
    desc: "Execute standardized test cases through LLM judges. Measure factual faithfulness, answer relevance, and context recall with precise per-run scoring and cost tracking.",
    badge: "Rubric Scoring",
    mascot: "owl" as const,
  },
  {
    step: "04",
    title: "Side-by-Side A/B Diff",
    desc: "Compare two pipeline runs head-to-head. Isolate chunking strategy changes, model switches, and temperature tweaks to catch retrieval degradation before shipping to production.",
    badge: "Regression Diff",
    mascot: "owl" as const,
  },
];

const providers = [
  { name: "OpenAI", tag: "GPT-4o & text-embedding-3" },
  { name: "Anthropic", tag: "Claude 3.7 Sonnet" },
  { name: "Ollama", tag: "Local Llama 3.3 & Qwen" },
  { name: "Groq", tag: "Ultra-low Latency Inference" },
  { name: "vLLM", tag: "Self-Hosted GPU Cluster" },
  { name: "PostgreSQL", tag: "pgvector Indexing" },
];

export default function MarketingLandingPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useApp();
  const [copied, setCopied] = useState(false);
  const dockerCommand = "docker compose up -d";

  const copy = async () => {
    await navigator.clipboard.writeText(dockerCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--ink)] selection:bg-indigo-500/20">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/80 px-6 backdrop-blur-md sm:px-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xs">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight text-[var(--ink)]">
            Grounded
          </span>
          <span className="hidden sm:inline-block font-mono-numbers text-[10px] px-1.5 py-0.2 rounded border border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--muted)]">
            v1.2
          </span>
        </div>

        <nav className="hidden items-center gap-6 text-xs text-[var(--muted)] md:flex">
          <a href="#workflow" className="hover:text-[var(--ink)] transition-colors">
            Workflow
          </a>
          <a href="#features" className="hover:text-[var(--ink)] transition-colors">
            Architecture
          </a>
          <a href="#evals" className="hover:text-[var(--ink)] transition-colors">
            Evaluation Hub
          </a>
          <a href="#self-host" className="hover:text-[var(--ink)] transition-colors">
            Self-Host
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-[var(--warning)]" /> : <Moon className="w-4 h-4" />}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-xs text-[var(--ink)] font-medium transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>GitHub</span>
          </a>

          <button
            type="button"
            onClick={() => router.push("/collections")}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <span>Open Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main>
        {/* ── Hero Section ────────────────────────────────────────────── */}
        <section className="relative mx-auto flex flex-col items-center overflow-hidden px-6 pt-16 pb-20 text-center sm:px-10 max-w-6xl">
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[100px] rounded-full" />

          {/* Micro-badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-6 animate-in fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>Grounded 1.2 · Provider-Agnostic RAG & Benchmark Suite</span>
          </div>

          <h1 className="max-w-4xl text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--ink)] leading-[1.08]">
            Every answer grounded.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Every claim verified.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--muted)]">
            A developer platform combining hybrid vector-keyword retrieval with automated rubric benchmarks and side-by-side A/B evaluation. Eliminate hallucinations with verifiable citations.
          </p>

          {/* Hero CTAs */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/collections")}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
            >
              <span>Launch Grounded Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface)] px-4 py-2.5 text-xs font-mono-numbers text-[var(--ink)] transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-[var(--accent-bright)]" />
              <span>{dockerCommand}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[var(--positive)]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[var(--subtle)]" />
              )}
            </button>
          </div>

          {/* Interactive Hero Showcase Preview */}
          <div className="mt-12 w-full max-w-4xl rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-2 shadow-2xl relative">
            <div className="rounded-lg border border-[var(--line)] bg-[var(--bg)] p-4 sm:p-6 text-left">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono-numbers text-[11px] text-[var(--subtle)]">
                    grounded-chat · SEC-10K-2025 · hybrid(k=5)
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono-numbers text-[10px] text-[var(--positive)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--positive)]" />
                  <span>98.4% faithfulness</span>
                </div>
              </div>

              {/* Chat question & grounded answer */}
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--ink)]">
                  <span className="font-semibold text-[var(--muted)] text-[10px] block uppercase tracking-wider mb-1">
                    User Query
                  </span>
                  What was Apple&apos;s Services revenue in fiscal 2025, and how did it perform compared to 2024?
                </div>

                <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs leading-relaxed text-[var(--ink)] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                    <span className="font-semibold text-indigo-400 text-[10px] uppercase tracking-wider">
                      Synthesized Grounded Answer
                    </span>
                    <span className="font-mono-numbers text-[10px] text-[var(--subtle)]">
                      48ms retrieval · 382 tokens
                    </span>
                  </div>
                  <p>
                    According to Apple&apos;s FY2025 Form 10-K, Services net sales reached{" "}
                    <strong className="text-[var(--ink)] font-semibold">$96,169 million</strong> in fiscal 2025{" "}
                    <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-400 font-mono text-[10px] font-bold border border-indigo-500/30">
                      [1]
                    </span>
                    . This represents an increase of{" "}
                    <strong className="text-[var(--ink)] font-semibold">13%</strong> compared to $85,200 million
                    recorded in fiscal 2024{" "}
                    <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-400 font-mono text-[10px] font-bold border border-indigo-500/30">
                      [1]
                    </span>
                    . Growth was driven by cloud storage, advertising, and App Store transactions{" "}
                    <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-400 font-mono text-[10px] font-bold border border-indigo-500/30">
                      [2]
                    </span>
                    .
                  </p>

                  {/* Source citations drawer preview */}
                  <div className="mt-3 p-2.5 rounded-md bg-[var(--surface-2)] border border-[var(--line)] text-[11px] space-y-1">
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Citation [1] · Apple_FY2025_10K.pdf (page 34)</span>
                    </div>
                    <p className="text-[var(--muted)] text-[10px] italic">
                      &ldquo;Services net sales were $96,169 million in 2025, an increase of 13% compared to $85,200 million in 2024, driven primarily by growth in advertising, cloud services and the App Store.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive production mascot trio */}
            <div className="absolute -bottom-10 -right-5 hidden h-40 w-64 items-end justify-center sm:flex">
              <Mascot name="mole" size={110} delay={0.5} priority className="-mr-7" />
              <Mascot name="retriever" size={145} delay={0} priority className="z-10" />
              <Mascot name="owl" size={110} delay={1} priority className="-ml-7" />
            </div>
          </div>
        </section>

        {/* ── 4-Step Interactive Workflow ──────────────────────────────── */}
        <section id="workflow" className="px-6 py-20 sm:px-10 border-t border-[var(--line)] bg-[var(--surface-2)]/30">
          <div className="mx-auto max-w-5xl">
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                End-to-End Pipeline
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
                From Raw Source Material to Verified Claim
              </h2>
              <p className="mt-2 text-xs text-[var(--muted)]">
                An observable, auditable architecture designed for enterprise engineering teams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((st) => (
                <div
                  key={st.step}
                  className="p-5 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] transition-all flex flex-col justify-between shadow-xs group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono-numbers text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {st.step}
                      </span>
                      <span className="text-[11px] font-mono-numbers text-[var(--subtle)]">
                        {st.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[var(--ink)] group-hover:text-indigo-400 transition-colors">
                      {st.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
                      {st.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[var(--subtle)]">
                      Automated pipeline stage
                    </span>
                    <Mascot name={st.mascot} size={36} pose="idle" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Architecture & Features Grid ────────────────────────────── */}
        <section id="features" className="px-6 py-20 sm:px-10 border-t border-[var(--line)]">
          <div className="mx-auto max-w-5xl">
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Core Capabilities
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
                Engineered for Rigorous Production Inspection
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: Database,
                  title: "Immutable Vector Indexes",
                  desc: "Indexes are frozen at creation. Changing chunk sizes or embedding models creates a new index so benchmarks remain mathematically comparable.",
                },
                {
                  icon: Search,
                  title: "Hybrid Dense + Sparse",
                  desc: "Combine vector embeddings for semantic depth with BM25 keyword matching for exact acronyms, numbers, and SKU code lookups.",
                },
                {
                  icon: ShieldCheck,
                  title: "Automated LLM Judges",
                  desc: "Score runs using Claude 3.7 or GPT-4o against standard RAG rubrics: Faithfulness, Answer Relevance, and Context Recall.",
                },
                {
                  icon: GitCompare,
                  title: "Side-by-Side A/B Diff",
                  desc: "Inspect diffs across 100+ questions simultaneously. Pinpoint exactly where recall dropped or latency spiked.",
                },
                {
                  icon: Zap,
                  title: "Provider-Agnostic Engine",
                  desc: "Seamlessly route embeddings and generation across OpenAI, Anthropic, Ollama local weights, vLLM, and Groq.",
                },
                {
                  icon: Layers,
                  title: "Local-First & Private",
                  desc: "Self-host the complete stack with standard Docker Compose. PostgreSQL and pgvector keep your sensitive documents on your network.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-5 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] transition-all shadow-xs"
                >
                  <div className="w-8 h-8 rounded-md bg-[var(--surface-2)] text-indigo-400 border border-[var(--line)] flex items-center justify-center mb-3">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[var(--ink)]">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Supported Ecosystem Strip ───────────────────────────────── */}
        <section className="px-6 py-12 border-t border-[var(--line)] bg-[var(--surface-2)]/30">
          <div className="mx-auto max-w-5xl">
            <span className="block text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--subtle)] mb-6">
              Compatible with Any LLM & Embedding Runtime
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {providers.map((p) => (
                <div
                  key={p.name}
                  className="p-3 rounded-md border border-[var(--line)] bg-[var(--surface)] text-center shadow-xs"
                >
                  <span className="font-bold text-xs text-[var(--ink)] block">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-[var(--muted)] truncate block mt-0.5">
                    {p.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Self-Host Terminal Section ──────────────────────────────── */}
        <section id="self-host" className="px-6 py-20 sm:px-10 border-t border-[var(--line)]">
          <div className="mx-auto max-w-3xl rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl text-center space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              One Command Deployment
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
              Self-Host in Seconds
            </h2>
            <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
              Run Grounded on your own hardware or cloud VPC with Docker. PostgreSQL, pgvector, and full API engine included.
            </p>

            <div className="mt-4 flex items-center justify-between p-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] font-mono-numbers text-xs text-[var(--ink)] max-w-lg mx-auto">
              <span className="text-indigo-400 select-none mr-2">$</span>
              <span className="flex-1 text-left">{dockerCommand}</span>
              <button
                type="button"
                onClick={copy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--line)] border border-[var(--line)] text-[11px] text-[var(--ink)] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[var(--positive)]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--line)] px-6 py-8 text-center text-xs text-[var(--muted)]">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-[var(--ink)]">Grounded</span>
            <span>—</span>
            <span>Every answer grounded, every claim measured.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/collections" className="hover:text-[var(--ink)]">
              Collections
            </Link>
            <Link href="/evals" className="hover:text-[var(--ink)]">
              Evaluations
            </Link>
            <Link href="/compare" className="hover:text-[var(--ink)]">
              Compare
            </Link>
            <Link href="/settings" className="hover:text-[var(--ink)]">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
