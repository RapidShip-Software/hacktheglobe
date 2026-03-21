"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DailySignal } from "@/components/caregiver/daily-signal";
import { HistoryView, type HistoryItem } from "@/components/caregiver/history-view";
import { CaregiverNotes } from "@/components/caregiver/caregiver-notes";
import { BlurFade } from "@/components/shared/blur-fade";

// Demo data
const DEMO_HISTORY: HistoryItem[] = [
  {
    id: "1",
    date: "Today, 8:30 AM",
    status: "yellow",
    summary: "Margaret's blood pressure has been slightly elevated for the past two days. She missed her evening Metformin yesterday. No immediate concern, but worth a check-in call.",
  },
  {
    id: "2",
    date: "Yesterday, 9:15 AM",
    status: "yellow",
    summary: "Blood pressure reading of 135/85, slightly above normal range. All other vitals stable. Recommended a follow-up if trend continues.",
  },
  {
    id: "3",
    date: "Mar 19, 8:45 AM",
    status: "green",
    summary: "Everything looks great! Margaret took all medications on time, logged a lovely walk in the garden, and her blood pressure is a healthy 125/80.",
  },
  {
    id: "4",
    date: "Mar 18, 9:00 AM",
    status: "green",
    summary: "All readings normal. Margaret completed her morning exercises and reported feeling well. Blood pressure 122/78.",
  },
  {
    id: "5",
    date: "Mar 17, 8:30 AM",
    status: "green",
    summary: "A wonderful day for Margaret! All vitals within range, all medications taken. She mentioned enjoying her physiotherapy session.",
  },
];

function CaregiverPage() {
  const [notes, setNotes] = useState<string[]>([]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white">
      {/* Subtle dot pattern background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-600 text-xs font-semibold mb-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              LIVE MONITORING
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
              Caring for Margaret
            </h1>
            <p className="text-gray-500">
              Real-time wellness updates for your peace of mind
            </p>
          </div>
        </BlurFade>

        {/* Daily Signal Hero */}
        <BlurFade delay={0.2} inView>
          <div className="mb-8">
            <DailySignal
              status="yellow"
              summary="Margaret's blood pressure has been slightly elevated over the past 2 days (142/88 today). She missed her evening Metformin yesterday. No immediate danger, but a check-in call would be helpful. Her garden plant is showing she could use some encouragement."
              timestamp="Today, 8:30 AM"
              patientName="Margaret"
            />
          </div>
        </BlurFade>

        {/* Quick Actions */}
        <BlurFade delay={0.3} inView>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: "📞", label: "Call Mum", colour: "from-green-400 to-emerald-500" },
              { icon: "📝", label: "Add Note", colour: "from-blue-400 to-indigo-500" },
              { icon: "📊", label: "View History", colour: "from-purple-400 to-violet-500" },
            ].map((action) => (
              <motion.button
                key={action.label}
                className="relative overflow-hidden p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 text-center group hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.colour} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <span className="text-2xl block mb-1">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </BlurFade>

        {/* Notes Section */}
        <BlurFade delay={0.4} inView>
          <div className="mb-8">
            <CaregiverNotes
              onSubmit={(note) => setNotes((prev) => [...prev, note])}
            />
            {notes.length > 0 && (
              <div className="mt-3 space-y-2">
                {notes.map((n, i) => (
                  <motion.div
                    key={i}
                    className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-gray-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-xs text-blue-500 font-medium">You, just now</span>
                    <p className="mt-1">{n}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </BlurFade>

        {/* History */}
        <BlurFade delay={0.5} inView>
          <HistoryView items={DEMO_HISTORY} />
        </BlurFade>
      </div>
    </main>
  );
}

export default CaregiverPage;
