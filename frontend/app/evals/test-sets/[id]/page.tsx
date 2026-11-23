"use client";

import React, { useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../../lib/store/app-context";
import { TestCase } from "../../../../lib/types";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  X,
  Check,
} from "lucide-react";

function TestSetDetailContent() {
  const params = useParams();
  const router = useRouter();
  const testSetId = params.id as string;
  const { testSets, addTestCase, deleteTestCase } = useApp();

  const testSet = testSets.find((ts) => ts.id === testSetId);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // New test case form state
  const [question, setQuestion] = useState("");
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [docName, setDocName] = useState("Apple_FY2025_Form_10K.pdf");
  const [page, setPage] = useState(34);
  const [snippet, setSnippet] = useState("");

  // Generated candidate review state
  const [generatedCandidates] = useState<TestCase[]>([
    {
      id: "cand-1",
      question: "What were Microsoft's total commercial cloud revenues for Q4?",
      expectedAnswer: "Commercial cloud revenue reached $38.9 billion, an increase of 21% year-over-year.",
      sourceChunkId: "chk-msft-cloud-rev",
      docName: "Microsoft_FY2025_Annual_Report.pdf",
      page: 29,
      snippet: "Commercial cloud revenue was $38.9 billion, up 21% (up 22% in constant currency). Growth was led by Azure and other cloud services revenue growth of 29%.",
    },
    {
      id: "cand-2",
      question: "Did Alphabet disclose any regulatory fines regarding search dominance in the US antitrust trial?",
      expectedAnswer: "Alphabet reported ongoing remedies hearings in US v. Google, with potential structural relief pending judge determination.",
      sourceChunkId: "chk-goog-legal-remedies",
      docName: "Alphabet_2025_10K.pdf",
      page: 62,
      snippet: "In August 2024, the court issued its liability decision finding violations of Section 2 of the Sherman Act. The remedies phase will commence in 2025.",
    },
  ]);

  if (!testSet) {
    return (
      <div className="p-8 text-center text-xs text-[var(--muted)]">
        Test set not found.
      </div>
    );
  }

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    addTestCase(testSet.id, {
      question: question.trim(),
      expectedAnswer: expectedAnswer.trim(),
      docName,
      page: Number(page) || 1,
      snippet: snippet.trim() || "Ground truth passage",
      sourceChunkId: `chunk-${testSet.cases.length + 1}`,
    });
    setIsAddOpen(false);
    setQuestion("");
    setExpectedAnswer("");
    setSnippet("");
  };

  const commitCandidates = () => {
    generatedCandidates.forEach((c) => {
      addTestCase(testSet.id, c);
    });
    setIsReviewOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push("/evals")}
              className="p-1 rounded text-[var(--subtle)] hover:text-[var(--ink)] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-[var(--ink)]">
              {testSet.name}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-[var(--surface-2)] text-[var(--subtle)] border border-[var(--line)]">
              {testSet.source}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Collection: {testSet.collectionName} • {testSet.cases.length} Ground-Truth Test Cases
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsGenerateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--ink)] shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Generate Cases</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Test Case</span>
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-[var(--subtle)] font-medium">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-72">Question</th>
                <th className="py-2.5 px-4 font-semibold">Expected Answer</th>
                <th className="py-2.5 px-4 font-semibold w-48">Source Document</th>
                <th className="py-2.5 px-4 font-semibold text-center w-20">Page</th>
                <th className="py-2.5 px-4 text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {testSet.cases.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--surface-2)]/70 transition-colors">
                  <td className="py-3 px-4 font-medium text-[var(--ink)]">
                    <p className="line-clamp-2 leading-relaxed">{c.question}</p>
                  </td>
                  <td className="py-3 px-4 text-[var(--muted)]">
                    <p className="line-clamp-2 leading-relaxed">{c.expectedAnswer}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[var(--ink)]">
                    <div className="flex items-center gap-1.5 truncate max-w-xs">
                      <FileText className="w-3.5 h-3.5 text-[var(--subtle)] shrink-0" />
                      <span className="truncate">{c.docName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[var(--subtle)] tabular-nums">
                    p. {c.page}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => deleteTestCase(testSet.id, c.id)}
                      className="p-1 rounded text-[var(--subtle)] hover:text-[var(--negative)] transition-colors cursor-pointer"
                      title="Delete Test Case"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Test Case Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg rounded-xl bg-[var(--surface)] border border-[var(--line-strong)] p-5 z-10 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <span className="font-semibold text-sm text-[var(--ink)]">
                Add Benchmark Test Case
              </span>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3.5">
              <div>
                <label className="block font-medium text-[var(--ink)] mb-1">
                  Question
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What were Apple's Services net sales in 2025?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--ink)] mb-1">
                  Expected Answer (Ground Truth)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="The factual target answer that evaluates correctness..."
                  value={expectedAnswer}
                  onChange={(e) => setExpectedAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-medium text-[var(--ink)] mb-1">
                    Source Document
                  </label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[var(--ink)] mb-1">
                    Page
                  </label>
                  <input
                    type="number"
                    value={page}
                    onChange={(e) => setPage(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[var(--ink)] mb-1">
                  Source Chunk Snippet
                </label>
                <textarea
                  rows={2}
                  placeholder="Exact supporting passage text..."
                  value={snippet}
                  onChange={(e) => setSnippet(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium"
                >
                  Add Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Cases Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsGenerateOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-[var(--surface)] border border-[var(--line-strong)] p-5 z-10 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <span className="font-semibold text-sm text-[var(--ink)]">
                  Synthetic QA Generation
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateOpen(false)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[var(--muted)] leading-relaxed">
              Samples chunks from this collection and uses an LLM to generate paired ground-truth questions and answers with source anchors.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-medium text-[var(--ink)] mb-1">
                  Number of Test Pairs
                </label>
                <select className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)]">
                  <option value="5">5 Synthetic Questions</option>
                  <option value="10">10 Synthetic Questions</option>
                  <option value="20">20 Synthetic Questions</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[var(--ink)] mb-1">
                  Generation Model
                </label>
                <select className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)]">
                  <option value="openai/gpt-4o">OpenAI · GPT-4o</option>
                  <option value="anthropic/claude-3-7-sonnet">Anthropic · Claude 3.7 Sonnet</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setIsGenerateOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsGenerateOpen(false);
                  setIsReviewOpen(true);
                }}
                className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white font-semibold"
              >
                Generate & Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Generated Cases Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsReviewOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-xl bg-[var(--surface)] border border-[var(--line-strong)] p-5 z-10 text-xs space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)] shrink-0">
              <span className="font-semibold text-sm text-[var(--ink)]">
                Review Generated Test Cases
              </span>
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="p-1 rounded text-[var(--subtle)] hover:text-[var(--ink)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[var(--muted)] shrink-0">
              Review candidates before committing them into the gold benchmark dataset.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3">
              {generatedCandidates.map((cand, i) => (
                <div
                  key={cand.id}
                  className="p-3.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--ink)]">
                      Candidate #{i + 1}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--subtle)]">
                      {cand.docName} (p. {cand.page})
                    </span>
                  </div>
                  <p className="font-medium text-xs text-[var(--ink)]">
                    Q: {cand.question}
                  </p>
                  <p className="text-[var(--muted)] text-[11px]">
                    Expected: {cand.expectedAnswer}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--line)] shrink-0">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={commitCandidates}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--positive)] text-white font-semibold"
              >
                <Check className="w-4 h-4" />
                <span>Accept & Add {generatedCandidates.length} Cases</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TestSetDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[var(--muted)]">Loading test set...</div>}>
      <TestSetDetailContent />
    </Suspense>
  );
}
