"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageSquarePlus, History, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { DailySignal } from "@/components/caregiver/daily-signal";
import { HistoryView, type HistoryItem } from "@/components/caregiver/history-view";
import { CaregiverNotes } from "@/components/caregiver/caregiver-notes";
import { BlurFade } from "@/components/shared/blur-fade";
import { TimeToggle, type TimeOfDay } from "@/components/shared/time-toggle";
import { api } from "@/lib/api";
import { subscribeToTable } from "@/lib/supabase";
import type { Assessment, CaregiverNote } from "@/lib/types";

const NestScene3D = dynamic(
  () => import("@/components/nest/nest-scene-3d").then((m) => m.NestScene3D),
  { ssr: false }
);

const PATIENT_ID = process.env.NEXT_PUBLIC_DEMO_PATIENT_ID || "";

function riskToStatus(score: number): "green" | "yellow" | "red" {
  if (score > 60) return "red";
  if (score >= 30) return "yellow";
  return "green";
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "Recently";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);

  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) {
    const hrs = Math.floor(diffHrs);
    return `${hrs}h ago`;
  }

  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return `Today, ${d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" })}`;
  }

  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function assessmentToHistoryItem(a: Assessment): HistoryItem {
  return {
    id: a.id,
    date: formatTimestamp(a.created_at),
    status: riskToStatus(a.risk_score),
    summary: a.caregiver_summary || "No summary available.",
  };
}

function CaregiverPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");

  const handleBack = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => router.push("/?from=nest"), 500);
  }, [router]);

  const [signal, setSignal] = useState<{
    status: "green" | "yellow" | "red";
    summary: string;
    timestamp: string;
  }>({
    status: "green",
    summary: "Loading Margaret's latest update...",
    timestamp: "",
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [notes, setNotes] = useState<Array<{ author: string; content: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  const notesRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    if (!PATIENT_ID) return;

    const fetchData = async () => {
      try {
        // Fetch independently so one failure doesn't block the others
        const [summaryResult, historyResult, profileResult] = await Promise.allSettled([
          api.getPatientSummary(PATIENT_ID),
          api.getPatientHistory(PATIENT_ID),
          api.getPatientProfile(PATIENT_ID),
        ]);

        if (summaryResult.status === "fulfilled") {
          const summaryData = summaryResult.value as {
            caregiver_summary?: string;
            risk_score?: number;
            created_at?: string;
          };
          setSignal({
            status: riskToStatus(summaryData.risk_score ?? 0),
            summary: summaryData.caregiver_summary || "No assessment data available yet. Readings will appear here once Margaret logs her vitals.",
            timestamp: formatTimestamp(summaryData.created_at ?? null),
          });
        } else {
          setSignal((prev) => ({
            ...prev,
            summary: "No assessment data available yet. Readings will appear here once Margaret logs her vitals.",
          }));
        }

        if (historyResult.status === "fulfilled") {
          const assessments = historyResult.value as Assessment[];
          setHistory(assessments.map(assessmentToHistoryItem));
        }

        if (profileResult.status === "fulfilled") {
          const profile = profileResult.value as { caregiver_notes?: CaregiverNote[] };
          if (profile.caregiver_notes) {
            setNotes(profile.caregiver_notes.map((n) => ({
              author: n.author,
              content: n.content,
              created_at: n.created_at || new Date().toISOString(),
            })));
          }
        }
      } catch {
        // All failed
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Subscribe to Supabase Realtime for live assessment updates
  useEffect(() => {
    if (!PATIENT_ID) return;

    const channel = subscribeToTable(
      "assessments",
      `patient_id=eq.${PATIENT_ID}`,
      (payload) => {
        const record = payload as { new?: Assessment };
        if (record.new) {
          const a = record.new;
          setSignal({
            status: riskToStatus(a.risk_score),
            summary: a.caregiver_summary || "New update received.",
            timestamp: formatTimestamp(a.created_at),
          });
          setHistory((prev) => [assessmentToHistoryItem(a), ...prev]);
        }
      },
    );

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleNoteSubmit = useCallback(async (noteText: string) => {
    if (!PATIENT_ID) return;

    const author = "Sarah Santos";
    try {
      await api.postNote(PATIENT_ID, { author, content: noteText });
    } catch {
      // Silently fail for demo
    }

    setNotes((prev) => [
      { author, content: noteText, created_at: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const scrollToNotes = () => {
    notesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 3D Nest Scene Background */}
      <NestScene3D timeOfDay={timeOfDay} />

      {/* Time of day toggle */}
      <TimeToggle timeOfDay={timeOfDay} onChange={setTimeOfDay} />

      {/* Back button */}
      <div className="absolute top-4 md:top-6 left-4 md:left-6 z-20">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-lg cursor-pointer hover:bg-white/80 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>
      </div>

      {/* Exit fade overlay */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            className="fixed inset-0 bg-white z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-800/90 backdrop-blur-sm text-amber-100 text-sm font-semibold mb-3 border border-amber-700/50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              LIVE MONITORING
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg">
              The Nest
            </h1>
            <p className="text-white/90 drop-shadow">
              Looking over Margaret. Real-time wellness updates for your peace of mind.
            </p>
          </div>
        </BlurFade>

        {/* Daily Signal Hero */}
        <BlurFade delay={0.2} inView>
          <div className="mb-8">
            {loading ? (
              <div className="p-8 rounded-2xl bg-white/95 border border-slate-200 shadow-lg text-center">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Loading latest update...</p>
              </div>
            ) : (
              <DailySignal
                status={signal.status}
                summary={signal.summary}
                timestamp={signal.timestamp}
                patientName="Margaret"
              />
            )}
          </div>
        </BlurFade>

        {/* Quick Actions */}
        <BlurFade delay={0.3} inView>
          <div className="grid grid-cols-3 gap-3 mb-8">
            <motion.a
              href="tel:+1-647-555-0123"
              className="relative overflow-hidden p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-md text-center group hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <Phone className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
              <span className="text-sm font-medium text-slate-800">Call Mum</span>
            </motion.a>
            <motion.button
              onClick={scrollToNotes}
              className="relative overflow-hidden p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-md text-center group hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <MessageSquarePlus className="w-6 h-6 mx-auto mb-1 text-blue-500" />
              <span className="text-sm font-medium text-slate-800">Add Note</span>
            </motion.button>
            <motion.button
              onClick={scrollToHistory}
              className="relative overflow-hidden p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-md text-center group hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-violet-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <History className="w-6 h-6 mx-auto mb-1 text-purple-500" />
              <span className="text-sm font-medium text-slate-800">View History</span>
            </motion.button>
          </div>
        </BlurFade>

        {/* Notes Section */}
        <BlurFade delay={0.4} inView>
          <div className="mb-8" ref={notesRef}>
            <CaregiverNotes onSubmit={handleNoteSubmit} />
            {notes.length > 0 && (
              <div className="mt-3 space-y-2">
                {notes.map((n, i) => (
                  <motion.div
                    key={`${n.created_at}-${i}`}
                    className="p-3 rounded-xl bg-white/95 border border-slate-200 text-sm text-slate-800"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-xs text-amber-600 font-medium">
                      {n.author}, {formatTimestamp(n.created_at)}
                    </span>
                    <p className="mt-1">{n.content}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </BlurFade>

        {/* History */}
        <BlurFade delay={0.5} inView>
          <div ref={historyRef}>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto mb-2" />
                <p className="text-sm text-white/50">Loading history...</p>
              </div>
            ) : history.length > 0 ? (
              <HistoryView items={history} />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-white/50">No history yet. Updates will appear here as Margaret logs her vitals.</p>
              </div>
            )}
          </div>
        </BlurFade>
      </div>
    </main>
  );
}

export default CaregiverPage;
