## Grounded: Frontend Design Doc (v0.1)

### 1. Design principles

1. **Density over decoration.** This is a tool for people who inspect results. Tight spacing, small type, information first. Think Linear and Vercel, not a marketing dashboard.
2. **Show the evidence.** Every answer links to its sources, every score to its per-question breakdown. Nothing is a black box.
3. **One accent, earned color.** Neutral UI. Color is reserved for meaning: accent for primary actions, green/red for deltas, amber for warnings.
4. **Keyboard-first.** Every primary action is reachable without a mouse.
5. **Every state is designed.** Loading, empty, error, partial, and cancelled states get as much care as the happy path.

### 2. Stack

| Concern         | Choice                                                      | Why                                                                 |
| --------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| Framework       | Next.js 15 App Router, TypeScript strict                    | You know it; RSC for shell, client components for interactive parts |
| Styling         | Tailwind v4 + CSS variable tokens                           | Theming without rebuilds                                            |
| Primitives      | shadcn/ui + Radix                                           | Owned code, accessible, restylable                                  |
| Server state    | TanStack Query                                              | Caching, polling for job status, optimistic updates                 |
| Client state    | URL params first, Zustand only for ephemeral UI             | Shareable links beat hidden state                                   |
| Charts          | Recharts for standard charts; custom SVG for the diff view  | Recharts is fine until you need the diff bars                       |
| Motion          | Framer Motion                                               | Restrained only                                                     |
| Forms           | react-hook-form + zod                                       | Shared schemas with API types                                       |
| Tables          | TanStack Table + TanStack Virtual                           | Eval results can be thousands of rows                               |
| Command palette | cmdk                                                        | The shadcn default, works well                                      |
| Icons           | Lucide                                                      | Consistent stroke weight                                            |
| API types       | Generate from FastAPI's OpenAPI with `openapi-typescript` | Zero hand-written API types, no drift                               |
| Testing         | Vitest + Testing Library, Playwright for 3 critical flows   | Don't over-test UI                                                  |

### 3. Visual system

#### 3.1 Tokens

Define everything as CSS variables so dark/light is a class swap.

css

```css
:root {
  --bg: 0 0% 100%;
  --bg-subtle: 240 5% 97%;
  --bg-elevated: 0 0% 100%;
  --border: 240 6% 90%;
  --border-strong: 240 6% 80%;
  --fg: 240 10% 8%;
  --fg-muted: 240 4% 40%;
  --fg-subtle: 240 4% 55%;
  --accent: 252 85% 60%;
  --accent-fg: 0 0% 100%;
  --positive: 152 60% 36%;
  --negative: 0 72% 50%;
  --warning: 38 92% 50%;
  --ring: 252 85% 60%;
  --radius: 8px;
}

.dark {
  --bg: 240 8% 6%;
  --bg-subtle: 240 6% 9%;
  --bg-elevated: 240 6% 11%;
  --border: 240 5% 16%;
  --border-strong: 240 5% 24%;
  --fg: 0 0% 96%;
  --fg-muted: 240 5% 65%;
  --fg-subtle: 240 4% 48%;
  --accent: 252 90% 68%;
  --positive: 152 55% 50%;
  --negative: 0 75% 62%;
  --warning: 38 92% 58%;
}
```

**Opinion:** pick one accent (indigo/violet shown) and never add a second. Resist the urge to make charts rainbow. Use accent plus neutrals, and green/red only for deltas.

#### 3.2 Typography

* **Geist Sans** for UI, **Geist Mono** for IDs, scores, config values, code.
* Scale: 12 (meta) / 13 (table + dense UI) / 14 (body default) / 16 (chat answers) / 20 (page titles) / 28 (landing only).
* Tabular numerals (`font-variant-numeric: tabular-nums`) on every metric and table column. Misaligned numbers are the fastest way to look amateur.
* Chat answers use 16px with 1.65 line height. Reading comfort matters there more than density.

#### 3.3 Spacing, radius, elevation

* 4px base grid; use 4/8/12/16/24/32/48.
* Radius: 6px inputs/buttons, 8px panels, 12px modals. Nothing rounder.
* **Borders define structure, not shadows.** Shadows only on popovers, menus, and modals. No card-in-card: use dividers and whitespace for hierarchy inside a panel.

#### 3.4 Motion

* 120-180ms, ease-out. No bounce, no spring overshoot.
* Animate: popovers, panel slides, list insertions, number count-ups on metric cards (once), skeleton shimmer.
* Never animate: table rows on sort, chart axes, anything in a hot path.
* Respect `prefers-reduced-motion`.

### 4. App shell and navigation

```
┌──────────┬──────────────────────────────────────────┐
│ Sidebar  │ Top bar: breadcrumb · ⌘K · theme · status│
│ 220px    ├──────────────────────────────────────────┤
│          │                                          │
│ Collections                                         │
│ Evals    │            Page content                  │
│ Compare  │                                          │
│          │                                          │
│ Settings │                                          │
└──────────┴──────────────────────────────────────────┘
```

* Collapsible sidebar (`[` toggles). Collapsed = icons only.
* Sidebar items:  **Collections, Evals, Compare, Settings** . Collections expands inline to show the recent ones.
* Top bar: breadcrumbs, a ⌘K trigger that looks like a search field, a **job indicator** (spinner plus count when ingestion/evals are running, click opens a popover listing them), theme toggle.
* Route map:

```
/                                  → redirect to /collections
/collections
/collections/[id]                  → documents tab (default)
/collections/[id]/chat
/collections/[id]/chat/[convId]
/evals                             → test sets + runs
/evals/test-sets/[id]
/evals/runs/[id]
/compare?a=[runId]&b=[runId]
/settings/providers
/settings/models
```

Everything shareable lives in the URL, including compare selections, table filters, and sort.

### 5. Page specs

#### 5.1 Collections list

* Table or grid toggle (default table). Columns: name, documents, chunks, last indexed, active index.
* Empty state: a dashed dropzone panel, one sentence of copy, a primary "Create collection" button, and a secondary "Load sample dataset" button. The sample dataset button matters: it gets recruiters to a working demo in 10 seconds.
* Create flow: a modal with name plus embedding model select (only providers already configured; if none, an inline link to Settings).

#### 5.2 Collection detail

* Tabs:  **Documents · Indexes · Settings** . A persistent "Open chat" primary button.
* **Documents:** a full-width dropzone at the top (collapses to a button once documents exist), then a table: filename, type, size, pages, chunks, status, added.
* Status pill states: `queued` (neutral), `processing` (accent, animated, with a progress percentage), `ready` (green), `failed` (red, click to see error in a side sheet with a retry button).
* Polling: TanStack Query `refetchInterval` active only while any row is non-terminal. Don't poll when idle.
* **Indexes tab:** list of indexes with their chunking and embedding params, plus doc/chunk counts. Make the "re-index required" concept visible here, since this is where the hard backend gotcha surfaces to the user.

#### 5.3 Chat (the signature screen)

Layout: a two-pane split.

```
┌──────────────────────────────┬─────────────────────┐
│ Conversation                 │ Sources panel       │
│                              │                     │
│ User: ...                    │ [1] doc.pdf · p.12  │
│ Assistant: text [1] more [2] │   highlighted chunk │
│                              │ [2] ...             │
│ ┌──────────────────────────┐ │                     │
│ │ Ask…         ⚙ config  ↵ │ │                     │
│ └──────────────────────────┘ │                     │
└──────────────────────────────┴─────────────────────┘
```

**Message rendering**

* Streamed via SSE; render markdown incrementally. Use `react-markdown` with a memoized block renderer so only the last block re-renders per token. Without this, long answers will stutter.
* Citations are parsed from `[n]` tokens into **chips** (small mono-numbered rounded rectangles). Hover shows a popover: doc name, page, 3-line snippet, retrieval score. Click opens/scrolls the Sources panel and highlights the cited chunk's text.
* "Not found in the documents" answers get a distinct, muted style plus a "Show what was retrieved" link. This builds trust.
* Message footer (visible on hover): copy, regenerate, "inspect retrieval" (opens a drawer with all retrieved chunks, scores, and modes), latency, tokens.

**Composer**

* Auto-growing textarea, `Enter` sends, `Shift+Enter` newline, `↑` recalls the last message.
* **Config popover** (⚙): chat model, retrieval mode, top_k, temperature, as a compact form. Shows a "modified from default" dot when changed. Includes a "Save as pipeline config" action, which is the bridge from chat to evals.
* Stop button replaces send while streaming; `Esc` cancels.

**Sources panel**

* Collapsible. Lists retrieved chunks for the selected message. The cited ones are pinned at the top, the uncited retrieved ones below under a "Retrieved but not cited" divider. That distinction is genuinely useful for debugging.
* Chunk view: document, page, the text with the cited sentence highlighted, a "Open document" link.

#### 5.4 Evals hub

* Two tabs: **Runs** (default) and  **Test sets** .
* Runs table: status, collection, config summary (chat model + retrieval mode + top_k as compact tags), recall@k, faithfulness, p95 latency, cost, started. Sortable, with multi-select checkboxes. Selecting exactly 2 reveals a sticky bottom bar:  **"Compare 2 runs →"** . That's the fastest path to the hero feature.
* Test sets: name, case count, source (generated/imported/manual), collection.
* "New run" opens a side sheet: pick test set, pick or create a pipeline config, pick judge model. Show an **estimated cost and duration** before the user confirms. Surprise bills kill trust.

#### 5.5 Test set detail

* Editable table of cases: question, expected answer, source chunk (linked). Inline edit, row delete, bulk import from CSV/JSON via dropzone.
* "Generate cases" modal: number of cases, question-type mix, model. Show generated cases in a review state before committing them; users must be able to discard bad ones.

#### 5.6 Run detail

* **Header:** status, config tags, timestamps, a "Compare with…" action, a "Re-run" action.
* **Metric strip:** 5 compact metrics (Recall@k, MRR, Faithfulness, Relevance, p95 latency, cost). Each has its value in mono, a small distribution sparkline, and a tooltip explaining how it's computed. Not oversized KPI cards.
* **Results table:** question, retrieval hit (✓/✗), faithfulness score, relevance score, latency. Virtualized. Filters: "failed retrieval", "low faithfulness (<0.7)", "slowest". Click a row to open a  **detail drawer** : question, expected answer, retrieved chunks (with the ground-truth chunk marked), generated answer with citations, judge scores, and the judge's reasoning text.
* **Diagnostic strip (differentiator):** a one-line auto-insight above the table, e.g. "34% of low-faithfulness answers had the ground-truth chunk retrieved, so this is a generation problem, not retrieval." Simple rule-based logic; it makes the product feel smart at almost no cost.
* Running state: live progress bar, results stream into the table as they complete, a cancel button.

#### 5.6 Compare (hero screen)

```
┌────────────────────────────────────────────────────────┐
│ Run A: gpt-4o · hybrid · k=5   vs   Run B: llama3 ·... │
├────────────────────────────────────────────────────────┤
│ Recall@k   0.82 → 0.91  ▲ +0.09                        │
│ Faith.     0.88 → 0.79  ▼ -0.09                        │
│ p95        1.9s → 0.8s  ▲ faster                       │
│ Cost       $0.42 → $0.00                               │
├────────────────────────────────────────────────────────┤
│ ☐ Only changed   Filter: regressions ▾                 │
│ Question            A       B       Δ                  │
│ ...                 0.9     0.4   ▼ -0.5               │
└────────────────────────────────────────────────────────┘
```

* **Config diff first:** highlight only the parameters that differ between A and B (like a git diff). This answers "what did I change?" immediately.
* Metric deltas with direction semantics: for latency and cost, "down" is green. Don't color by sign, color by meaning.
* Per-question table: paired scores and a delta bar (a small diverging bar centered on zero). Default sort by largest regression, because that's what people actually want to investigate.
* Row click opens a  **side-by-side drawer** : the two answers, two retrieved chunk sets, and judge reasoning for each.
* A  **distribution overlay chart** : two histograms of faithfulness scores overlaid. More informative than bar-per-metric.
* A "Copy as markdown" button for the summary. Useful for PRs and READMEs, and it makes people share your screenshots.
* Warn clearly if A and B used different test sets or judge models: "Scores aren't directly comparable."

#### 5.7 Settings → Providers & Models

* Provider list as rows, not cards: icon, name, base URL, status dot (connected / error / untested), models count, overflow menu.
* "Add provider" sheet: type select (OpenAI, Anthropic, Ollama, OpenAI-compatible), pre-filled base URL per type, API key field (password input, never re-displayed; show `••••sk-…a4f2` after saving), **Test connection** button with inline result and latency.
* Ollama-specific helper text: "Running in Docker? Use `http://host.docker.internal:11434`." This single line prevents the most common support issue.
* **Models tab:** three role selectors (Chat, Embedding, Judge), each a combobox of models grouped by provider. Warn if judge == chat model ("self-preference bias can inflate scores"). Warn if the embedding model changes ("requires re-indexing existing collections").

### 6. Core components

Build these once, reuse everywhere.

| Component         | Notes                                                                      |
| ----------------- | -------------------------------------------------------------------------- |
| `StatusPill`    | One component, variants for all job/doc/run states                         |
| `MetricValue`   | Mono, tabular, optional delta, optional direction semantics                |
| `DeltaBar`      | Diverging bar centered at zero, used in compare and tables                 |
| `CitationChip`  | Hover popover + click handler; accessible as a button                      |
| `ChunkView`     | Text with highlighted span, doc/page header, score                         |
| `ConfigTags`    | Compact summary of a pipeline config as chips                              |
| `ConfigDiff`    | Two configs, only differing keys highlighted                               |
| `DataTable`     | TanStack Table wrapper: sort, filter, virtualize, selection, sticky header |
| `Sheet`         | Right-side drawer for details; used for results, errors, new runs          |
| `EmptyState`    | Icon, title, one line, one or two actions; never blank                     |
| `JobIndicator`  | Top-bar popover aggregating running jobs                                   |
| `ModelCombobox` | Grouped by provider, searchable, shows capability badges                   |

### 7. States checklist (every screen)

* **Loading:** skeletons that match the final layout. No spinners over empty space, except for buttons.
* **Empty:** explains what goes here and offers the next action.
* **Error:** says what failed, in plain language, with Retry. Include a "Copy details" button that copies the request ID and error for bug reports.
* **Partial:** run in progress, ingestion in progress. Show what's available now.
* **Offline/API down:** a global banner, not a thousand failed toasts.
* **Destructive actions:** confirm dialogs that name the thing being deleted and what cascades ("Deletes 12 documents and 4,310 chunks").

Toasts are for confirmation of completed actions only (Sonner). Errors the user must act on live inline.

### 8. Keyboard and command palette

| Shortcut                  | Action                                |
| ------------------------- | ------------------------------------- |
| `⌘K`                   | Command palette                       |
| `G`then `C / E / S`   | Go to Collections / Evals / Settings  |
| `[`                     | Toggle sidebar                        |
| `/`                     | Focus chat composer or table search   |
| `Enter`/`Shift+Enter` | Send / newline                        |
| `Esc`                   | Cancel streaming, close sheet         |
| `J / K`                 | Next / previous row in results tables |
| `⌘↵`                  | Run (eval, test connection)           |

Palette contents: navigate to any collection or run, "New collection", "New eval run", "Switch theme", "Open settings", and recent items. Show shortcut hints right-aligned in each item.

Visible focus rings everywhere (2px accent ring, 2px offset). Never remove outlines without replacing them.

### 9. Accessibility

* Target WCAG AA contrast; verify the muted text token against both backgrounds.
* All interactive elements are real `button`/`a` elements; Radix handles focus trapping and ARIA for overlays.
* Streaming answers sit in an `aria-live="polite"` region, throttled so screen readers aren't flooded.
* Don't encode meaning by color alone: deltas get arrows and signs, statuses get icons.
* Charts get a "view as table" fallback or `aria-label` summaries.

### 10. Responsive

* Primary target: ≥1280px desktop. Secondary: 768-1279px tablet.
* Below 1024px: the sources panel becomes a bottom sheet; the sidebar collapses to icons.
* Below 768px: usable but not optimized. Compare and run detail show a "best viewed on desktop" note rather than a degraded layout.

### 11. Performance

* RSC for the shell and static pages; client components only for interactive regions.
* Virtualize any table that can exceed 100 rows.
* Memoize markdown blocks during streaming (see 5.3).
* Dynamic-import chart components and the markdown renderer.
* Prefetch on sidebar hover (`router.prefetch`).
* Target: LCP < 1.5s on the landing page, 60fps scrolling in results tables with 2,000 rows.

### 12. Code structure

```
frontend/
├── app/
│   ├── (app)/                  # authed shell layout
│   │   ├── collections/
│   │   ├── evals/
│   │   ├── compare/
│   │   └── settings/
│   ├── (marketing)/            # landing page, later
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn primitives
│   ├── domain/                 # CitationChip, ChunkView, ConfigDiff...
│   └── layout/                 # Sidebar, Topbar, CommandPalette
├── lib/
│   ├── api/                    # generated types + fetch client
│   ├── hooks/                  # useChatStream, useJobPolling...
│   ├── format.ts               # numbers, durations, cost
│   └── cn.ts
├── styles/tokens.css
└── tests/
```

**SSE hook, the one piece worth getting right**

ts

```ts
// lib/hooks/useChatStream.ts
export function useChatStream() {
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (body: ChatRequest, onEvent: (e: StreamEvent) => void) => {
    abortRef.current?.abort();
    const ctrl = (abortRef.current = new AbortController());

    const res = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok || !res.body) throw await toApiError(res);

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += value;
      const frames = buf.split("\n\n");
      buf = frames.pop() ?? "";
      for (const f of frames) onEvent(parseSSE(f)); // token | citations | usage | done | error
    }
  }, []);

  const cancel = useCallback(() => abortRef.current?.abort(), []);
  return { send, cancel };
}
```

Use `fetch` plus a stream reader rather than `EventSource`. `EventSource` can't POST or send auth headers.

Typed event kinds from the backend: `token`, `citations` (sent once, early or at the end), `usage`, `done`, `error`. Agree on this contract with the API before building the chat UI.

### 13. Landing page (post-MVP)

Sections: hero with a one-line pitch and a looping compare-view screen recording, "how it works" in 4 steps (Ingest → Ask → Evaluate → Compare), a feature grid of 6 items max, a supported providers strip, a `docker compose up` code block with a copy button, a GitHub star button, and a footer. Use real product screenshots, not illustrations. No testimonials, no fake logos, no pricing.

### 14. Build order

1. Tokens, shell, sidebar, theme, primitives (`StatusPill`, `DataTable`, `Sheet`, `EmptyState`)
2. Settings → Providers (unblocks everything else)
3. Collections + documents + upload + status polling
4. Chat with streaming, citation chips, sources panel
5. Evals hub + run detail
6. Compare view, command palette, keyboard shortcuts
7. States and a11y pass, then the README GIFs
8. Landing page

### 15. Definition of done (frontend)

* No screen has a blank or spinner-only state.
* Every primary flow is completable by keyboard.
* Lighthouse a11y ≥ 95 on main screens.
* Dark and light both reviewed, not just dark.
* 3 Playwright tests pass: add provider and ingest, chat with a citation click, run eval and open compare.
* Compare view screenshot is good enough to be the README header.
