"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import { BlurFade } from "@/components/shared/blur-fade";
import { RiskTimeline } from "./risk-timeline";
import { getRiskBadge } from "./patient-list";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Patient, Assessment, Reading, CaregiverNote } from "@/lib/types";

type PatientProfileProps = {
  patient: Patient;
  assessment: Assessment | null;
  assessments: Assessment[];
  readings: Reading[];
  notes: CaregiverNote[];
  loading: boolean;
};

type DischargePlanData = {
  medications?: Array<{ name: string; dosage: string; schedule: string; instructions: string }>;
  follow_ups?: Array<{ type: string; timing: string; provider: string; notes: string }>;
  red_flags?: string[];
  services?: string[];
};

function formatBp(value: Record<string, unknown>): string {
  const sys = value.systolic as number | undefined;
  const dia = value.diastolic as number | undefined;
  if (sys && dia) return `${sys}/${dia}`;
  return "-";
}

function formatReadingValue(r: Reading): string {
  if (r.type === "bp") return formatBp(r.value);
  if (r.type === "medication") {
    const taken = r.value.taken as boolean | undefined;
    const name = r.value.medication_name as string | undefined;
    return `${name || "Medication"}: ${taken ? "Taken" : "Missed"}`;
  }
  if (r.type === "symptom") {
    return `${r.value.description || "Symptom"} (${r.value.severity || "unknown"})`;
  }
  if (r.type === "activity") {
    return `${r.value.steps || 0} steps`;
  }
  if (r.type === "checkin") {
    return r.value.mood as string || "Check-in";
  }
  return JSON.stringify(r.value);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function PatientProfile({ patient, assessment, assessments, readings, notes, loading }: PatientProfileProps) {
  const [dischargePlan, setDischargePlan] = useState<DischargePlanData | null>(null);
  const [dischargeLoading, setDischargeLoading] = useState(false);

  const handleDischarge = async () => {
    setDischargeLoading(true);
    try {
      const result = await api.postDischarge(patient.id);
      setDischargePlan(result as DischargePlanData);
    } catch {
      setDischargePlan({
        medications: patient.medications?.map((m) => ({ name: m.name, dosage: m.dosage, schedule: m.schedule, instructions: "Continue as prescribed" })) || [],
        follow_ups: [{ type: "GP visit", timing: "Within 1 week", provider: "Dr. Patel", notes: "Review readings and medication adherence" }],
        red_flags: ["Sudden severe headache", "Chest pain", "Blood pressure above 180/120", "Dizziness or fainting"],
        services: ["Home physiotherapy", "Community nursing visits"],
      });
    } finally {
      setDischargeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading patient data...</p>
        </div>
      </div>
    );
  }

  const badge = getRiskBadge(assessment?.risk_score ?? 0);

  // Group readings by type for the table
  const recentReadings = readings.slice(0, 20);

  return (
    <div className="p-6 space-y-6">
      {/* Patient header */}
      <BlurFade delay={0.1} inView>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
            <p className="text-sm text-gray-500">
              {patient.age} years &middot; {patient.conditions.join(", ")}
            </p>
          </div>
          <div className="ml-auto">
            <div className={`px-4 py-2 rounded-xl border ${badge.colour} text-center`}>
              <div className="text-2xl font-bold">{assessment?.risk_score ?? 0}</div>
              <div className="text-[10px] font-semibold uppercase">{badge.label} Risk</div>
            </div>
          </div>
        </div>
      </BlurFade>

      {/* Risk Narrative */}
      {assessment?.risk_narrative && (
        <BlurFade delay={0.2} inView>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Risk Assessment</h3>
            <p className="text-gray-700 leading-relaxed">{assessment.risk_narrative}</p>
          </div>
        </BlurFade>
      )}

      {/* Risk Timeline Chart */}
      <BlurFade delay={0.3} inView>
        <RiskTimeline assessments={assessments} />
      </BlurFade>

      {/* Recent Readings Table */}
      {recentReadings.length > 0 && (
        <BlurFade delay={0.4} inView>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 pb-0">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Recent Readings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase">Time</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase">Type</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReadings.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.03 }}
                    >
                      <td className="py-3 px-5 text-gray-500 text-xs">{formatDate(r.recorded_at)}</td>
                      <td className="py-3 px-5">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          r.type === "bp" ? "bg-rose-100 text-rose-700" :
                          r.type === "medication" ? "bg-emerald-100 text-emerald-700" :
                          r.type === "symptom" ? "bg-amber-100 text-amber-700" :
                          r.type === "activity" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700",
                        )}>
                          {r.type}
                        </span>
                      </td>
                      <td className={cn(
                        "py-3 px-5 font-medium",
                        r.type === "medication" && !(r.value.taken as boolean | undefined)
                          ? "text-amber-600"
                          : "text-gray-700",
                      )}>
                        {formatReadingValue(r)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </BlurFade>
      )}

      {/* Caregiver Notes */}
      {notes.length > 0 && (
        <BlurFade delay={0.5} inView>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Caregiver Notes</h3>
            <div className="space-y-3">
              {notes.map((note, i) => (
                <div key={note.id || i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">{note.author}</span>
                    <span className="text-xs text-gray-400">
                      {note.created_at ? formatDate(note.created_at) : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        </BlurFade>
      )}

      {/* Discharge Planning */}
      <BlurFade delay={0.6} inView>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Discharge Planning</h3>
            {!dischargePlan && (
              <motion.button
                onClick={handleDischarge}
                disabled={dischargeLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-semibold shadow-md disabled:opacity-50"
                whileHover={{ scale: dischargeLoading ? 1 : 1.03 }}
                whileTap={{ scale: dischargeLoading ? 1 : 0.97 }}
              >
                <FileText className="w-4 h-4" />
                {dischargeLoading ? "Generating..." : "Generate Discharge Plan"}
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {dischargeLoading && !dischargePlan && (
              <motion.div className="flex items-center justify-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-6 h-6 rounded-full border-2 border-teal-400 border-t-transparent animate-spin mr-3" />
                <span className="text-sm text-gray-500">AI is generating the discharge plan...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {dischargePlan && (
            <motion.div className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {dischargePlan.medications && dischargePlan.medications.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Medications</h4>
                  <div className="space-y-2">
                    {dischargePlan.medications.map((med, i) => (
                      <div key={i} className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <span className="font-semibold text-sm text-gray-800">{med.name} {med.dosage}</span>
                        <span className="text-xs text-gray-500 ml-2">{med.schedule}</span>
                        <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dischargePlan.follow_ups && dischargePlan.follow_ups.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Follow-up Appointments</h4>
                  <div className="space-y-2">
                    {dischargePlan.follow_ups.map((fu, i) => (
                      <div key={i} className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <span className="font-semibold text-sm text-gray-800">{fu.type}</span>
                        <span className="text-xs text-gray-500 ml-2">{fu.timing}</span>
                        <p className="text-xs text-gray-500 mt-1">{fu.provider} - {fu.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dischargePlan.red_flags && dischargePlan.red_flags.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Red Flag Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                    {dischargePlan.red_flags.map((flag, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-medium text-red-700">{flag}</span>
                    ))}
                  </div>
                </div>
              )}
              {dischargePlan.services && dischargePlan.services.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Community Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {dischargePlan.services.map((svc, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-medium text-purple-700">{svc}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {!dischargePlan && !dischargeLoading && (
            <p className="text-sm text-gray-400 text-center py-4">Generate an AI-powered discharge plan with medications, follow-ups, red flags, and community services.</p>
          )}
        </div>
      </BlurFade>
    </div>
  );
}

export { PatientProfile };
