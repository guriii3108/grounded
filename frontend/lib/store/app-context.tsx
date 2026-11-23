"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Collection,
  Provider,
  PipelineConfig,
  TestSet,
  EvalRun,
  BackgroundJob,
  DocumentItem,
  TestCase,
} from "../types";
import {
  initialCollections,
  initialProviders,
  pipelineConfigs as initialConfigs,
  initialTestSets,
  initialEvalRuns,
  initialActiveJobs,
} from "../data/mock-data";

interface AppContextType {
  collections: Collection[];
  providers: Provider[];
  configs: PipelineConfig[];
  testSets: TestSet[];
  evalRuns: EvalRun[];
  activeJobs: BackgroundJob[];
  theme: "dark" | "light";
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addCollection: (name: string, description: string, embeddingModel: string) => Collection;
  deleteCollection: (id: string) => void;
  addDocument: (collectionId: string, file: File | { name: string; size: number }) => void;
  retryDocument: (collectionId: string, docId: string) => void;
  addProvider: (provider: Omit<Provider, "id" | "modelsCount">) => void;
  testProviderConnection: (providerId: string) => Promise<{ success: boolean; latencyMs: number }>;
  modelRoles: { chat: string; embedding: string; judge: string };
  updateModelRoles: (roles: Partial<{ chat: string; embedding: string; judge: string }>) => void;
  savePipelineConfig: (cfg: Omit<PipelineConfig, "id">) => PipelineConfig;
  createEvalRun: (params: {
    collectionId: string;
    testSetId: string;
    configId: string;
    judgeModel: string;
  }) => EvalRun;
  cancelEvalRun: (runId: string) => void;
  addTestCase: (testSetId: string, testCase: Omit<TestCase, "id">) => void;
  deleteTestCase: (testSetId: string, caseId: string) => void;
  loadSampleDataset: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [configs, setConfigs] = useState<PipelineConfig[]>(initialConfigs);
  const [testSets, setTestSets] = useState<TestSet[]>(initialTestSets);
  const [evalRuns, setEvalRuns] = useState<EvalRun[]>(initialEvalRuns);
  const [activeJobs, setActiveJobs] = useState<BackgroundJob[]>(initialActiveJobs);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const [modelRoles, setModelRoles] = useState({
    chat: "openai/gpt-4o",
    embedding: "openai/text-embedding-3-small",
    judge: "anthropic/claude-3-7-sonnet",
  });

  // Theme synchronization with html class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Global keyboard shortcuts (⌘K for palette, [ for sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K opens command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      // [ toggles sidebar (when not focused in an input)
      if (
        e.key === "[" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
      // Esc closes command palette
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const addCollection = (name: string, description: string, embeddingModel: string) => {
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name,
      description: description || "Custom document collection for RAG grounding.",
      documentsCount: 0,
      chunksCount: 0,
      lastIndexedAt: new Date().toISOString(),
      activeEmbeddingModel: embeddingModel || "openai/text-embedding-3-small",
      indexes: [
        {
          id: `idx-${Date.now()}`,
          name: "Default Hybrid 512/64",
          chunkSize: 512,
          chunkOverlap: 64,
          embeddingModel: embeddingModel || "openai/text-embedding-3-small",
          dimension: 1536,
          docCount: 0,
          chunkCount: 0,
          isDefault: true,
          createdAt: new Date().toISOString(),
        },
      ],
      documents: [],
    };
    setCollections((prev) => [newCol, ...prev]);
    return newCol;
  };

  const deleteCollection = (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  const addDocument = (collectionId: string, file: File | { name: string; size: number }) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
    const docType: DocumentItem["type"] = ["pdf", "docx", "md", "txt"].includes(ext)
      ? (ext as any)
      : "pdf";

    const newDocId = `doc-${Date.now()}`;
    const newDoc: DocumentItem = {
      id: newDocId,
      name: file.name,
      type: docType,
      sizeBytes: file.size,
      pages: Math.max(1, Math.round(file.size / 45000)),
      chunksCount: 0,
      status: "processing",
      progressPercent: 15,
      addedAt: new Date().toISOString(),
    };

    setCollections((prev) =>
      prev.map((col) => {
        if (col.id !== collectionId) return col;
        return {
          ...col,
          documentsCount: col.documentsCount + 1,
          documents: [newDoc, ...col.documents],
        };
      })
    );

    // Add to active jobs
    const newJob: BackgroundJob = {
      id: `job-ingest-${newDocId}`,
      type: "ingestion",
      title: `Ingesting ${file.name}`,
      target: collectionId,
      progress: 25,
      status: "running",
      startedAt: new Date().toISOString(),
    };
    setActiveJobs((prev) => [newJob, ...prev]);

    // Simulate ingestion progress
    setTimeout(() => {
      setCollections((prev) =>
        prev.map((col) => {
          if (col.id !== collectionId) return col;
          return {
            ...col,
            chunksCount: col.chunksCount + 140,
            documents: col.documents.map((d) =>
              d.id === newDocId
                ? { ...d, status: "ready", progressPercent: 100, chunksCount: 140 }
                : d
            ),
          };
        })
      );
      setActiveJobs((prev) => prev.filter((j) => j.id !== newJob.id));
    }, 4000);
  };

  const retryDocument = (collectionId: string, docId: string) => {
    setCollections((prev) =>
      prev.map((col) => {
        if (col.id !== collectionId) return col;
        return {
          ...col,
          documents: col.documents.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  status: "processing",
                  progressPercent: 20,
                  errorMessage: undefined,
                }
              : d
          ),
        };
      })
    );

    setTimeout(() => {
      setCollections((prev) =>
        prev.map((col) => {
          if (col.id !== collectionId) return col;
          return {
            ...col,
            documents: col.documents.map((d) =>
              d.id === docId
                ? { ...d, status: "ready", progressPercent: 100, chunksCount: 320 }
                : d
            ),
          };
        })
      );
    }, 2500);
  };

  const addProvider = (provider: Omit<Provider, "id" | "modelsCount">) => {
    const newProv: Provider = {
      ...provider,
      id: `prov-${Date.now()}`,
      modelsCount: provider.models.length,
    };
    setProviders((prev) => [...prev, newProv]);
  };

  const testProviderConnection = async (providerId: string): Promise<{ success: boolean; latencyMs: number }> => {
    await new Promise((r) => setTimeout(r, 600));
    const latency = Math.floor(Math.random() * 80) + 40;
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, status: "connected", latencyMs: latency } : p
      )
    );
    return { success: true, latencyMs: latency };
  };

  const updateModelRoles = (roles: Partial<{ chat: string; embedding: string; judge: string }>) => {
    setModelRoles((prev) => ({ ...prev, ...roles }));
  };

  const savePipelineConfig = (cfg: Omit<PipelineConfig, "id">): PipelineConfig => {
    const newCfg: PipelineConfig = {
      ...cfg,
      id: `cfg-${Date.now()}`,
    };
    setConfigs((prev) => [newCfg, ...prev]);
    return newCfg;
  };

  const createEvalRun = ({
    collectionId,
    testSetId,
    configId,
    judgeModel,
  }: {
    collectionId: string;
    testSetId: string;
    configId: string;
    judgeModel: string;
  }): EvalRun => {
    const col = collections.find((c) => c.id === collectionId) || collections[0];
    const ts = testSets.find((t) => t.id === testSetId) || testSets[0];
    const cfg = configs.find((c) => c.id === configId) || configs[0];

    const newRunId = `run-${Date.now()}`;
    const newRun: EvalRun = {
      id: newRunId,
      name: `v0.9.${evalRuns.length + 1}-${cfg.chat_model.split("/")[1] || "eval"}-${cfg.retrieval_mode}`,
      collectionId: col.id,
      collectionName: col.name,
      testSetId: ts.id,
      testSetName: ts.name,
      config: cfg,
      judgeModel,
      status: "running",
      progressPercent: 35,
      recallAtK: 0.89,
      mrr: 0.83,
      faithfulness: 0.86,
      answerRelevance: 0.88,
      p95LatencyMs: 1650,
      tokenCostUsd: 0.28,
      startedAt: new Date().toISOString(),
      results: initialEvalRuns[0].results.map((r) => ({
        ...r,
        id: `res-gen-${Math.random()}`,
      })),
    };

    setEvalRuns((prev) => [newRun, ...prev]);

    const newJob: BackgroundJob = {
      id: `job-eval-${newRunId}`,
      type: "eval",
      title: `Eval Run: ${newRun.name}`,
      target: ts.name,
      progress: 40,
      status: "running",
      startedAt: new Date().toISOString(),
    };
    setActiveJobs((prev) => [newJob, ...prev]);

    setTimeout(() => {
      setEvalRuns((prev) =>
        prev.map((r) =>
          r.id === newRunId
            ? { ...r, status: "completed", progressPercent: 100, completedAt: new Date().toISOString() }
            : r
        )
      );
      setActiveJobs((prev) => prev.filter((j) => j.id !== newJob.id));
    }, 5000);

    return newRun;
  };

  const cancelEvalRun = (runId: string) => {
    setEvalRuns((prev) =>
      prev.map((r) => (r.id === runId ? { ...r, status: "cancelled" } : r))
    );
    setActiveJobs((prev) => prev.filter((j) => j.id !== `job-eval-${runId}`));
  };

  const addTestCase = (testSetId: string, testCase: Omit<TestCase, "id">) => {
    const newCase: TestCase = { ...testCase, id: `tc-${Date.now()}` };
    setTestSets((prev) =>
      prev.map((ts) =>
        ts.id === testSetId
          ? { ...ts, caseCount: ts.caseCount + 1, cases: [newCase, ...ts.cases] }
          : ts
      )
    );
  };

  const deleteTestCase = (testSetId: string, caseId: string) => {
    setTestSets((prev) =>
      prev.map((ts) =>
        ts.id === testSetId
          ? {
              ...ts,
              caseCount: Math.max(0, ts.caseCount - 1),
              cases: ts.cases.filter((c) => c.id !== caseId),
            }
          : ts
      )
    );
  };

  const loadSampleDataset = () => {
    setCollections(initialCollections);
    setTestSets(initialTestSets);
    setEvalRuns(initialEvalRuns);
  };

  return (
    <AppContext.Provider
      value={{
        collections,
        providers,
        configs,
        testSets,
        evalRuns,
        activeJobs,
        theme,
        toggleTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        commandPaletteOpen,
        setCommandPaletteOpen,
        addCollection,
        deleteCollection,
        addDocument,
        retryDocument,
        addProvider,
        testProviderConnection,
        modelRoles,
        updateModelRoles,
        savePipelineConfig,
        createEvalRun,
        cancelEvalRun,
        addTestCase,
        deleteTestCase,
        loadSampleDataset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
