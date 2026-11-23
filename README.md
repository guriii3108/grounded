<div align="center">

<img src="frontend/public/mascot/crew-hero-v2.webp" alt="Mochi, Wisp and Nova, the Grounded crew" width="640" />

# Grounded

### Every answer grounded. Every claim measured.

A self-hostable, provider-agnostic **RAG platform with built-in evaluation**.
Ingest documents, get cited answers, then prove the pipeline works with evals and A/B comparisons.

<br />

[![Status](https://img.shields.io/badge/status-MVP-F59E0B?style=for-the-badge)](#roadmap)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Postgres](https://img.shields.io/badge/pgvector-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Docker](https://img.shields.io/badge/docker_compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#quick-start)
[![License](https://img.shields.io/badge/license-MIT-8B5CF6?style=for-the-badge)](LICENSE)

[Quick start](#quick-start) · [Features](#features) · [How it works](#how-it-works) · [Providers](#providers) · [Metrics](#evaluation-metrics) · [Roadmap](#roadmap)

</div>

---

## Why Grounded

Teams ship RAG, it gives a wrong answer, and nobody knows whether the cause is chunking, embeddings, retrieval, or the model. They tune by vibes.

Grounded closes that loop. Ingestion, retrieval config, answering, and evaluation live in **one self-hostable tool**, so you can change one variable and see exactly what moved in quality, latency, and cost.

```mermaid
%%{init: {"theme": "base", "themeVariables": {
  "fontFamily": "ui-sans-serif, system-ui, sans-serif",
  "fontSize": "14px",
  "primaryColor": "#18181B",
  "primaryTextColor": "#FAFAFA",
  "primaryBorderColor": "#3F3F46",
  "lineColor": "#71717A",
  "background": "#09090B",
  "nodeBorder": "#3F3F46",
  "clusterBkg": "#18181B",
  "titleColor": "#FAFAFA",
  "edgeLabelBackground": "#18181B"
}}}%%
flowchart LR
    A([" 📄  Ingest "]):::step1
    B([" 💬  Ask "]):::step2
    C([" 📊  Evaluate "]):::step3
    D([" 🔧  Tune "]):::step4
    E([" ⚖️  Compare "]):::step5

    A --> B --> C --> D --> E
    E -. "iterate" .-> A

    classDef step1 fill:#1C1917,stroke:#D97706,stroke-width:2px,color:#FCD34D,rx:8
    classDef step2 fill:#1E1B4B,stroke:#6D28D9,stroke-width:2px,color:#C4B5FD,rx:8
    classDef step3 fill:#0C1A2E,stroke:#2563EB,stroke-width:2px,color:#93C5FD,rx:8
    classDef step4 fill:#1A1A1A,stroke:#52525B,stroke-width:2px,color:#A1A1AA,rx:8
    classDef step5 fill:#1A0F0A,stroke:#EA580C,stroke-width:2px,color:#FB923C,rx:8

    linkStyle default stroke:#3F3F46,stroke-width:2px
    linkStyle 4 stroke:#52525B,stroke-width:1.5px,stroke-dasharray:5
```

> [!NOTE]
> Tools like Ragas, Langfuse, Phoenix and LangSmith cover parts of this. Grounded keeps the pipeline and its measurement in one place, with a UI built for A/B-testing pipeline configurations.

<!-- Replace with a real screenshot or GIF of the compare view -->

<p align="center">
  <img src="docs/screenshots/compare.png" alt="A/B pipeline comparison" width="900" />
</p>

---

## Features

### Cited answers

- Streamed responses with inline citations (`[1]`, `[2]`) mapped to source document, page and snippet
- Hover a citation to preview the passage, click to open the source with the chunk highlighted
- The model is instructed to say *"not found in the documents"* instead of guessing
- Sources panel separates **cited** chunks from **retrieved but not cited** ones, which helps when debugging

### Retrieval you can tune

- Vector search (pgvector), keyword search (Postgres full-text), and **hybrid** via reciprocal rank fusion
- Configurable `top_k`, retrieval mode and score threshold
- Indexes are **immutable** and tied to a specific chunking and embedding model, so comparisons stay honest

### Built-in evaluation

- Generate a test set from your own documents, or import and edit cases manually
- Retrieval metrics: **Recall@k**, **MRR** (deterministic)
- Generation metrics: **Faithfulness**, **Answer relevance** (LLM-as-judge, with the judge's reasoning kept)
- Latency (p50 / p95) and token cost on every run
- A rule-based diagnostic on each run: did low-faithfulness answers have the right chunk retrieved (a generation problem) or not (a retrieval problem)?

### A/B comparison

- Compare two runs on the same test set: aggregate deltas plus per-question deltas
- Config diff shows only the parameters that changed
- Default sort by largest regression, with an "only changed" filter
- **Copy as Markdown** for pull requests and READMEs
- Warns when two runs used different test sets or judge models

### Any model, your keys

- OpenAI, Anthropic, Ollama, and any OpenAI-compatible endpoint (vLLM, Groq, OpenRouter, LM Studio, Together…)
- Separate model roles for **chat**, **embeddings** and **judge**
- API keys encrypted at rest and never returned to the browser
- Warns when the judge and generator share a model family (self-preference bias)

### A product-grade UI

- Command palette (`⌘K`), keyboard shortcuts, dark and light themes
- Real loading, empty and error states
- A job indicator for running ingestion and eval jobs

---

## Screenshots

| Collections                                                          | Evaluation run                                                     |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `<img src="docs/screenshots/collections.png" alt="Collections" />` | `<img src="docs/screenshots/run-detail.png" alt="Run detail" />` |

| Providers and models                                                       | Command palette                                                              |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `<img src="docs/screenshots/settings.png" alt="Providers and models" />` | `<img src="docs/screenshots/command-palette.png" alt="Command palette" />` |

---

## How it works

```mermaid
%%{init: {"theme": "base", "themeVariables": {
  "fontFamily": "ui-sans-serif, system-ui, sans-serif",
  "fontSize": "13px",
  "primaryColor": "#18181B",
  "primaryTextColor": "#FAFAFA",
  "primaryBorderColor": "#3F3F46",
  "lineColor": "#52525B",
  "background": "#09090B",
  "edgeLabelBackground": "#18181B"
}}}%%
flowchart LR
    subgraph CLIENT["  🖥️  Client  "]
        UI["Next.js UI\nReact · Tailwind"]:::client
    end

    subgraph SERVER["  ⚙️  Server  "]
        direction TB
        API["FastAPI\nREST + SSE"]:::server
        Q[("Redis\njob queue")]:::server
        W["Worker\ningest · evals"]:::server
        API --> Q --> W
    end

    subgraph DATA["  🗄️  Data  "]
        PG[("PostgreSQL\npgvector · FTS")]:::data
    end

    subgraph MODELS["  🤖  Models  "]
        direction TB
        OAI["OpenAI-compatible\nOpenAI · Ollama · vLLM · Groq"]:::model
        ANT["Anthropic"]:::model
    end

    UI <--> API
    API --> PG
    W --> PG
    API --> OAI & ANT
    W --> OAI & ANT

    classDef client fill:#1E1B4B,stroke:#6D28D9,stroke-width:2px,color:#C4B5FD
    classDef server fill:#1C1917,stroke:#D97706,stroke-width:2px,color:#FCD34D
    classDef data fill:#0C1A2E,stroke:#2563EB,stroke-width:2px,color:#93C5FD
    classDef model fill:#14532D,stroke:#15803D,stroke-width:2px,color:#86EFAC

    style CLIENT fill:#0F0F14,stroke:#3F3F46,stroke-width:1px,color:#A1A1AA
    style SERVER fill:#0F0F14,stroke:#3F3F46,stroke-width:1px,color:#A1A1AA
    style DATA fill:#0F0F14,stroke:#3F3F46,stroke-width:1px,color:#A1A1AA
    style MODELS fill:#0F0F14,stroke:#3F3F46,stroke-width:1px,color:#A1A1AA

    linkStyle default stroke:#3F3F46,stroke-width:1.5px
```

| Step               | What happens                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Ingest**   | Upload PDF, DOCX, Markdown or text. Documents are parsed, chunked and embedded in the background, with visible status per document. |
| **Retrieve** | Vector and keyword results are fused with reciprocal rank fusion, then the top-k chunks go to the model.                            |
| **Answer**   | The response streams over SSE with citations mapped back to chunks.                                                                 |
| **Evaluate** | A test set runs through a saved pipeline config. Retrieval is scored deterministically and generation is scored by a judge model.   |
| **Compare**  | Pick two runs and see exactly which parameters changed and which questions improved or regressed.                                   |

### Design decisions

- **One datastore.** Postgres with pgvector handles relational data, vectors and keyword search, so there are fewer moving parts to run.
- **A thin provider layer, not a framework.** Two adapters cover everything: an OpenAI-compatible client and a native Anthropic client, behind one small interface (`chat_stream`, `embed`, `list_models`).
- **Immutable indexes and configs.** Changing chunk size or the embedding model creates a new index. Configs are locked once used in a run.
- **Async jobs.** Ingestion and evals run in a worker and never block the API.

---

## Quick start

**Requirements:** Docker and Docker Compose.

```bash
git clone https://github.com/guriii3108/grounded.git
cd grounded

cp .env.example .env      # add your own secrets
docker compose up -d
```

Open the app, go to **Settings → Providers**, add a provider, and create your first collection.

> [!TIP]
> **Using Ollama?** From inside Docker, `localhost` points at the container, not your machine.
> Use `http://host.docker.internal:11434` as the Ollama base URL, or run Ollama in the same compose network.

### Environment

Provider API keys are added from the UI and stored encrypted, using a key from your environment.

| Variable           | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `DATABASE_URL`   | Postgres connection string                           |
| `REDIS_URL`      | Redis connection string                              |
| `ENCRYPTION_KEY` | Fernet key used to encrypt provider API keys at rest |
| `ADMIN_PASSWORD` | Single-admin access to the app                       |

<!-- Keep this table in sync with .env.example -->

---

## Providers

| Provider                             | Chat | Embeddings | Notes                           |
| ------------------------------------ | :--: | :--------: | ------------------------------- |
| OpenAI                               |  ✅  |     ✅     | Native OpenAI-compatible client |
| Anthropic                            |  ✅  |    n/a    | Native adapter                  |
| Ollama                               |  ✅  |     ✅     | Local models, no key needed     |
| vLLM / Groq / OpenRouter / LM Studio |  ✅  |   varies   | Any OpenAI-compatible endpoint  |

Each provider has a **Test connection** button. Models are listed from the provider where supported, with manual entry as a fallback.

---

## Evaluation metrics

| Metric                        | Type             | What it tells you                                                |
| ----------------------------- | ---------------- | ---------------------------------------------------------------- |
| **Recall@k**            | 🟩 Deterministic | Was the ground-truth chunk in the top-k retrieved?               |
| **MRR**                 | 🟩 Deterministic | How high did the right chunk rank?                               |
| **Faithfulness**        | 🟪 LLM-as-judge  | Is every claim in the answer supported by the retrieved context? |
| **Answer relevance**    | 🟪 LLM-as-judge  | Does the answer actually address the question?                   |
| **Latency (p50 / p95)** | 🟨 Measured      | How fast is the full pipeline?                                   |
| **Cost**                | 🟨 Measured      | Token spend per run                                              |

> [!WARNING]
> **Judge scores are judge-relative.** LLM-as-judge is noisy. Grounded runs the judge at temperature 0 with a fixed rubric and keeps its reasoning visible. Use scores to compare configurations against each other, not as absolute truth, and prefer a judge that is not the generator model.

### Benchmarks

<!-- Fill this in after running on a public QA dataset. Do not publish numbers you haven't measured. -->

| Config          | Recall@5 | Faithfulness | p95 latency | Cost |
| --------------- | -------- | ------------ | ----------- | ---- |
| _to be added_ | –       | –           | –          | –   |

---

## Tech stack

| Layer      | Choice                                         |
| ---------- | ---------------------------------------------- |
| Frontend   | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend    | FastAPI, Pydantic                              |
| Jobs       | Redis + background worker                      |
| Database   | PostgreSQL with pgvector and full-text search  |
| Deployment | Docker Compose                                 |

---

## Meet the crew

<table>
  <tr>
    <td align="center" width="33%">
      <img src="frontend/public/mascot/mochi-idle.webp" width="120" alt="Mochi" /><br />
      <strong>Mochi</strong><br />
      <sub>Ingestion and collections</sub>
    </td>
    <td align="center" width="33%">
      <img src="frontend/public/mascot/wisp-idle.webp" width="120" alt="Wisp" /><br />
      <strong>Wisp</strong><br />
      <sub>Chat and retrieval</sub>
    </td>
    <td align="center" width="33%">
      <img src="frontend/public/mascot/nova-idle.webp" width="120" alt="Nova" /><br />
      <strong>Nova</strong><br />
      <sub>Evaluation and judging</sub>
    </td>
  </tr>
</table>

---

## Roadmap

**MVP (current)**

- [X] Multi-format ingestion with async status
- [X] Hybrid retrieval with citations
- [X] Provider and model configuration
- [X] Eval harness, run detail and A/B compare

**Next**

- [ ] Reranker as another A/B variable
- [ ] Recursive and semantic chunking, parent-document retrieval
- [ ] Query rewriting / HyDE toggles
- [ ] Cost-vs-quality chart
- [ ] CI eval gate: a GitHub Action that fails a PR if recall or faithfulness regresses
- [ ] Per-query tracing view (retrieval → prompt → response, with timings)
- [ ] Multi-user auth and workspaces
- [ ] Alternative vector backends behind an interface

---

## Limitations

- Single-admin auth only. There is no multi-tenant isolation yet.
- Single-node deployment, with no horizontal scaling.
- Text-based documents only. No image, audio or OCR ingestion yet.
- Changing chunking or the embedding model requires re-indexing.
- Judge-based metrics are judge-relative (see above).

---

## Contributing

Issues and pull requests are welcome. For larger changes, open an issue first so we can discuss the approach.

```bash
# run checks before opening a PR
# backend:  ruff, mypy, pytest
# frontend: lint, type-check, build
```

---

## License

MIT. See [LICENSE](LICENSE).

<div align="center">
<sub>Built by <a href="https://github.com/guriii3108">Gurveer Singh</a> · Every answer grounded.</sub>
</div>
