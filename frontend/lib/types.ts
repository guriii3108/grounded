export type DocumentStatus = "queued" | "processing" | "ready" | "failed";
export type RetrievalMode = "hybrid" | "vector" | "keyword";
export type ProviderType = "openai" | "anthropic" | "ollama" | "openai-compatible";
export type ProviderStatus = "connected" | "error" | "untested";
export type EvalRunStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface DocumentItem {
  id: string;
  name: string;
  type: "pdf" | "docx" | "md" | "txt" | "url";
  sizeBytes: number;
  pages: number;
  chunksCount: number;
  status: DocumentStatus;
  progressPercent?: number;
  errorMessage?: string;
  addedAt: string;
}

export interface CollectionIndex {
  id: string;
  name: string;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  dimension: number;
  docCount: number;
  chunkCount: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  documentsCount: number;
  chunksCount: number;
  lastIndexedAt: string;
  activeEmbeddingModel: string;
  indexes: CollectionIndex[];
  documents: DocumentItem[];
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  baseUrl: string;
  apiKeyMasked: string;
  status: ProviderStatus;
  latencyMs?: number;
  modelsCount: number;
  models: {
    id: string;
    name: string;
    capabilities: ("chat" | "embedding" | "judge")[];
    contextWindow?: number;
  }[];
}

export interface PipelineConfig {
  id: string;
  name: string;
  chunk_size: number;
  chunk_overlap: number;
  embedding_model: string;
  retrieval_mode: RetrievalMode;
  top_k: number;
  score_threshold: number;
  chat_model: string;
  temperature: number;
  system_prompt_template: string;
}

export interface RetrievedChunk {
  id: string;
  docName: string;
  page: number;
  text: string;
  score: number;
  retrievalType: "vector" | "keyword" | "hybrid";
  isGroundTruth?: boolean;
  isCited?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: number[];
  latencyMs?: number;
  tokens?: number;
  retrievedChunks?: RetrievedChunk[];
  isNotFound?: boolean;
  createdAt: string;
}

export interface TestCase {
  id: string;
  question: string;
  expectedAnswer: string;
  sourceChunkId: string;
  docName: string;
  page: number;
  snippet: string;
}

export interface TestSet {
  id: string;
  name: string;
  collectionId: string;
  collectionName: string;
  source: "generated" | "imported" | "manual";
  caseCount: number;
  createdAt: string;
  cases: TestCase[];
}

export interface EvalResult {
  id: string;
  questionId: string;
  question: string;
  expectedAnswer: string;
  retrievedHit: boolean;
  faithfulness: number;
  relevance: number;
  latencyMs: number;
  generatedAnswer: string;
  citations: number[];
  retrievedChunks: RetrievedChunk[];
  judgeReasoning: string;
}

export interface EvalRun {
  id: string;
  name: string;
  collectionId: string;
  collectionName: string;
  testSetId: string;
  testSetName: string;
  config: PipelineConfig;
  judgeModel: string;
  status: EvalRunStatus;
  progressPercent?: number;
  recallAtK: number;
  mrr: number;
  faithfulness: number;
  answerRelevance: number;
  p95LatencyMs: number;
  tokenCostUsd: number;
  startedAt: string;
  completedAt?: string;
  results: EvalResult[];
}

export interface BackgroundJob {
  id: string;
  type: "ingestion" | "eval";
  title: string;
  target: string;
  progress: number;
  status: "running" | "completed" | "failed";
  startedAt: string;
}
