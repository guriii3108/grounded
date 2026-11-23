"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Database,
  FileSearch,
  GitCompareArrows,
  Menu,
  Moon,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
} from "lucide-react";
import { useApp } from "../../lib/store/app-context";

const proofPoints = ["Built for retrieval", "Citations by default", "Benchmarks included"];

const capabilities = [
  {
    icon: Database,
    title: "Know what went in",
    description: "Versioned collections and inspectable chunks keep every answer tied to the source material you approved.",
    tint: "bg-violet-500/12 text-violet-300",
  },
  {
    icon: SearchCheck,
    title: "Find the right evidence",
    description: "Hybrid search blends semantic understanding with exact keyword recall, even in dense technical documents.",
    tint: "bg-cyan-500/12 text-cyan-300",
  },
  {
    icon: ShieldCheck,
    title: "Ship with confidence",
    description: "Run rubric-based evaluations before a prompt, model, or chunking change reaches your users.",
    tint: "bg-amber-500/12 text-amber-300",
  },
];

const workflow = [
  { number: "01", title: "Bring your source of truth", text: "Upload files, sync a collection, and see exactly how every document becomes searchable context.", icon: FileSearch },
  { number: "02", title: "Trace every response", text: "Give your team answers with precise citations that lead straight back to the supporting passage.", icon: SearchCheck },
  { number: "03", title: "Prove every release", text: "Compare production runs and make evaluation a habit—not an emergency response.", icon: GitCompareArrows },
];

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-violet-400 via-indigo-500 to-cyan-400 shadow-[0_10px_24px_-8px_rgba(99,102,241,0.8)]">
        <div className="size-3 rounded-[4px] border-2 border-white/90" />
      </div>
      <span className="text-[15px] font-bold tracking-[-0.04em] text-[var(--ink)]">grounded</span>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-bold uppercase tracking-[0.17em] text-violet-300">{children}</span>;
}

export default function MarketingLandingPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useApp();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dockerCommand = "docker compose up -d";

  const copy = async () => {
    await navigator.clipboard.writeText(dockerCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--ink)] selection:bg-violet-400/30">
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border border-white/8 bg-[color:color-mix(in_srgb,var(--bg)_84%,transparent)] px-3 shadow-[0_12px_36px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:px-4">
          <Link href="/" aria-label="Grounded home"><Wordmark /></Link>

          <nav className="hidden items-center gap-6 text-xs font-medium text-[var(--muted)] md:flex">
            <a className="transition hover:text-[var(--ink)]" href="#how-it-works">How it works</a>
            <a className="transition hover:text-[var(--ink)]" href="#platform">Platform</a>
            <a className="transition hover:text-[var(--ink)]" href="#self-host">Self-host</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="grid size-8 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]">
              {theme === "dark" ? <Sun className="size-4 text-amber-300" /> : <Moon className="size-4" />}
            </button>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" className="grid size-8 place-items-center rounded-lg text-[var(--muted)] md:hidden">
              <Menu className="size-4" />
            </button>
            <button type="button" onClick={() => router.push("/collections")} className="hidden items-center gap-1.5 rounded-xl bg-[var(--ink)] px-3.5 py-2 text-xs font-semibold text-[var(--bg)] transition hover:scale-[1.02] sm:flex">
              Open platform <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-sm shadow-xl md:hidden">
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--surface-2)]">How it works</a>
            <a href="#platform" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--surface-2)]">Platform</a>
            <a href="#self-host" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--surface-2)]">Self-host</a>
            <button type="button" onClick={() => router.push("/collections")} className="mt-1 rounded-lg bg-[var(--ink)] px-3 py-2 text-left text-sm font-semibold text-[var(--bg)]">Open platform</button>
          </nav>
        )}
      </header>

      <main>
        <section className="relative isolate overflow-hidden px-5 pb-12 pt-32 sm:px-8 sm:pt-36 lg:pb-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-[-18rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-violet-500/18 blur-[130px]" />
            <div className="absolute right-[-16rem] top-56 h-80 w-80 rounded-full bg-cyan-400/10 blur-[100px]" />
            <div className="absolute bottom-0 left-[-13rem] h-72 w-72 rounded-full bg-amber-300/8 blur-[100px]" />
            <div className="landing-grid absolute inset-x-0 bottom-0 h-[62%] opacity-35" />
          </div>

          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-violet-200 shadow-sm">
              <Sparkles className="size-3.5" />
              <span>RAG you can actually trust</span>
            </div>
            <h1 className="mt-6 max-w-4xl text-balance text-[clamp(2.9rem,7vw,6.3rem)] font-bold leading-[0.94] tracking-[-0.065em] text-[var(--ink)]">
              Make every answer <span className="hero-gradient-text">earn its place.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-sm leading-7 text-[var(--muted)] sm:text-base">
              Grounded gives your AI answers sources, your team a clear audit trail, and every release a benchmark worth believing.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={() => router.push("/collections")} className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-12px_rgba(99,102,241,0.85)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-12px_rgba(99,102,241,0.95)]">
                Start grounding answers <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a href="#how-it-works" className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)]/70 px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:border-violet-400/45 hover:bg-[var(--surface-2)]">
                See how it works <ChevronRight className="size-4" />
              </a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-[var(--muted)]">
              {proofPoints.map((point) => <span key={point} className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-emerald-400" />{point}</span>)}
            </div>

            <div className="relative mt-2 h-[230px] w-full max-w-5xl overflow-hidden sm:mt-4 sm:h-[365px]">
              <div aria-hidden="true" className="absolute inset-x-[13%] bottom-[11%] h-24 rounded-full bg-violet-500/25 blur-[60px]" />
              <Image src="/mascot/crew-hero-v2.webp" alt="Mochi, Wisp, and Nova, Grounded's mascot crew" width={2560} height={1440} priority sizes="(max-width: 640px) 100vw, (max-width: 1024px) 88vw, 960px" className="absolute left-1/2 top-0 w-full max-w-[960px] -translate-x-1/2 -translate-y-[18%] object-contain" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/65 to-transparent" />
            </div>

            <div className="relative z-10 -mt-8 grid w-full max-w-3xl grid-cols-3 overflow-hidden rounded-2xl border border-[var(--line)] bg-[color:color-mix(in_srgb,var(--surface)_82%,transparent)] text-left shadow-2xl backdrop-blur-xl sm:-mt-12">
              {[["99.2%", "citation coverage"], ["< 2 min", "to your first collection"], ["3 views", "one source of truth"]].map(([value, label], index) => (
                <div key={label} className={"px-4 py-4 sm:px-7 sm:py-5 " + (index ? "border-l border-[var(--line)]" : "")}>
                  <strong className="block text-base tracking-[-0.04em] text-[var(--ink)] sm:text-xl">{value}</strong>
                  <span className="mt-0.5 block text-[10px] leading-tight text-[var(--muted)] sm:text-[11px]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="border-y border-[var(--line)] bg-[var(--surface)]/40 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>A calmer way to ship RAG</Eyebrow>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Everything your answer needs to stand up to scrutiny.</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">The context, the claim, and the evaluation live in one thoughtfully connected workspace.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {capabilities.map(({ icon: Icon, title, description, tint }) => (
                <article key={title} className="group rounded-3xl border border-[var(--line)] bg-[var(--bg)]/70 p-6 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-1 hover:border-violet-400/35">
                  <div className={"grid size-11 place-items-center rounded-2xl " + tint}><Icon className="size-5" /></div>
                  <h3 className="mt-8 text-xl font-semibold tracking-[-0.035em] text-[var(--ink)]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
                  <div className="mt-7 h-px bg-gradient-to-r from-violet-400/45 to-transparent opacity-0 transition group-hover:opacity-100" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <Eyebrow>Designed for the whole loop</Eyebrow>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Less guesswork. More proof.</h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)] sm:text-base">Grounded connects preparation, retrieval, and evaluation in a flow that feels obvious to use and rigorous under the hood.</p>
              <button type="button" onClick={() => router.push("/collections")} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-violet-200">Explore the workspace <ArrowRight className="size-4" /></button>
            </div>
            <div className="space-y-3">
              {workflow.map(({ number, title, text, icon: Icon }) => (
                <article key={number} className="group flex gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/45 p-4 transition hover:border-violet-400/35 hover:bg-[var(--surface)] sm:gap-6 sm:p-6">
                  <span className="font-mono-numbers text-xs font-bold text-violet-300/85">{number}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3"><h3 className="text-base font-semibold tracking-[-0.025em]">{title}</h3><Icon className="size-5 shrink-0 text-[var(--subtle)] transition group-hover:text-violet-300" /></div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="glass-panel mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-violet-400/18 p-5 sm:p-8 lg:p-10">
            <div className="grid items-center gap-9 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <Eyebrow>A product view, not a black box</Eyebrow>
                <h2 className="mt-4 text-balance text-3xl font-bold tracking-[-0.055em] sm:text-4xl">See the evidence alongside the answer.</h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">A purpose-built workspace keeps the retrieval trace close enough to inspect before it becomes a production decision.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0a0b13] p-3 shadow-2xl">
                <div className="rounded-xl border border-white/8 bg-[#11131d] p-4 sm:p-5">
                  <div className="flex items-center justify-between border-b border-white/8 pb-3 text-[10px] font-medium text-zinc-400"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-400" />collection / acme-handbook</span><span>faithfulness 98.4%</span></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1.35fr_0.65fr]">
                    <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3"><span className="text-[10px] font-semibold uppercase tracking-widest text-violet-300">Grounded answer</span><p className="mt-2 text-xs leading-5 text-zinc-200">Employees can carry forward up to <strong>five vacation days</strong> into the next calendar year <span className="rounded bg-violet-400/15 px-1 text-violet-200">[1]</span>.</p><div className="mt-3 h-1.5 w-4/5 rounded-full bg-white/10"><div className="h-full w-[84%] rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" /></div></div>
                    <div className="rounded-lg border border-violet-400/20 bg-violet-400/[0.07] p-3"><span className="text-[10px] font-semibold uppercase tracking-widest text-violet-200">Evidence [1]</span><p className="mt-2 text-[10px] leading-4 text-zinc-400">handbook.pdf · p. 19</p><p className="mt-2 text-[10px] leading-4 text-zinc-300">“Unused days may be carried forward, up to a maximum of five.”</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="self-host" className="border-t border-[var(--line)] bg-[var(--surface)]/35 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Your stack, your data</Eyebrow>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-[-0.055em] sm:text-5xl">Run it where your work lives.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">Self-host Grounded with your own models, data, and infrastructure. No trade-off between craft and control.</p>
            <div className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-2xl border border-[var(--line-strong)] bg-[var(--bg)] p-2 pl-4 text-left shadow-xl">
              <Terminal className="size-4 shrink-0 text-violet-300" /><code className="min-w-0 flex-1 truncate text-xs text-zinc-300">{dockerCommand}</code>
              <button type="button" onClick={copy} className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--ink)] transition hover:bg-violet-500 hover:text-white" aria-label="Copy Docker command">{copied ? <Check className="size-4 text-emerald-300" /> : <Copy className="size-4" />}</button>
            </div>
            <button type="button" onClick={() => router.push("/collections")} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-violet-200">Open the platform <ArrowRight className="size-4" /></button>
          </div>
        </section>
      </main>

      <footer className="px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-[var(--muted)] sm:flex-row">
          <Wordmark />
          <span>Every answer grounded. Every change measured.</span>
          <div className="flex gap-4"><Link href="/collections" className="hover:text-[var(--ink)]">Collections</Link><Link href="/evals" className="hover:text-[var(--ink)]">Evaluations</Link><Link href="/compare" className="hover:text-[var(--ink)]">Compare</Link></div>
        </div>
      </footer>
    </div>
  );
}
