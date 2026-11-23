"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check, Copy, Moon, Sun } from "lucide-react";
import { useApp } from "../../lib/store/app-context";

// TODO: set your real repo URL
const GITHUB_URL = "https://github.com/guriii3108/grounded";

/* ───────────────────────── primitives ───────────────────────── */

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setShown(true), 0);
      return () => clearTimeout(timer);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-shown={shown} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

type MascotName = "mochi" | "nova" | "wisp";

/** Renders /public/mascot/{name}-{pose}.webp. Falls back to -idle, then hides. Never fakes the art. */
function Mascot({
  name,
  pose = "idle",
  width = 160,
  className = "",
  delay = 0,
}: {
  name: MascotName;
  pose?: string;
  width?: number;
  className?: string;
  delay?: number;
}) {
  const idle = `/mascot/${name}-idle.webp`;
  const [src, setSrc] = useState(`/mascot/${name}-${pose}.webp`);
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div aria-hidden="true" className={`pointer-events-none select-none ${className}`} style={{ width }}>
      <div className="mascot-float" style={{ animationDelay: `${delay}s` }}>
        <Image
          src={src}
          alt=""
          width={600}
          height={600}
          sizes={`${width}px`}
          onError={() => (src !== idle ? setSrc(idle) : setHidden(true))}
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
        <path d="M2.5 18.5h19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M6.5 18.5a5.5 5.5 0 0 1 11 0z" fill="var(--accent)" />
      </svg>
      <span className="font-serif-display text-[26px] leading-none tracking-[-0.02em]">Grounded</span>
    </span>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-sm text-mute">{children}</p>;
}

/** Single-surface frame. Rows inside are separated by hairlines, never nested cards. */
function Frame({
  title,
  children,
  mascot,
  mascotPos = "right",
}: {
  title: string;
  children: ReactNode;
  mascot?: ReactNode;
  mascotPos?: "left" | "right";
}) {
  return (
    <div className="relative">
      {mascot}
      <div className="overflow-hidden rounded-[22px] border border-hair bg-card shadow-soft">
        <div
          className={`border-b border-hair py-3 text-xs text-mute font-mono-numbers transition-all ${
            mascotPos === "left" ? "px-5 sm:pl-36 sm:pr-5" : "px-5"
          }`}
        >
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────── data ───────────────────────── */

// Sample content for the demo. Not real filing data.
const sources = [
  {
    id: 1,
    doc: "Apple_FY2025_10K.pdf",
    page: 34,
    before: "Services net sales increased during 2025 compared to 2024, ",
    hit: "reaching $96,169 million, up 13% year over year",
    after: ", driven primarily by advertising, the App Store and cloud services.",
  },
  {
    id: 2,
    doc: "Apple_FY2025_10K.pdf",
    page: 36,
    before: "The Company's Services gross margin percentage was higher than Products, ",
    hit: "reflecting a favorable mix and ongoing scale in subscriptions",
    after: ". Margins vary with product mix and foreign exchange.",
  },
  {
    id: 3,
    doc: "Apple_FY2025_10K.pdf",
    page: 12,
    before: "Item 1A. ",
    hit: "The Company's business, results of operations and financial condition could be affected by regulatory action in the EU",
    after: " under the Digital Markets Act and similar frameworks.",
  },
];

const steps = [
  {
    n: "01",
    title: "Ingest anything",
    text: "Drop PDFs, DOCX, Markdown or a URL. Documents are parsed, chunked and embedded in the background, and every index is tied to the exact chunking and embedding model that built it.",
  },
  {
    n: "02",
    title: "Ask, with receipts",
    text: "Hybrid retrieval fuses vector and keyword search. The answer streams with inline citations, and when the documents don't contain it, the model says so.",
  },
  {
    n: "03",
    title: "Measure the pipeline",
    text: "Generate a test set from your own documents, run it, and get recall, faithfulness, relevance, latency and cost per question, with the judge's reasoning attached.",
  },
  {
    n: "04",
    title: "Change one thing, compare",
    text: "Swap the model, chunk size or retrieval mode. See exactly which parameters changed and which questions got better or worse.",
  },
];

const principles = [
  ["Citations or silence", "Every claim maps to a retrieved chunk. If nothing supports it, the answer says so instead of guessing."],
  ["Indexes are immutable", "Change chunk size or embedding model and you get a new index. Comparisons stay honest because nothing is edited in place."],
  ["Hybrid by default", "Dense vectors and BM25 keyword search, fused with reciprocal rank fusion, on plain Postgres with pgvector."],
  ["The judge is not the generator", "Grounded warns you when both share a model family, because self-preference quietly inflates scores."],
  ["Any provider", "OpenAI, Anthropic, Ollama, or any OpenAI-compatible endpoint. Keys are encrypted at rest and never sent back to the browser."],
  ["Cost and latency on every run", "p50 and p95 latency, token usage and dollars sit next to quality, so you see the real tradeoff."],
];

const providers = ["OpenAI", "Anthropic", "Ollama", "Groq", "vLLM", "OpenRouter", "PostgreSQL"];

const dockerLines = ["cp .env.example .env", "docker compose up -d"];

/* ───────────────────────── step visuals ───────────────────────── */

function IngestVisual() {
  const files = [
    { name: "Apple_FY2025_10K.pdf", meta: "112 pages · 1,284 chunks", done: true },
    { name: "MSFT_FY2025_10K.pdf", meta: "98 pages · 1,102 chunks", done: true },
    { name: "Risk_factors_2025.md", meta: "24 pages · 310 chunks", done: false, pct: 62 },
  ];
  return (
    <ul className="divide-y divide-hair">
      {files.map((f) => (
        <li key={f.name} className="flex items-center gap-4 px-5 py-4">
          <span className={`size-2 shrink-0 rounded-full ${f.done ? "bg-pos" : "bg-brand animate-pulse"}`} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{f.name}</p>
            {!f.done && (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-sunk">
                <div className="h-full rounded-full bg-brand" style={{ width: `${f.pct}%` }} />
              </div>
            )}
          </div>
          <span className="hidden shrink-0 text-xs text-mute font-mono-numbers sm:block">{f.meta}</span>
          <span className={`shrink-0 text-xs ${f.done ? "text-pos" : "text-brand"}`}>{f.done ? "Ready" : `${f.pct}%`}</span>
        </li>
      ))}
    </ul>
  );
}

function RetrievalVisual() {
  const rows = [
    { label: "Vector", score: 0.82 },
    { label: "Keyword (BM25)", score: 0.64 },
    { label: "Fused (RRF)", score: 0.91, strong: true },
  ];
  return (
    <div className="px-5 py-5">
      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[110px_1fr_40px] items-center gap-4 text-sm sm:grid-cols-[140px_1fr_44px]">
            <span className={r.strong ? "text-ink" : "text-mute"}>{r.label}</span>
            <div className="h-1.5 overflow-hidden rounded-full bg-sunk">
              <div className={`h-full rounded-full ${r.strong ? "bg-brand" : "bg-hair-strong"}`} style={{ width: `${r.score * 100}%` }} />
            </div>
            <span className="text-right text-xs text-mute font-mono-numbers">{r.score.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-hair pt-4 text-sm text-mute">Top 5 chunks go to the model. 3 end up cited.</p>
    </div>
  );
}

function EvalVisual() {
  const metrics = [
    ["Recall@5", "91%"],
    ["Faithfulness", "88%"],
    ["p95 latency", "1.8s"],
    ["Cost", "$0.42"],
  ];
  return (
    <div>
      <div className="grid grid-cols-2 divide-hair sm:grid-cols-4 sm:divide-x">
        {metrics.map(([label, value]) => (
          <div key={label} className="border-b border-hair px-5 py-5 sm:border-b-0">
            <p className="text-xs text-mute">{label}</p>
            <p className="mt-1 text-3xl text-ink font-mono-numbers">{value}</p>
          </div>
        ))}
      </div>
      <p className="flex gap-3 border-t border-hair px-5 py-4 text-sm text-mute">
        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
        85% of low-faithfulness answers had the right chunk retrieved. This is a generation problem, not a retrieval problem.
      </p>
    </div>
  );
}

function CompareVisual() {
  const diffs = [
    ["chat_model", "gpt-4o", "llama3.3:70b"],
    ["retrieval", "hybrid", "vector"],
    ["top_k", "5", "3"],
  ];
  const deltas = [
    ["Recall@5", "91% → 82%", "−9", false],
    ["p95 latency", "1.8s → 0.8s", "faster", true],
    ["Cost", "$0.42 → $0.00", "saved", true],
  ] as const;
  return (
    <div>
      <ul className="divide-y divide-hair">
        {diffs.map(([key, from, to]) => (
          <li key={key} className="flex items-center gap-3 px-5 py-3 text-sm font-mono-numbers">
            <span className="w-24 shrink-0 text-mute">{key}</span>
            <span className="text-neg line-through decoration-neg/50">{from}</span>
            <ArrowRight className="size-3.5 shrink-0 text-faint" />
            <span className="truncate text-pos">{to}</span>
          </li>
        ))}
      </ul>
      <ul className="divide-y divide-hair border-t border-hair bg-sunk/60">
        {deltas.map(([label, change, note, good]) => (
          <li key={label} className="flex items-center justify-between px-5 py-3 text-sm">
            <span className="text-mute">{label}</span>
            <span className="text-ink font-mono-numbers">{change}</span>
            <span className={`w-14 text-right text-xs ${good ? "text-pos" : "text-neg"}`}>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function MarketingLandingPage() {
  const { theme, toggleTheme } = useApp();
  const [active, setActive] = useState(1);
  const [copied, setCopied] = useState(false);

  const current = sources.find((s) => s.id === active) ?? sources[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(dockerLines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const chip = (id: number) => (
    <button
      type="button"
      onClick={() => setActive(id)}
      onMouseEnter={() => setActive(id)}
      aria-label={`Show source ${id}`}
      className={`mx-0.5 inline-flex h-[22px] min-w-[22px] -translate-y-px items-center justify-center rounded-md px-1.5 align-middle text-[11px] font-medium transition-colors font-mono-numbers ${
        active === id ? "bg-brand text-brand-fg" : "bg-brand/12 text-brand hover:bg-brand/25"
      }`}
    >
      {id}
    </button>
  );

  return (
    <div className="grain min-h-screen overflow-x-hidden bg-paper text-ink selection:bg-brand/25">
      {/* ── nav ── */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-hair bg-paper/80 pl-5 pr-2 shadow-soft backdrop-blur-xl">
          <Link href="/" aria-label="Grounded home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-mute md:flex">
            <a className="transition-colors hover:text-ink" href="#workflow">Workflow</a>
            <a className="transition-colors hover:text-ink" href="#principles">Principles</a>
            <a className="transition-colors hover:text-ink" href="#self-host">Self-host</a>
            <a className="inline-flex items-center gap-1 transition-colors hover:text-ink" href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight className="size-3.5" />
            </a>
          </nav>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="grid size-10 place-items-center rounded-full text-mute transition-colors hover:bg-sunk hover:text-ink"
            >
              {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </button>
            <Link
              href="/collections"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              Open platform <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── hero ── */}
        <section className="relative isolate px-5 pt-36 sm:px-8 sm:pt-44">
          <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px]" />
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <Reveal>
              <p className="flex items-center gap-2 text-sm text-mute">
                <span className="size-1.5 rounded-full bg-brand" />
                Open-source RAG with built-in evaluation
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-7 font-serif-display text-[clamp(3.2rem,8.4vw,7.6rem)] font-normal leading-[0.94] tracking-[-0.03em] text-balance">
                Every answer grounded, every claim <em className="italic text-brand">measured.</em>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-8 max-w-xl text-pretty text-lg leading-8 text-mute">
                Point Grounded at your documents. Get cited answers, then prove the pipeline works with evals and side-by-side comparisons, on any model you choose.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/collections"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-[15px] font-medium text-paper transition-transform hover:-translate-y-0.5"
              >
                Launch Grounded <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-hair-strong px-7 text-[15px] font-medium text-ink transition-colors hover:bg-sunk"
              >
                View on GitHub <ArrowUpRight className="size-4" />
              </a>
            </Reveal>
          </div>

          {/* crew, cropped by the section's bottom edge */}
          <div className="relative mx-auto mt-12 h-[250px] max-w-5xl overflow-hidden sm:h-[400px] lg:h-[470px]">
            {/* <span
              aria-hidden="true"
              className="ghost-word pointer-events-none absolute inset-x-0 bottom-[-0.14em] select-none text-center font-serif-display leading-none"
            >
              GROUNDED
            </span> */}
            <Image
              src="/mascot/crew-hero-v2.webp"
              alt="Mochi, Wisp and Nova, the Grounded crew"
              width={2560}
              height={1440}
              priority
              sizes="(max-width: 640px) 110vw, 1000px"
              className="crew-blend absolute bottom-[-2%] left-1/2 w-[min(1000px,115%)] max-w-none -translate-x-1/2 object-contain"
            />
          </div>
        </section>

        {/* ── interactive evidence demo ── */}
        <section id="demo" className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <Reveal className="max-w-2xl">
              <Label>See the evidence</Label>
              <h2 className="mt-3 font-serif-display text-[clamp(2.4rem,5vw,4rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance">
                Every sentence points back to the page it came from.
              </h2>
              <p className="mt-5 text-lg leading-8 text-mute">Hover or tap a citation. The exact passage lights up.</p>
            </Reveal>

            <Reveal delay={100} className="mt-12">
              <div className="relative">
                <Mascot name="nova" pose="idle" width={104} className="absolute -top-[90px] right-6 z-10 hidden sm:block" />
                <div className="grid overflow-hidden rounded-[26px] border border-hair bg-card shadow-lift lg:grid-cols-[1.25fr_1fr]">
                  {/* answer pane */}
                  <div className="p-6 sm:p-9">
                    <p className="text-xs text-mute">Question</p>
                    <p className="mt-2 text-lg text-ink">How did Services revenue perform in fiscal 2025, and what is the regulatory risk?</p>
                    <div className="my-7 h-px bg-hair" />
                    <p className="text-xs text-mute">Answer</p>
                    <p className="mt-3 text-[17px] leading-[1.85] text-ink">
                      Services net sales reached $96.2 billion in fiscal 2025, up 13% from the prior year{chip(1)}. Management points to a favorable mix that keeps Services margins above Products{chip(2)}. The main regulatory exposure flagged in the filing is EU action under the Digital Markets Act{chip(3)}.
                    </p>
                    <p className="mt-8 text-xs text-faint">Sample answer on demo data.</p>
                  </div>

                  {/* source pane */}
                  <div className="border-t border-hair bg-sunk/70 lg:border-l lg:border-t-0">
                    <div className="flex h-11 items-center justify-between border-b border-hair px-6 text-xs text-mute font-mono-numbers">
                      <span>sources / 3 retrieved</span>
                    </div>
                    <ul className="divide-y divide-hair border-b border-hair">
                      {sources.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => setActive(s.id)}
                            className={`relative flex w-full items-center gap-3 px-6 py-3.5 text-left text-sm transition-colors ${
                              active === s.id ? "bg-card text-ink" : "text-mute hover:text-ink"
                            }`}
                          >
                            {active === s.id && <span className="absolute inset-y-0 left-0 w-[3px] bg-brand" />}
                            <span className="grid size-5 shrink-0 place-items-center rounded-md bg-brand/12 text-[11px] text-brand font-mono-numbers">{s.id}</span>
                            <span className="min-w-0 flex-1 truncate">{s.doc}</span>
                            <span className="shrink-0 text-xs font-mono-numbers">p. {s.page}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="p-6 sm:p-7">
                      <p className="text-xs text-mute">Retrieved passage</p>
                      <p key={current.id} className="mt-3 animate-in text-[15px] leading-7 text-mute">
                        {current.before}
                        <mark className="rounded bg-brand/20 px-0.5 text-ink">{current.hit}</mark>
                        {current.after}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── workflow ── */}
        <section id="workflow" className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <Reveal className="max-w-2xl">
              <Label>The loop</Label>
              <h2 className="mt-3 font-serif-display text-[clamp(2.4rem,5vw,4rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance">
                Ingest, ask, evaluate, compare. Then do it again, better.
              </h2>
            </Reveal>

            <div className="mt-20 space-y-28 sm:space-y-36">
              {steps.map((s, i) => {
                const visuals = [<IngestVisual key="a" />, <RetrievalVisual key="b" />, <EvalVisual key="c" />, <CompareVisual key="d" />];
                const mascots: { name: MascotName; pose: string }[] = [
                  { name: "mochi", pose: "document" },
                  { name: "wisp", pose: "magnifier" },
                  { name: "nova", pose: "scale" },
                  { name: "nova", pose: "badge" },
                ];
                const flip = i % 2 === 1;
                return (
                  <div key={s.n} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                    <Reveal className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
                      <span className="font-serif-display text-[7rem] leading-none text-hair-strong sm:text-[9rem]">{s.n}</span>
                      <h3 className="-mt-4 font-serif-display text-4xl font-normal tracking-[-0.02em] sm:text-5xl">{s.title}</h3>
                      <p className="mt-5 max-w-md text-[17px] leading-8 text-mute">{s.text}</p>
                    </Reveal>
                    <Reveal delay={120} className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
                      <Frame
                        title={["collection / sec-10k", "retrieval trace", "run / gpt4o-hybrid-k5", "compare / run A vs run B"][i]}
                        mascotPos={flip ? "left" : "right"}
                        mascot={
                          <Mascot
                            name={mascots[i].name}
                            pose={mascots[i].pose}
                            width={104}
                            delay={i * 0.7}
                            className={`absolute -top-[80px] z-10 hidden sm:block ${flip ? "left-6" : "right-6"}`}
                          />
                        }
                      >
                        {visuals[i]}
                      </Frame>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── principles ── */}
        <section id="principles" className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-5xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal className="lg:sticky lg:top-32 lg:self-start">
              <Label>What it won&apos;t let you skip</Label>
              <h2 className="mt-3 font-serif-display text-[clamp(2.4rem,5vw,4rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance">
                Opinionated where it counts.
              </h2>
              <p className="mt-5 max-w-sm text-lg leading-8 text-mute">The defaults are the ones you&apos;d arrive at after your third bad RAG launch.</p>
            </Reveal>

            <ol className="border-t border-hair">
              {principles.map(([title, text], i) => (
                <Reveal key={title} delay={i * 40}>
                  <li className="group grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-hair py-8 transition-colors">
                    <span className="pt-1.5 text-xs text-faint font-mono-numbers">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-serif-display text-3xl font-normal tracking-[-0.015em] transition-colors group-hover:text-brand">{title}</h3>
                      <p className="mt-3 max-w-lg text-base leading-7 text-mute">{text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ── providers ── */}
        <section className="px-5 pb-24 sm:px-8 sm:pb-32">
          <Reveal className="mx-auto max-w-5xl text-center">
            <Label>Bring your own models and storage</Label>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {providers.map((p) => (
                <li key={p} className="font-serif-display text-3xl text-faint transition-colors hover:text-ink sm:text-4xl">
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* ── self-host ── */}
        <section id="self-host" className="px-5 pb-24 sm:px-8 sm:pb-32">
          <Reveal className="mx-auto max-w-5xl">
            <div className="relative">
              <Mascot name="nova" pose="idle" width={150} className="pointer-events-none absolute -right-2 -top-14 z-10 hidden sm:block" />
              <Mascot name="mochi" pose="idle" width={120} delay={1.2} className="pointer-events-none absolute -bottom-[34px] left-8 z-10 hidden opacity-95 lg:block" />
              <div className="relative overflow-hidden rounded-[32px] bg-panel px-6 py-16 text-panel-fg sm:px-14 sm:py-20">
                <div className="relative mx-auto max-w-2xl text-center">
                  <p className="text-sm opacity-60">Your stack, your data</p>
                  <h2 className="mt-3 font-serif-display text-[clamp(2.4rem,5vw,4.2rem)] font-normal leading-[1.02] tracking-[-0.025em] text-balance">
                    Run it where your work lives.
                  </h2>
                  <p className="mx-auto mt-5 max-w-lg text-lg leading-8 opacity-70">
                    One compose file brings up the API, worker, Postgres and the UI. Point it at a hosted model or your local Ollama.
                  </p>

                  <div className="mx-auto mt-10 max-w-md overflow-hidden rounded-2xl border border-white/12 bg-black/25 text-left">
                    <div className="flex items-start justify-between gap-4 p-5">
                      <pre className="min-w-0 flex-1 overflow-x-auto text-sm leading-7 font-mono-numbers">
                        {dockerLines.map((line) => (
                          <span key={line} className="block whitespace-pre">
                            <span className="select-none opacity-40">$ </span>
                            {line}
                          </span>
                        ))}
                      </pre>
                      <button
                        type="button"
                        onClick={copy}
                        aria-label="Copy commands"
                        className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"
                      >
                        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/collections"
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-panel-fg px-7 text-[15px] font-medium text-panel transition-opacity hover:opacity-90"
                    >
                      Open the platform <ArrowRight className="size-4" />
                    </Link>
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-7 text-[15px] font-medium transition-colors hover:bg-white/10"
                    >
                      Star on GitHub <ArrowUpRight className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── footer ── */}
      <footer className="relative overflow-hidden border-t border-hair px-5 pt-14 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <Logo />
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-mute">
            <Link href="/collections" className="hover:text-ink">Collections</Link>
            <Link href="/evals" className="hover:text-ink">Evaluations</Link>
            <Link href="/compare" className="hover:text-ink">Compare</Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-ink">GitHub</a>
          </nav>
        </div>
        {/* <p aria-hidden="true" className="ghost-word mt-10 select-none text-center font-serif-display leading-[0.8]">
          Grounded
        </p> */}
      </footer>
    </div>
  );
}