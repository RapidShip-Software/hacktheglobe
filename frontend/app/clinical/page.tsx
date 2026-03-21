"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BlurFade } from "@/components/shared/blur-fade";
import { cn } from "@/lib/utils";

// Demo patients
const DEMO_PATIENTS = [
  {
    id: "1",
    name: "Margaret Chen",
    age: 74,
    risk_score: 52,
    conditions: ["Hypertension", "Type 2 Diabetes", "Post-hip replacement"],
    latest_summary: "Blood pressure elevated for 2 days. Missed evening medication. Reduced activity noted.",
    readings: [
      { date: "Mar 21", bp: "145/90", meds: "Missed morning", activity: "Low", mood: "Fair" },
      { date: "Mar 20", bp: "142/88", meds: "Missed evening", activity: "Moderate", mood: "Good" },
      { date: "Mar 19", bp: "135/85", meds: "All taken", activity: "Normal", mood: "Good" },
      { date: "Mar 18", bp: "128/82", meds: "All taken", activity: "Normal", mood: "Great" },
      { date: "Mar 17", bp: "125/80", meds: "All taken", activity: "Active", mood: "Great" },
      { date: "Mar 16", bp: "124/79", meds: "All taken", activity: "Normal", mood: "Good" },
      { date: "Mar 15", bp: "126/80", meds: "All taken", activity: "Active", mood: "Great" },
    ],
    risk_narrative: "Margaret's blood pressure has shown a steady increase over the past 3 days, coinciding with missed medication doses. Her activity level has also decreased. This pattern suggests potential non-adherence risk that should be addressed through a caregiver check-in and medication schedule review.",
    alert: {
      level: "warning" as const,
      title: "Elevated Blood Pressure Trend",
      recommended_action: "Schedule a video call with Dr. Patel. Review medication adherence with caregiver Sarah Chen.",
    },
  },
  {
    id: "2",
    name: "Robert Williams",
    age: 81,
    risk_score: 18,
    conditions: ["COPD", "Mild cognitive impairment"],
    latest_summary: "All vitals stable. Medications taken on schedule.",
    readings: [],
    risk_narrative: "Robert is maintaining stable health indicators. No concerns at this time.",
    alert: null,
  },
  {
    id: "3",
    name: "Evelyn Park",
    age: 69,
    risk_score: 8,
    conditions: ["Post-knee replacement", "Anxiety"],
    latest_summary: "Recovery progressing well. Physiotherapy exercises completed daily.",
    readings: [],
    risk_narrative: "Evelyn continues to show excellent recovery progress.",
    alert: null,
  },
];

function getRiskBadge(score: number) {
  if (score > 60) return { colour: "bg-red-100 text-red-700 border-red-200", label: "High" };
  if (score > 30) return { colour: "bg-amber-100 text-amber-700 border-amber-200", label: "Medium" };
  return { colour: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Low" };
}

function ClinicalPage() {
  const [selectedPatient, setSelectedPatient] = useState(DEMO_PATIENTS[0]);

  return (
    <main className="min-h-screen bg-clinical-bg flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col relative">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
              C
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Canopy Clinical</h1>
              <p className="text-xs text-gray-400">Patient monitoring</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full px-4 py-2.5 pl-9 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Patient list */}
        <div className="relative flex-1 overflow-y-auto p-3 space-y-1">
          {DEMO_PATIENTS.map((patient, i) => {
            const badge = getRiskBadge(patient.risk_score);
            const isSelected = selectedPatient.id === patient.id;
            return (
              <motion.button
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={cn(
                  "w-full text-left p-4 rounded-xl transition-all duration-200",
                  isSelected
                    ? "bg-teal-50 border border-teal-200 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent",
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800 text-sm">{patient.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.colour}`}>
                    {patient.risk_score}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {patient.age}y &middot; {patient.conditions[0]}
                </p>
              </motion.button>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Alert banner */}
        {selectedPatient.alert && selectedPatient.risk_score > 40 && (
          <motion.div
            className="m-6 mb-0 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="flex items-start gap-3">
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ⚠️
              </motion.span>
              <div>
                <h3 className="font-bold text-amber-800 mb-1">{selectedPatient.alert.title}</h3>
                <p className="text-sm text-amber-700 mb-2">{selectedPatient.alert.recommended_action}</p>
                <div className="flex gap-2">
                  <motion.button
                    className="px-4 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Take Action
                  </motion.button>
                  <button className="px-4 py-1.5 rounded-lg bg-white text-amber-700 text-xs font-semibold border border-amber-200 hover:bg-amber-50 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="p-6">
          {/* Patient header */}
          <BlurFade delay={0.1} inView>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {selectedPatient.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                <p className="text-sm text-gray-500">
                  {selectedPatient.age} years &middot; {selectedPatient.conditions.join(", ")}
                </p>
              </div>
              <div className="ml-auto">
                {(() => {
                  const badge = getRiskBadge(selectedPatient.risk_score);
                  return (
                    <div className={`px-4 py-2 rounded-xl border ${badge.colour} text-center`}>
                      <div className="text-2xl font-bold">{selectedPatient.risk_score}</div>
                      <div className="text-[10px] font-semibold uppercase">{badge.label} Risk</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </BlurFade>

          {/* Risk Narrative */}
          <BlurFade delay={0.2} inView>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Risk Assessment</h3>
              <p className="text-gray-700 leading-relaxed">{selectedPatient.risk_narrative}</p>
            </div>
          </BlurFade>

          {/* Readings Table */}
          {selectedPatient.readings.length > 0 && (
            <BlurFade delay={0.3} inView>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="p-5 pb-0">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">7-Day Readings</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase">Date</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase">Blood Pressure</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase">Medications</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase">Activity</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase">Mood</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPatient.readings.map((r, i) => (
                        <motion.tr
                          key={i}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                        >
                          <td className="py-3 px-5 font-medium text-gray-700">{r.date}</td>
                          <td className={cn("py-3 px-5", r.bp > "140" ? "text-red-600 font-semibold" : "text-gray-700")}>{r.bp}</td>
                          <td className={cn("py-3 px-5", r.meds.includes("Missed") ? "text-amber-600" : "text-gray-700")}>{r.meds}</td>
                          <td className="py-3 px-5 text-gray-700">{r.activity}</td>
                          <td className="py-3 px-5 text-gray-700">{r.mood}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </BlurFade>
          )}

          {/* Risk score mini chart placeholder */}
          <BlurFade delay={0.4} inView>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Risk Score Trend</h3>
              <div className="flex items-end gap-2 h-32">
                {[12, 15, 14, 18, 28, 42, 52].map((score, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-lg"
                    style={{
                      backgroundColor:
                        score > 60 ? "#ef4444" : score > 30 ? "#f59e0b" : "#10b981",
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(score / 70) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                  />
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {["Mar 15", "16", "17", "18", "19", "20", "21"].map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] text-gray-400">{d}</span>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </main>
  );
}

export default ClinicalPage;
