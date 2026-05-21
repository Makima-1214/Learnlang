"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import AudioPlayer from "@/components/AudioPlayer";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Headphones,
  BookOpenText,
  CheckCircle2,
  Volume2,
  ChevronRight,
} from "lucide-react";

const methodConfig = {
  vocabulary: {
    title: "Vocabulary",
    description: "Pilih jawaban yang benar untuk kata dasar A1.",
    icon: BookOpenText,
    badge: "Vocabulary",
  },
  listening: {
    title: "Listening",
    description: "Dengar audio, lihat kalimat, lalu pilih kata yang tepat.",
    icon: Headphones,
    badge: "Listening",
  },
  grammar: {
    title: "Grammar",
    description: "Cari kata yang salah dan pilih perbaikannya.",
    icon: CheckCircle2,
    badge: "Grammar",
  },
};

function getMethodDisplay(method) {
  return methodConfig[method] || null;
}

function parseListeningAnswer(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);
  }
}

function createListeningItems(question) {
  const chunks = Array.isArray(question?.chunks) ? question.chunks : [];

  return chunks.map((text, index) => ({
    id: `${question?.sessionQuestionId || question?.questionId || "chunk"}-${index}`,
    text,
  }));
}

function shuffleListeningItems(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function serializeListeningItems(items) {
  return JSON.stringify(items.map((item) => item.text));
}

function buildListeningBoard(question, savedAnswer) {
  const sourceItems = createListeningItems(question);
  const savedTokens = parseListeningAnswer(savedAnswer);

  if (savedTokens.length === 0) {
    return { bank: shuffleListeningItems(sourceItems), answer: [] };
  }

  const usedIndexes = new Set();
  const answer = savedTokens
    .map((token) => {
      const index = sourceItems.findIndex(
        (item, itemIndex) => !usedIndexes.has(itemIndex) && item.text === token,
      );

      if (index === -1) return null;
      usedIndexes.add(index);
      return sourceItems[index];
    })
    .filter(Boolean);

  const bank = sourceItems.filter((_, index) => !usedIndexes.has(index));

  return { bank, answer };
}

function normalizeExpectedListeningAnswer(answer) {
  const normalized = parseListeningAnswer(answer);
  return normalized;
}

function formatListeningTokens(answer) {
  return parseListeningAnswer(answer).join(" ");
}

function SortableListeningItem({ item, disabled, active, onActivate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!disabled) onActivate?.(item);
      }}
      className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold shadow-sm transition-all ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          : active
            ? "cursor-pointer border-blue-500 bg-blue-50 text-blue-700"
            : "cursor-grab border-slate-300 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow"
      } ${isDragging ? "opacity-50 ring-2 ring-blue-300" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {item.text}
    </button>
  );
}

const LISTENING_BANK_ID = "listening-bank";
const LISTENING_ANSWER_ID = "listening-answer";

function ListeningDropZone({ id, className = "", children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "ring-2 ring-blue-300" : ""}`}
    >
      {children}
    </div>
  );
}

export default function MethodPracticeClient({ method }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const methodStr = String(method || "").toLowerCase();
  const methodDisplay = getMethodDisplay(methodStr);
  const listeningSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [answers, setAnswers] = useState({}); // { sessionQuestionId: answer }
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [listeningBank, setListeningBank] = useState([]);
  const [listeningAnswer, setListeningAnswer] = useState([]);
  const sessionIdRef = useRef(null);

  const getProgressStorageKey = (sessionId) =>
    sessionId ? `learningProgress:${sessionId}` : null;

  const clearProgressStorage = (sessionId) => {
    if (typeof window === "undefined") return;
    const storageKey = getProgressStorageKey(sessionId);
    if (storageKey) {
      sessionStorage.removeItem(storageKey);
    }
  };

  const saveProgressStorage = (sessionId, progress) => {
    if (typeof window === "undefined") return;
    const storageKey = getProgressStorageKey(sessionId);
    if (!storageKey) return;

    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        ...progress,
        sessionId,
        method: methodStr,
        savedAt: Date.now(),
      }),
    );
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Handle beforeunload to warn about losing progress
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (sessionData && !completed) {
        e.preventDefault();
        e.returnValue =
          "Jika Anda keluar, progress latihan akan hilang. Apakah Anda yakin?";
        return "Jika Anda keluar, progress latihan akan hilang. Apakah Anda yakin?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionData, completed]);

  // Handle route protection - prevent leaving page without confirmation
  useEffect(() => {
    if (!sessionData || completed) return;

    const handlePopState = () => {
      setShowExitDialog(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [sessionData, completed]);

  useEffect(() => {
    if (!methodDisplay) return;

    let isActive = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // First, check if we have a session ID from sessionStorage (from /learn page)
        const storedSessionId = sessionStorage.getItem("learningSessionId");
        const storedMethod = sessionStorage.getItem("learningMethod");

        let sessionId = storedSessionId;

        // If no session in storage, create a new one
        if (!sessionId) {
          const response = await fetch("/api/learn/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              method: methodStr,
              level: "A1",
              limit: 5,
            }),
          });
          const payload = await response.json();

          if (!response.ok || !payload?.success) {
            throw new Error(payload?.message || "Failed to load learning data");
          }

          sessionId = payload.data?.session?.id;

          // Store session info in sessionStorage
          if (typeof window !== "undefined" && sessionId) {
            sessionStorage.setItem("learningSessionId", sessionId);
            sessionStorage.setItem("learningMethod", methodStr);
          }

          if (isActive) {
            sessionIdRef.current = sessionId;
            setSessionData(payload.data);
            setCurrentIndex(0);
            setSelected(null);
            setRevealed(false);
            setCorrect(null);
            setAnswers({});
          }
        } else {
          // We have a session ID, fetch its data
          const response = await fetch(`/api/learn/session/${sessionId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const payload = await response.json();

          if (!response.ok || !payload?.success) {
            throw new Error(payload?.message || "Failed to load learning data");
          }

          if (isActive) {
            sessionIdRef.current = sessionId;

            const progressRaw =
              typeof window !== "undefined"
                ? sessionStorage.getItem(getProgressStorageKey(sessionId))
                : null;
            let restoredProgress = null;

            if (progressRaw) {
              try {
                restoredProgress = JSON.parse(progressRaw);
              } catch (parseError) {
                console.warn("Invalid saved progress, resetting:", parseError);
              }
            }

            const loadedAnswers = {};
            payload.data.questions.forEach((question) => {
              if (
                question.userAnswer !== undefined &&
                question.userAnswer !== null
              ) {
                loadedAnswers[question.sessionQuestionId] = question.userAnswer;
              }
            });

            const isMatchingProgress =
              restoredProgress?.sessionId === sessionId &&
              restoredProgress?.method === methodStr;

            const nextAnswers = isMatchingProgress
              ? restoredProgress.answers || loadedAnswers
              : loadedAnswers;

            const nextCurrentIndex = isMatchingProgress
              ? Math.min(
                  Math.max(restoredProgress.currentIndex ?? 0, 0),
                  Math.max(payload.data.questions.length - 1, 0),
                )
              : Math.max(
                  payload.data.questions.findIndex(
                    (question) =>
                      question.userAnswer === undefined ||
                      question.userAnswer === null,
                  ),
                  0,
                );

            const activeQuestion =
              payload.data.questions[nextCurrentIndex] ||
              payload.data.questions[0] ||
              null;

            const restoredCorrect = (() => {
              if (
                isMatchingProgress &&
                typeof restoredProgress.correct !== "undefined"
              ) {
                return !!restoredProgress.correct;
              }

              if (
                methodStr === "listening" &&
                activeQuestion?.answer !== undefined &&
                activeQuestion?.userAnswer !== undefined &&
                activeQuestion?.userAnswer !== null
              ) {
                const expected = normalizeExpectedListeningAnswer(
                  activeQuestion.answer,
                );
                const submitted = parseListeningAnswer(
                  activeQuestion.userAnswer,
                );
                return (
                  expected.length === submitted.length &&
                  expected.every((item, index) => item === submitted[index])
                );
              }

              if (
                activeQuestion?.userAnswer !== undefined &&
                activeQuestion?.userAnswer !== null
              ) {
                return activeQuestion.userAnswer === activeQuestion.answer;
              }

              return null;
            })();

            setSessionData(payload.data);
            setCurrentIndex(nextCurrentIndex);
            setSelected(
              isMatchingProgress ? (restoredProgress.selected ?? null) : null,
            );
            setRevealed(
              isMatchingProgress ? !!restoredProgress.revealed : false,
            );
            setCorrect(restoredCorrect);
            setAnswers(nextAnswers);
          }
        }
      } catch (err) {
        if (isActive) setError(err.message || "Failed to load learning data");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [methodStr, methodDisplay]);

  const currentQuestion = sessionData?.questions[currentIndex];
  const total = sessionData?.session?.total || 0;
  const Icon = methodDisplay?.icon || Volume2;

  useEffect(() => {
    if (methodStr !== "listening" || !currentQuestion) return;

    const restored = buildListeningBoard(
      currentQuestion,
      answers[currentQuestion.sessionQuestionId],
    );

    setListeningBank(restored.bank);
    setListeningAnswer(restored.answer);
  }, [
    methodStr,
    currentQuestion?.sessionQuestionId,
    currentQuestion?.chunks,
    answers[currentQuestion?.sessionQuestionId],
  ]);

  const persistListeningAnswer = (questionId, answerItems) => {
    if (!questionId) return;

    const serialized = serializeListeningItems(answerItems);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: serialized,
    }));

    if (sessionData?.session?.id) {
      fetch(`/api/learn/session/${sessionData.session.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [
            {
              sessionQuestionId: questionId,
              userAnswer: serialized,
            },
          ],
        }),
      }).catch((e) => console.warn("Listening autosave failed:", e));
    }
  };

  const commitListeningBoard = (nextBank, nextAnswer) => {
    setListeningBank(nextBank);
    setListeningAnswer(nextAnswer);
    persistListeningAnswer(currentQuestion?.sessionQuestionId, nextAnswer);
  };

  const handleListeningItemActivate = (item, fromContainer) => {
    if (!currentQuestion || revealed) return;

    if (fromContainer === LISTENING_BANK_ID) {
      const nextBank = listeningBank.filter(
        (current) => current.id !== item.id,
      );
      const nextAnswer = [...listeningAnswer, item];
      commitListeningBoard(nextBank, nextAnswer);
      return;
    }

    const nextAnswer = listeningAnswer.filter(
      (current) => current.id !== item.id,
    );
    const nextBank = [...listeningBank, item];
    commitListeningBoard(nextBank, nextAnswer);
  };

  const handleListeningDragEnd = ({ active, over }) => {
    if (!over || !currentQuestion || revealed) return;
    if (active.id === over.id) return;

    const getContainer = (itemId) => {
      if (itemId === LISTENING_BANK_ID) return LISTENING_BANK_ID;
      if (itemId === LISTENING_ANSWER_ID) return LISTENING_ANSWER_ID;
      if (listeningBank.some((item) => item.id === itemId)) {
        return LISTENING_BANK_ID;
      }
      if (listeningAnswer.some((item) => item.id === itemId)) {
        return LISTENING_ANSWER_ID;
      }
      return null;
    };

    const sourceContainer = getContainer(active.id);
    const targetContainer = getContainer(over.id);

    if (!sourceContainer || !targetContainer) return;

    const sourceItems =
      sourceContainer === LISTENING_BANK_ID ? listeningBank : listeningAnswer;
    const targetItems =
      targetContainer === LISTENING_BANK_ID ? listeningBank : listeningAnswer;

    const sourceIndex = sourceItems.findIndex((item) => item.id === active.id);
    const targetIndex = targetItems.findIndex((item) => item.id === over.id);

    if (sourceIndex === -1) return;

    let nextBank = listeningBank;
    let nextAnswer = listeningAnswer;

    const insertIntoTarget = (items, movedItem, index) => {
      const safeIndex = index < 0 ? items.length : index;
      return [
        ...items.slice(0, safeIndex),
        movedItem,
        ...items.slice(safeIndex),
      ];
    };

    if (sourceContainer === targetContainer) {
      const reordered = arrayMove(
        sourceItems,
        sourceIndex,
        targetIndex < 0 ? sourceItems.length - 1 : targetIndex,
      );
      if (sourceContainer === LISTENING_BANK_ID) {
        nextBank = reordered;
      } else {
        nextAnswer = reordered;
      }
    } else {
      const movedItem = sourceItems[sourceIndex];
      const filteredSource = sourceItems.filter(
        (item) => item.id !== active.id,
      );
      const insertIndex = targetIndex < 0 ? targetItems.length : targetIndex;
      const nextTarget = insertIntoTarget(targetItems, movedItem, insertIndex);

      if (sourceContainer === LISTENING_BANK_ID) {
        nextBank = filteredSource;
        nextAnswer = nextTarget;
      } else {
        nextAnswer = filteredSource;
        nextBank = nextTarget;
      }
    }

    commitListeningBoard(nextBank, nextAnswer);
  };

  const handleListeningCheck = () => {
    if (!currentQuestion || revealed) return;

    const expected = normalizeExpectedListeningAnswer(currentQuestion.answer);
    const current = listeningAnswer.map((item) => item.text);
    const isRight =
      expected.length === current.length &&
      expected.every((item, index) => item === current[index]);

    const serialized = serializeListeningItems(listeningAnswer);

    setSelected(serialized);
    setCorrect(isRight);
    setRevealed(true);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.sessionQuestionId]: serialized,
    }));

    if (sessionData?.session?.id) {
      fetch(`/api/learn/session/${sessionData.session.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [
            {
              sessionQuestionId: currentQuestion.sessionQuestionId,
              userAnswer: serialized,
            },
          ],
        }),
      }).catch((e) => console.warn("Listening check autosave failed:", e));
    }
  };

  useEffect(() => {
    if (!sessionData?.session?.id || completed) return;

    saveProgressStorage(sessionData.session.id, {
      currentIndex,
      selected,
      revealed,
      correct,
      answers,
    });

    // periodic autosave to backend (send all answers every 10s)
    const interval = setInterval(() => {
      if (!sessionData?.session?.id) return;
      const sid = sessionData.session.id;
      const updates = Object.entries(answers || {}).map(
        ([sessionQuestionId, userAnswer]) => ({
          sessionQuestionId,
          userAnswer,
        }),
      );
      if (updates.length === 0) return;

      fetch(`/api/learn/session/${sid}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      }).catch((e) => console.warn("Autosave batch failed:", e));
    }, 10000);

    return () => clearInterval(interval);
  }, [
    sessionData,
    currentIndex,
    selected,
    revealed,
    correct,
    answers,
    completed,
  ]);

  const handleAnswer = (answer) => {
    if (!currentQuestion || revealed) return;
    setSelected(answer);
    const isRight = answer === currentQuestion.answer;
    setCorrect(isRight);
    setRevealed(true);

    // Store answer
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.sessionQuestionId]: answer,
    }));
    // autosave single question answer to backend
    if (sessionData?.session?.id) {
      const sid = sessionData.session.id;
      const qid = currentQuestion.sessionQuestionId;
      try {
        fetch(`/api/learn/session/${sid}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updates: [{ sessionQuestionId: qid, userAnswer: answer }],
          }),
        }).catch((e) => console.warn("Autosave failed:", e));
      } catch (e) {
        console.warn("Autosave exception:", e);
      }
    }
  };

  const handleBackWithConfirmation = () => {
    setShowExitDialog(true);
  };

  const handleConfirmExit = async () => {
    // Delete session from database to discard progress
    if (sessionIdRef.current) {
      try {
        await fetch(`/api/learn/session/${sessionIdRef.current}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
    }

    // Clear sessionStorage
    if (typeof window !== "undefined") {
      clearProgressStorage(sessionIdRef.current);
      sessionStorage.removeItem("learningSessionId");
      sessionStorage.removeItem("learningMethod");
    }

    setShowExitDialog(false);
    router.push("/learn");
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  const goNext = async () => {
    const next = currentIndex + 1;
    if (next >= total) {
      // Submit session
      await submitSession();
      return;
    }
    setCurrentIndex(next);
    setSelected(null);
    setRevealed(false);
    setCorrect(null);
  };

  const submitSession = async () => {
    if (!sessionData?.session?.id) return;
    setSubmitting(true);
    try {
      // ensure last autosave flush
      if (sessionData?.session?.id && Object.keys(answers || {}).length > 0) {
        try {
          await fetch(`/api/learn/session/${sessionData.session.id}/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              updates: Object.entries(answers).map(
                ([sessionQuestionId, userAnswer]) => ({
                  sessionQuestionId,
                  userAnswer,
                }),
              ),
            }),
          });
        } catch (e) {
          console.warn("Final autosave failed:", e);
        }
      }
      const response = await fetch(
        `/api/learn/session/${sessionData.session.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        },
      );
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to submit session");
      }

      // Clear sessionStorage on successful completion
      if (typeof window !== "undefined") {
        clearProgressStorage(sessionData.session.id);
        sessionStorage.removeItem("learningSessionId");
        sessionStorage.removeItem("learningMethod");
      }

      setResults(payload.data);
      setCompleted(true);
    } catch (err) {
      setError(err.message || "Failed to submit session");
    } finally {
      setSubmitting(false);
    }
  };

  const sentenceTokens = useMemo(() => {
    if (!currentQuestion || methodStr !== "grammar") return [];
    return Array.isArray(currentQuestion.words) ? currentQuestion.words : [];
  }, [currentQuestion, methodStr]);

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  if (!methodDisplay) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar user={session.user} />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <Alert variant="destructive">
            <AlertDescription>Metode belajar tidak ditemukan.</AlertDescription>
          </Alert>
          <Button
            className="mt-4 rounded-2xl"
            onClick={() => router.push("/learn")}
          >
            Kembali
          </Button>
        </main>
      </div>
    );
  }

  // Results view
  if (completed && results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
        <Navbar user={session.user} />
        <main className="mx-auto max-w-2xl px-4 py-16">
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            {/* Score Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-6">
                <div className="text-5xl font-black text-white">
                  {results.session.percentage}%
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-2">
                {results.session.percentage >= 80
                  ? "Luar Biasa! 🎉"
                  : results.session.percentage >= 60
                    ? "Bagus! 👍"
                    : results.session.percentage >= 40
                      ? "Cukup, Tingkatkan Lagi 💪"
                      : "Coba Lagi 🔄"}
              </p>
            </div>

            {/* Summary Results: only accuracy and time spent (no per-question answers) */}
            <div className="space-y-3 mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Ringkasan Hasil
              </h3>
              <p className="text-sm text-slate-600">
                Akurasi:{" "}
                <span className="font-bold text-blue-600">
                  {results.session.percentage}%
                </span>
              </p>
              <p className="text-sm text-slate-600">
                Benar:{" "}
                <span className="font-bold">{results.session.score}</span> dari{" "}
                <span className="font-bold">{results.session.total}</span> soal
              </p>
              <p className="text-sm text-slate-600">
                Waktu pengerjaan:{" "}
                <span className="font-bold">
                  {(() => {
                    const created = results.session.createdAt
                      ? new Date(results.session.createdAt).getTime()
                      : null;
                    const completedAt = results.session.completedAt
                      ? new Date(results.session.completedAt).getTime()
                      : null;
                    const secs =
                      created && completedAt
                        ? Math.max(
                            0,
                            Math.round((completedAt - created) / 1000),
                          )
                        : 0;
                    return formatTime(secs);
                  })()}
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-col sm:flex-row">
              <Button
                className="flex-1 rounded-2xl h-12 text-base font-bold"
                onClick={() => router.push("/learn")}
              >
                Kembali ke Menu
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-2xl h-12 text-base font-bold"
                onClick={() => window.location.reload()}
              >
                Ulang Latihan
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <Navbar user={session.user} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={handleBackWithConfirmation}
            className="rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Badge className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2">
            {methodDisplay.badge}
          </Badge>
        </div>

        {/* Exit Confirmation Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Keluar dari Latihan?</AlertDialogTitle>
              <AlertDialogDescription>
                Jika Anda keluar sekarang, semua progress latihan akan hilang
                dan tidak bisa dipulihkan. Apakah Anda yakin ingin melanjutkan?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel
                onClick={handleCancelExit}
                className="rounded-lg"
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmExit}
                className="bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Keluar & Hapus Progress
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">
              Soal {currentIndex + 1} dari {total}
            </p>
            <p className="text-xs text-slate-500">
              {Math.round(progressPercent)}%
            </p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div>
          {loading && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && currentQuestion && sessionData && (
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8 space-y-6">
                {/* Vocabulary */}
                {methodStr === "vocabulary" && (
                  <>
                    <div className="rounded-3xl border-2 border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6">
                      <p className="text-center text-2xl font-bold text-slate-900">
                        {currentQuestion.question}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(currentQuestion.options || {}).map(
                        ([key, value]) => (
                          <Button
                            key={key}
                            type="button"
                            variant={
                              selected === key
                                ? revealed
                                  ? correct
                                    ? "default"
                                    : "destructive"
                                  : "outline"
                                : "outline"
                            }
                            className="h-auto justify-start rounded-2xl px-5 py-4 text-left transition-all disabled:opacity-60 text-base font-semibold"
                            onClick={() => handleAnswer(key)}
                            disabled={revealed}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <span className="font-black text-lg">{key}.</span>
                              <span>{value}</span>
                            </div>
                          </Button>
                        ),
                      )}
                    </div>
                  </>
                )}

                {/* Listening */}
                {methodStr === "listening" && (
                  <>
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600 font-medium">
                        Dengarkan kalimatnya, lalu susun ulang kata-katanya.
                      </p>
                      <AudioPlayer
                        text={currentQuestion.sentences}
                        title="Listening Sentence"
                        subtitle="Pilih normal untuk kecepatan biasa atau slow untuk versi lebih lambat"
                      />
                    </div>

                    <DndContext
                      sensors={listeningSensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleListeningDragEnd}
                    >
                      <div className="space-y-4">
                        {/* Your Answer Section - Top */}
                        <div className="rounded-3xl border-2 border-blue-200 bg-blue-50/60 p-5 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold tracking-wide text-slate-700 uppercase">
                                Your Answer
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Susun kata sesuai urutan kalimat yang kamu
                                dengar
                              </p>
                            </div>
                            <Badge variant="secondary" className="rounded-full">
                              {listeningAnswer.length}/
                              {
                                normalizeExpectedListeningAnswer(
                                  currentQuestion.answer,
                                ).length
                              }
                            </Badge>
                          </div>

                          <SortableContext
                            items={listeningAnswer.map((item) => item.id)}
                          >
                            <ListeningDropZone
                              id={LISTENING_ANSWER_ID}
                              className="flex flex-wrap content-start gap-3 min-h-28 rounded-2xl border-2 border-dashed border-blue-200 bg-white p-4"
                            >
                              {listeningAnswer.length > 0 ? (
                                listeningAnswer.map((item) => (
                                  <SortableListeningItem
                                    key={item.id}
                                    item={item}
                                    disabled={revealed}
                                    active={true}
                                    onActivate={(word) =>
                                      handleListeningItemActivate(
                                        word,
                                        LISTENING_ANSWER_ID,
                                      )
                                    }
                                  />
                                ))
                              ) : (
                                <p className="text-sm text-slate-400 self-center">
                                  Tarik kata ke sini untuk membentuk jawaban.
                                </p>
                              )}
                            </ListeningDropZone>
                          </SortableContext>
                        </div>

                        {/* Word Bank Section - Bottom */}
                        <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold tracking-wide text-slate-700 uppercase">
                                Word Bank
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Tap atau drag kata ke jawaban
                              </p>
                            </div>
                            <Badge variant="secondary" className="rounded-full">
                              {listeningBank.length} kata
                            </Badge>
                          </div>

                          <SortableContext
                            items={listeningBank.map((item) => item.id)}
                          >
                            <ListeningDropZone
                              id={LISTENING_BANK_ID}
                              className="flex flex-wrap content-start gap-3 min-h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4"
                            >
                              {listeningBank.length > 0 ? (
                                listeningBank.map((item) => (
                                  <SortableListeningItem
                                    key={item.id}
                                    item={item}
                                    disabled={revealed}
                                    active={false}
                                    onActivate={(word) =>
                                      handleListeningItemActivate(
                                        word,
                                        LISTENING_BANK_ID,
                                      )
                                    }
                                  />
                                ))
                              ) : (
                                <p className="text-sm text-slate-400 self-center">
                                  Semua kata sudah dipindahkan.
                                </p>
                              )}
                            </ListeningDropZone>
                          </SortableContext>
                        </div>
                      </div>
                    </DndContext>

                    {/* Unified Button and Feedback */}
                    <Button
                      type="button"
                      className="w-full h-12 rounded-2xl text-base font-bold bg-emerald-600 hover:bg-emerald-700"
                      onClick={!revealed ? handleListeningCheck : goNext}
                      disabled={
                        (!revealed && listeningAnswer.length === 0) ||
                        submitting
                      }
                    >
                      {submitting
                        ? "Mengirim..."
                        : !revealed
                          ? "Periksa Jawaban"
                          : currentIndex === total - 1
                            ? "Selesaikan & Lihat Hasil"
                            : "Soal Berikutnya"}
                      {revealed && <ChevronRight className="ml-2 h-5 w-5" />}
                    </Button>

                    {revealed && (
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                        <p className="text-sm font-semibold text-slate-700">
                          Kalimat benar
                        </p>
                        <p className="text-base font-bold text-slate-900">
                          {currentQuestion.sentences}
                        </p>
                        <p className="text-sm text-slate-600">
                          Susunan jawaban:
                          <span className="font-semibold text-slate-900">
                            {" "}
                            {listeningAnswer.map((item) => item.text).join(" ")}
                          </span>
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Grammar */}
                {methodStr === "grammar" && (
                  <>
                    <div className="rounded-3xl border-2 border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {sentenceTokens.map((word, index) => (
                          <span
                            key={`${word}-${index}`}
                            className={`rounded-2xl px-4 py-2 text-base font-semibold transition-all ${
                              index === currentQuestion.wrongIndex
                                ? "bg-red-100 text-red-700 ring-2 ring-red-300 animate-pulse"
                                : "bg-white text-slate-700 border-2 border-slate-200"
                            }`}
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                      <p className="text-center text-sm text-slate-500 mt-4">
                        Pilih kata yang salah dan ganti dengan jawaban yang
                        benar
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(currentQuestion.choices || []).map((choice) => (
                        <Button
                          key={choice}
                          type="button"
                          variant={
                            selected === choice
                              ? revealed
                                ? correct
                                  ? "default"
                                  : "destructive"
                                : "outline"
                              : "outline"
                          }
                          className="h-auto justify-start rounded-2xl px-5 py-4 text-left transition-all disabled:opacity-60 font-semibold"
                          onClick={() => handleAnswer(choice)}
                          disabled={revealed}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-black text-lg">•</span>
                            <span>{choice}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </>
                )}

                {/* Feedback */}
                {revealed && (
                  <div
                    className="rounded-2xl p-4 border-l-4 animate-in fade-in"
                    style={{
                      backgroundColor: correct ? "#ecfdf5" : "#fef2f2",
                      borderLeftColor: correct ? "#10b981" : "#ef4444",
                    }}
                  >
                    <p
                      className={`font-bold ${correct ? "text-emerald-700" : "text-red-700"}`}
                    >
                      {correct ? "✓ Benar!" : "✗ Salah"}
                    </p>
                    {!correct && (
                      <p className="text-sm text-slate-700 mt-2">
                        Jawaban yang benar:{" "}
                        <span className="font-bold">
                          {methodStr === "listening"
                            ? formatListeningTokens(currentQuestion.answer)
                            : currentQuestion.answer}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Next Button */}
                <Button
                  className="w-full h-12 rounded-2xl text-base font-bold"
                  onClick={goNext}
                  disabled={!revealed || submitting}
                >
                  {submitting
                    ? "Mengirim..."
                    : currentIndex === total - 1
                      ? "Selesaikan & Lihat Hasil"
                      : "Soal Berikutnya"}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
