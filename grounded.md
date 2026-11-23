Grounded: MVP Requirements (v0.1)

1. Overview

Grounded is a self-hostable, provider-agnostic RAG platform with built-in evaluation. Users ingest documents, ask questions with cited answers, generate test sets, score pipeline quality, and compare configurations side by side.

One-line pitch: Every answer grounded, every claim measured.

Core loop: Ingest → Ask → Evaluate → Change one variable → Compare.

2. Goals and non-goals

Goals

Working end-to-end RAG pipeline on arbitrary documents
Pluggable LLM and embedding providers, configured from the UI
Repeatable evals with numeric scores
A/B comparison of two pipeline configs
docker compose up and it runs
Frontend that looks like a product, not a template

Non-goals (MVP)

Multi-tenant auth, teams, billing
Training or fine-tuning models
Agents and tool use
Multimodal ingestion (images, audio)
Horizontal scaling
3. Users
Devs benchmarking a RAG pipeline before shipping
Small teams with no ML platform
Recruiters and engineers evaluating your portfolio (design for this one deliberately)
4. Functional requirements
4.1 Ingestion
ID	Requirement
F1	Upload PDF, DOCX, MD, TXT; add a URL
F2	Parse into text with page/section metadata preserved
F3	Chunk with configurable strategy: fixed-size with overlap (MVP), recursive/semantic later
F4	Embed chunks using the collection's configured embedding provider
F5	Ingestion runs async with visible status (queued, processing, ready, failed) and error messages
F6	Documents are grouped into collections; delete document or collection cascades cleanly
4.2 Retrieval
ID	Requirement
F7	Vector search (pgvector)
F8	Keyword search (Postgres full-text)
F9	Hybrid mode via reciprocal rank fusion
F10	Configurable top_k, retrieval mode, score threshold
4.3 Answering
ID	Requirement
F11	Streamed answers (SSE)
F12	Answers cite chunks inline, e.g. [1], mapped to source doc, page, and snippet
F13	Model instructed to say "not found in the documents" rather than guess
F14	Conversation history persisted per collection
4.4 Provider and model configuration
ID	Requirement
F15	Settings page to add providers: OpenAI, Anthropic, Ollama, any OpenAI-compatible endpoint (covers vLLM, Groq, OpenRouter, Together, LM Studio)
F16	Per provider: name, base URL, API key (optional for local), "Test connection" button
F17	Model list fetched from the provider where supported, with manual entry as a fallback
F18	Separate selection for chat model, embedding model, and judge model
F19	API keys encrypted at rest, never returned to the frontend after saving
4.5 Evaluation
ID	Requirement
F20	Test set generation: LLM generates Q/A pairs from sampled chunks, each tagged with its source chunk ID as ground truth
F21	Manual add/edit/delete of test cases; import from CSV/JSON
F22	Eval run = (collection, pipeline config, test set)
F23	Metrics: Recall@k and MRR (retrieval, deterministic), Faithfulness and Answer relevance (LLM-as-judge), plus latency (p50/p95) and token cost
F24	Per-question results with retrieved chunks, generated answer, judge scores, and judge reasoning
F25	Runs execute async with progress; cancellable
4.6 Comparison
ID	Requirement
F26	Compare two runs on the same test set: aggregate deltas plus per-question deltas
F27	Highlight regressions and improvements; filter to "only changed"
5. Pipeline config (the variables you A/B)
yaml
chunk_size: 512
chunk_overlap: 64
embedding_model: provider/model
retrieval_mode: hybrid | vector | keyword
top_k: 5
score_threshold: 0.0
chat_model: provider/model
temperature: 0.1
system_prompt_template: default

Configs are saved, versioned, and immutable once used in a run. Without immutability, comparisons are meaningless.

Gotcha: changing chunk size or embedding model requires re-indexing. Model this as an index tied to (collection, chunking, embedding), and let a run reference an index plus query-time params. Decide this now, because retrofitting it hurts.

6. Architecture
   Next.js (App Router, TS, Tailwind, shadcn/ui)
   │ REST + SSE
   FastAPI ──── Redis ──── Worker (arq): ingestion, eval runs
   │
   Postgres (pgvector + tsvector)
   │
   Provider adapters ──► OpenAI-compatible │ Anthropic

Opinionated choices

Postgres + pgvector for everything. One datastore for relational, vector, and keyword search. Skip Qdrant/Chroma in the MVP; fewer moving parts matters more than marginal vector perf at this scale.
Own thin provider adapter, not LangChain. Two implementations cover everything: an OpenAI-compatible client (OpenAI, Ollama, vLLM, Groq, OpenRouter) and a native Anthropic client. A thin interface (chat_stream, embed, list_models) is about 200 lines, easy to test, and a better portfolio signal than "I used a framework." LiteLLM is a fine alternative if you want speed, but it hides behavior you'll want to control.
arq or RQ for jobs. Ingestion and evals must not block the API.
Pydantic everywhere, ruff + mypy strict, pytest.
7. Data model (core tables)

collections, documents, indexes (collection + chunking + embedding model + dim), chunks (text, metadata, embedding vector, tsv), providers (encrypted key), pipeline_configs, conversations, messages (with cited chunk IDs), test_sets, test_cases, eval_runs, eval_results.

Store the embedding dimension on the index. Providers differ (768, 1024, 1536, 3072), and mixing dimensions in one column breaks.

8. Frontend requirements

Pages

Collections (list, create, empty state)
Collection detail (document table, upload dropzone, ingestion status)
Chat (streaming, citation chips, source panel, config popover)
Evals (test sets, runs list)
Run detail (metric cards, per-question table, drill-in)
Compare (two-run diff, your hero screenshot)
Settings → Providers & Models

Design bar

Dark mode first, light mode supported; one accent color; Geist or Inter
Linear/Vercel-style density: subtle borders, tight spacing, no card-in-card, no gradient soup
⌘K command palette, keyboard shortcuts, visible focus states
Skeletons, real empty states, real error states with retry
Citation chips: hover for snippet, click to open the source with the chunk highlighted
Motion via Framer Motion, restrained (150-200ms, no bounce)
Responsive down to tablet; mobile is not a priority

Stack: Next.js, TypeScript, Tailwind, shadcn/ui + Radix, TanStack Query, Recharts, Framer Motion.

Auth: single admin password or API key from env. Nothing more.

9. Non-functional requirements
   docker compose up brings up the full stack; .env.example provided
   No secrets in the repo; keys encrypted with a Fernet key from env
   Ingest a 50-page PDF in under 60s on a normal API embedding provider
   Retrieval p95 under 300ms on 50k chunks
   Structured logging; request IDs
   CI (GitHub Actions): lint, type-check, tests, frontend build
   Test coverage focus: chunking, RRF fusion, metric calculations, provider adapters (mocked)
10. Milestones (~4 weeks, part-time)
    Week	Deliverable
    1	Schema, ingestion pipeline, chunking, embeddings, provider adapters + settings API
    2	Hybrid retrieval, streaming answers with citations, minimal chat UI
    3	Eval engine (CLI first), test set generation, metrics, run storage
    4	Eval UI + compare view, polish pass, Docker, CI, README with benchmarks, deploy demo

Landing page comes after week 4.

11. Definition of done
    Fresh clone to running app in one command and under 5 minutes
    Works with at least OpenAI, Anthropic, and Ollama, verified
    README includes the architecture diagram, a GIF of the compare view, a benchmark table on a public dataset (e.g. a subset of a public QA corpus), and a "design decisions and limitations" section
    Live demo link
12. Post-MVP enhancements (priority order)
    Reranker (local bge-reranker or Cohere) as another A/B variable
    Better chunking: recursive, semantic, parent-document retrieval
    Query rewriting / HyDE toggles
    Model cost table and a cost-vs-quality scatter chart
    CI eval gate: a GitHub Action that fails a PR if recall or faithfulness regresses. This is a standout feature.
    Embedding model comparison across providers in one run
    Tracing view per query (retrieval → prompt → response, with timings)
    Multi-user auth and workspaces
    Other vector backends (Qdrant) behind an interface
13. Gotchas worth knowing now
    Ollama in Docker: the backend container can't see localhost:11434 on your host. Use host.docker.internal or put Ollama in the compose file. Document it, because it's the first thing users hit.
    Hosted demo can't use local Ollama. Run the demo with a rate-limited key of yours, or make visitors bring their own key.
    LLM-as-judge is noisy. Use temperature 0, a fixed rubric, and the strongest judge you can afford. Report that eval scores are judge-relative. That honesty reads as seniority.
    Don't let the judge be the same model as the generator if you can avoid it, since self-preference bias skews scores.
