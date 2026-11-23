"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../../lib/store/app-context";
import { CitationChip } from "../../../../components/domain/citation-chip";
import { ChunkView } from "../../../../components/domain/chunk-view";
import { ConfigTags } from "../../../../components/domain/config-tags";
import { ChatMessage, RetrievedChunk, PipelineConfig } from "../../../../lib/types";
import { formatDuration } from "../../../../lib/format";
import {
  Send,
  Square,
  Settings,
  PanelRightClose,
  PanelRightOpen,
  Copy,
  Check,
  Search,
  ArrowLeft,
  X,
  FileText,
  BookmarkPlus,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import { Mascot } from "../../../../components/ui/mascot";

function GroundedChatContent() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;
  const { collections, savePipelineConfig } = useApp();

  const collection = collections.find((c) => c.id === collectionId);

  // Active chat config
  const [activeConfig, setActiveConfig] = useState<PipelineConfig>({
    id: "cfg-current",
    name: "Chat Runtime Config",
    chunk_size: 512,
    chunk_overlap: 64,
    embedding_model: collection?.activeEmbeddingModel || "openai/text-embedding-3-small",
    retrieval_mode: "hybrid",
    top_k: 5,
    score_threshold: 0.15,
    chat_model: "openai/gpt-4o",
    temperature: 0.1,
    system_prompt_template: "Grounded-Strict-v1",
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [sourcesPanelOpen, setSourcesPanelOpen] = useState(true);
  const [retrievalDrawerChunk, setRetrievalDrawerChunk] = useState<ChatMessage | null>(null);
  const [highlightedChunkId, setHighlightedChunkId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Welcome to Grounded. Ask any question regarding the documents in this collection. Every claim in the answer is verified and cited with source chunk anchors.",
      citations: [],
      createdAt: "2026-03-20T10:00:00Z",
    },
    {
      id: "msg-sample-user",
      role: "user",
      content: "What were Apple's total net sales for Services in fiscal 2025, and how did they compare to 2024?",
      createdAt: "2026-03-20T10:01:00Z",
    },
    {
      id: "msg-sample-assistant",
      role: "assistant",
      content:
        "According to Apple's FY2025 Form 10-K, Services net sales reached $96,169 million in fiscal 2025 [1]. This represents an increase of approximately 13% compared to $85,200 million recorded in fiscal 2024 [1]. The growth was driven primarily by gains in advertising, cloud services, and the App Store [1]. Products net sales, by comparison, were $298,085 million [2].",
      citations: [1, 2],
      latencyMs: 1420,
      tokens: 382,
      createdAt: "2026-03-20T10:01:15Z",
      retrievedChunks: [
        {
          id: "chk-aapl-svc",
          docName: "Apple_FY2025_Form_10K.pdf",
          page: 34,
          text: "Services net sales were $96,169 million in 2025, an increase of 13% compared to $85,200 million in 2024, driven primarily by growth in advertising, cloud services and the App Store.",
          score: 0.94,
          retrievalType: "hybrid",
          isCited: true,
          isGroundTruth: true,
        },
        {
          id: "chk-aapl-prod",
          docName: "Apple_FY2025_Form_10K.pdf",
          page: 33,
          text: "Products net sales were $298,085 million in 2025 compared to $298,085 million in 2024, reflecting steady iPhone unit demand.",
          score: 0.72,
          retrievalType: "vector",
          isCited: true,
          isGroundTruth: false,
        },
        {
          id: "chk-aapl-margin",
          docName: "Apple_FY2025_Form_10K.pdf",
          page: 36,
          text: "Services gross margin was 74.0% in 2025, compared to 73.8% in 2024, driven by higher services mix and favorable foreign exchange hedging.",
          score: 0.65,
          retrievalType: "keyword",
          isCited: false,
        },
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active selected message for sources panel (defaults to last assistant message)
  const assistantMessages = messages.filter((m) => m.role === "assistant" && m.retrievedChunks);
  const [selectedMessageId, setSelectedMessageId] = useState<string>(
    assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1].id : ""
  );

  const activeMessage = messages.find((m) => m.id === selectedMessageId) || assistantMessages[assistantMessages.length - 1];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Handle send
  const handleSend = () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `msg-usr-${Date.now()}`,
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    const assistantMsgId = `msg-ast-${Date.now()}`;
    setSelectedMessageId(assistantMsgId);

    // Mock realistic retrieval and answers based on user question
    const isNotFoundQuery = userMsg.content.toLowerCase().includes("tesla") || userMsg.content.toLowerCase().includes("spacex");

    const retrievedChunks: RetrievedChunk[] = isNotFoundQuery
      ? [
          {
            id: "chk-notfound-1",
            docName: "Apple_FY2025_Form_10K.pdf",
            page: 12,
            text: "General competitive environment across consumer electronics, wearables, and enterprise mobility software.",
            score: 0.31,
            retrievalType: "vector",
            isCited: false,
          },
        ]
      : [
          {
            id: `chk-res-${Date.now()}-1`,
            docName: "Microsoft_FY2025_Annual_Report.pdf",
            page: 48,
            text: "Our ability to meet rising demand for AI infrastructure depends on specialized third-party silicon and high-bandwidth memory suppliers. Single-source fabricators represent primary operational risks.",
            score: 0.92,
            retrievalType: activeConfig.retrieval_mode,
            isCited: true,
            isGroundTruth: true,
          },
          {
            id: `chk-res-${Date.now()}-2`,
            docName: "Microsoft_FY2025_Annual_Report.pdf",
            page: 52,
            text: "Capital expenditures for property, plant, and equipment including assets acquired under finance leases totaled $55.7 billion, compared to $44.5 billion in fiscal 2024.",
            score: 0.84,
            retrievalType: "vector",
            isCited: true,
          },
          {
            id: `chk-res-${Date.now()}-3`,
            docName: "Amazon_Q4_Shareholder_Letter.md",
            page: 4,
            text: "AWS annualized revenue run rate surpassed $105 billion, with continued customer acceleration into Bedrock and Trainium clusters.",
            score: 0.58,
            retrievalType: "keyword",
            isCited: false,
          },
        ];

    const fullResponse = isNotFoundQuery
      ? "Not found in the documents. None of the ingested filings in this collection mention Tesla or SpaceX operations or financial metrics."
      : `Based on the ingested annual reports, Microsoft noted that its cloud AI scaling depends critically upon specialized third-party silicon and high-bandwidth memory suppliers [1]. Wafer backlogs and packaging constraints represent key margin risks [1]. Furthermore, capital expenditures for cloud PP&E rose to $55.7 billion in fiscal 2025 [2].`;

    // Stream tokens
    const tokens = fullResponse.split(" ");
    let tokenIdx = 0;

    const streamInterval = setInterval(() => {
      tokenIdx += 2;
      const currentText = tokens.slice(0, tokenIdx).join(" ");

      setMessages((prev) => {
        const existing = prev.find((m) => m.id === assistantMsgId);
        if (existing) {
          return prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: currentText } : m
          );
        } else {
          return [
            ...prev,
            {
              id: assistantMsgId,
              role: "assistant",
              content: currentText,
              citations: isNotFoundQuery ? [] : [1, 2],
              latencyMs: 1180,
              tokens: 284,
              retrievedChunks,
              isNotFound: isNotFoundQuery,
              createdAt: new Date().toISOString(),
            },
          ];
        }
      });

      if (tokenIdx >= tokens.length) {
        clearInterval(streamInterval);
        setIsStreaming(false);
      }
    }, 45);
  };

  const cancelStreaming = () => {
    setIsStreaming(false);
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render markdown text with interactive citation chips
  const renderMessageContent = (text: string, chunks?: RetrievedChunk[]) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const citationNum = parseInt(match[1], 10);
        const chunk = chunks && chunks[citationNum - 1];
        return (
          <CitationChip
            key={i}
            index={citationNum}
            chunk={chunk}
            onClick={() => {
              if (chunk) {
                setHighlightedChunkId(chunk.id);
                setSourcesPanelOpen(true);
              }
            }}
          />
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex h-[calc(100vh-3.25rem)] w-full overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      {/* Left/Main: Conversation Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full border-r border-[var(--border)] relative">
        {/* Header Strip with Collection Context & Runtime Config */}
        <div className="h-11 px-4 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => router.push(`/collections/${collectionId}`)}
              className="p-1 rounded text-[var(--subtle)] hover:text-[var(--fg)] cursor-pointer"
              title="Back to Collection"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-[var(--fg)] truncate">
              {collection?.name || "Collection"}
            </span>
            <span className="text-[var(--subtle)]">•</span>
            <ConfigTags config={activeConfig} />
          </div>

          <div className="flex items-center gap-2">
            {/* Config Popover Button */}
            <button
              type="button"
              onClick={() => setIsConfigOpen((p) => !p)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer",
                isConfigOpen
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-[var(--surface)] text-[var(--fg)] border-[var(--border)] hover:bg-[var(--surface-2)]"
              )}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pipeline Config</span>
            </button>

            {/* Toggle Sources Panel */}
            <button
              type="button"
              onClick={() => setSourcesPanelOpen((p) => !p)}
              title={sourcesPanelOpen ? "Collapse Sources" : "Expand Sources"}
              className="p-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--subtle)] hover:text-[var(--fg)] cursor-pointer"
            >
              {sourcesPanelOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Config Flyout / Popover */}
        {isConfigOpen && (
          <div className="absolute top-12 left-4 right-4 sm:left-auto sm:right-16 sm:w-96 p-4 rounded-xl bg-[var(--surface)] border border-[var(--line-strong)] shadow-2xl z-30 text-xs space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--fg)]">
                Pipeline Query Configuration
              </span>
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-[var(--subtle)] font-medium mb-1">
                Chat Model
              </label>
              <select
                value={activeConfig.chat_model}
                onChange={(e) =>
                  setActiveConfig((prev) => ({ ...prev, chat_model: e.target.value }))
                }
                className="w-full px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)]"
              >
                <option value="openai/gpt-4o">OpenAI · GPT-4o (Omni)</option>
                <option value="openai/gpt-4o-mini">OpenAI · GPT-4o Mini</option>
                <option value="anthropic/claude-3-7-sonnet">Anthropic · Claude 3.7 Sonnet</option>
                <option value="anthropic/claude-3-5-haiku">Anthropic · Claude 3.5 Haiku</option>
                <option value="ollama/llama3.3:70b">Ollama · Llama 3.3 (70B)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[var(--subtle)] font-medium mb-1">
                  Retrieval Mode
                </label>
                <select
                  value={activeConfig.retrieval_mode}
                  onChange={(e) =>
                    setActiveConfig((prev) => ({
                      ...prev,
                      retrieval_mode: e.target.value as PipelineConfig["retrieval_mode"],
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                >
                  <option value="hybrid">Hybrid (RRF)</option>
                  <option value="vector">Vector Only</option>
                  <option value="keyword">Keyword (tsvector)</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--subtle)] font-medium mb-1">
                  Top-K Chunks
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={activeConfig.top_k}
                  onChange={(e) =>
                    setActiveConfig((prev) => ({
                      ...prev,
                      top_k: parseInt(e.target.value, 10) || 5,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg)] text-xs text-[var(--fg)] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <span className="text-[10px] text-[var(--subtle)]">
                Bridge from Chat to Eval benchmark
              </span>
              <button
                type="button"
                onClick={() => {
                  savePipelineConfig({
                    ...activeConfig,
                    name: `Config ${activeConfig.chat_model.split("/")[1]}-${activeConfig.retrieval_mode}-k${activeConfig.top_k}`,
                  });
                  setIsConfigOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--accent)] text-white text-[11px] font-medium cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Save as Pipeline Config</span>
              </button>
            </div>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => {
                if (msg.role === "assistant" && msg.retrievedChunks) {
                  setSelectedMessageId(msg.id);
                }
              }}
              className={cn(
                "group flex flex-col max-w-3xl",
                msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              {/* Message Bubble */}
              <div
                className={cn(
                  "p-4 rounded-[14px] transition-all",
                  msg.role === "user"
                    ? "bg-[var(--ink)] text-[var(--surface)] rounded-br-xs max-w-xl text-sm leading-relaxed"
                    : msg.isNotFound
                    ? "bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)] max-w-2xl text-base leading-[1.7] italic"
                    : "bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] shadow-xs max-w-2xl text-base leading-[1.7]"
                )}
              >
                {msg.role === "assistant"
                  ? renderMessageContent(msg.content, msg.retrievedChunks)
                  : msg.content}

                {/* Not found explanation badge */}
                {msg.isNotFound && (
                  <div className="mt-3 pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs not-italic">
                    <span className="text-[var(--subtle)]">
                      Model instructed not to guess hallucinated facts.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMessageId(msg.id);
                        setSourcesPanelOpen(true);
                      }}
                      className="text-[var(--accent)] underline hover:text-[var(--accent-hover)] font-medium cursor-pointer"
                    >
                      Show what was retrieved
                    </button>
                  </div>
                )}
              </div>

              {/* Message Footer (Hoverable action bar) */}
              {msg.role === "assistant" && (
                <div className="flex items-center gap-3 mt-1.5 px-1 text-[11px] text-[var(--subtle)] font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                  {msg.latencyMs && <span>{formatDuration(msg.latencyMs)}</span>}
                  {msg.tokens && (
                    <>
                      <span>•</span>
                      <span>{msg.tokens} tokens</span>
                    </>
                  )}
                  {msg.retrievedChunks && (
                    <>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setRetrievalDrawerChunk(msg)}
                        className="text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Search className="w-3 h-3" />
                        <span>Inspect retrieval</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => copyMessage(msg.content, msg.id)}
                    className="p-1 hover:text-[var(--fg)] rounded cursor-pointer ml-auto"
                    title="Copy Answer"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-[var(--positive)]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
          {isStreaming && (
            <div className="flex items-center gap-2.5 px-2 py-1 text-xs text-[var(--muted)]">
              <Mascot name="retriever" pose="thinking" size={64} />
              <span className="text-xs font-medium text-[var(--muted)] animate-pulse">Retrieving grounding chunks and synthesizing claims…</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer Bar */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-2)]/60">
          <div className="max-w-3xl mx-auto flex items-end gap-2 p-2 rounded-[14px] border border-[var(--line-strong)] bg-[var(--surface)] focus-within:border-[var(--accent)] shadow-xs transition-colors">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              placeholder="Ask a question grounded in this collection… (Enter sends, Shift+Enter for newline)"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 max-h-32 bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--subtle)] resize-none outline-none p-2"
            />

            {isStreaming ? (
              <button
                type="button"
                onClick={cancelStreaming}
                className="p-2.5 rounded-full bg-[var(--negative)] text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className={cn(
                  "p-2.5 rounded-full transition-all cursor-pointer shrink-0",
                  input.trim()
                    ? "bg-[var(--ink)] text-[var(--surface)] hover:opacity-90"
                    : "bg-[var(--line-strong)] text-[var(--subtle)] cursor-not-allowed"
                )}
                title="Send message (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: Sources Panel */}
      {sourcesPanelOpen && (
        <aside className="w-80 sm:w-96 border-l border-[var(--border)] bg-[var(--surface-2)] flex flex-col h-full shrink-0 select-none animate-in slide-in-from-right-4 duration-200">
          <div className="h-11 px-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent)]" />
              <span className="font-semibold text-xs text-[var(--fg)]">
                Retrieved Sources
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSourcesPanelOpen(false)}
              className="p-1 rounded text-[var(--subtle)] hover:text-[var(--fg)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeMessage && activeMessage.retrievedChunks ? (
              <>
                {/* Cited Chunks (Pinned at Top) */}
                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase font-semibold text-[var(--accent)] tracking-wider block">
                    Cited in Answer
                  </span>
                  {activeMessage.retrievedChunks
                    .filter((c) => c.isCited)
                    .map((chunk, i) => (
                      <ChunkView
                        key={chunk.id}
                        chunk={chunk}
                        citationIndex={i + 1}
                        highlighted={highlightedChunkId === chunk.id}
                        onSelect={() => setHighlightedChunkId(chunk.id)}
                      />
                    ))}
                </div>

                {/* Retrieved but not cited divider */}
                {activeMessage.retrievedChunks.some((c) => !c.isCited) && (
                  <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
                    <span className="text-[10px] uppercase font-semibold text-[var(--subtle)] tracking-wider block">
                      Retrieved but Not Cited
                    </span>
                    {activeMessage.retrievedChunks
                      .filter((c) => !c.isCited)
                      .map((chunk) => (
                        <ChunkView
                          key={chunk.id}
                          chunk={chunk}
                          highlighted={highlightedChunkId === chunk.id}
                          onSelect={() => setHighlightedChunkId(chunk.id)}
                        />
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-xs text-[var(--subtle)]">
                Ask a question to see retrieved document chunks here.
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Retrieval Inspector Drawer */}
      {retrievalDrawerChunk && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setRetrievalDrawerChunk(null)}
          />

          <div className="relative w-full max-w-xl bg-[var(--surface)] border-l border-[var(--line-strong)] shadow-2xl h-full flex flex-col z-10 text-xs">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[var(--accent)]" />
                <span className="font-semibold text-sm text-[var(--fg)]">
                  Retrieval Execution Inspector
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRetrievalDrawerChunk(null)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--fg)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-[var(--subtle)]">
                  <span>Latency: {retrievalDrawerChunk.latencyMs}ms</span>
                  <span>Tokens: {retrievalDrawerChunk.tokens}</span>
                </div>
                <div className="text-[var(--fg)]">
                  Pipeline: {activeConfig.chat_model} · {activeConfig.retrieval_mode}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-[var(--subtle)] uppercase tracking-wider block mb-2">
                  All Retrieved Chunks with Fusion Scores
                </span>
                <div className="space-y-3">
                  {retrievalDrawerChunk.retrievedChunks?.map((chunk, idx) => (
                    <div
                      key={chunk.id}
                      className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] space-y-2"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="font-semibold text-[var(--fg)]">
                          Rank #{idx + 1} · {chunk.docName} (p. {chunk.page})
                        </span>
                        <span className="text-[var(--accent)]">
                          Fusion Score: {(chunk.score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] font-sans">
                        {chunk.text}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--subtle)] pt-1 border-t border-[var(--border)]/50">
                        <span>Type: {chunk.retrievalType}</span>
                        <span>•</span>
                        <span>Cited: {chunk.isCited ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)] flex justify-end">
              <button
                type="button"
                onClick={() => setRetrievalDrawerChunk(null)}
                className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GroundedChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[var(--muted)]">Loading grounded chat...</div>}>
      <GroundedChatContent />
    </Suspense>
  );
}
