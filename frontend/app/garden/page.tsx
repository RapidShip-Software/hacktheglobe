"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, SmilePlus, ArrowLeft, Check, Pill, ClipboardList, Users } from "lucide-react";
import { AuroraBackground } from "@/components/garden/aurora-background";
import { ButterflyContact } from "@/components/garden/butterfly-contact";
import { GardenGate } from "@/components/garden/garden-gate";
import { BpEntryFlow } from "@/components/garden/bp-entry-flow";
import { BlurFade } from "@/components/shared/blur-fade";
import { api } from "@/lib/api";
import { subscribeToTable } from "@/lib/supabase";
import type { Contact, Medication, GardenState } from "@/lib/types";

const PATIENT_ID = process.env.NEXT_PUBLIC_DEMO_PATIENT_ID || "";

const MARGARET_CONTACTS: Contact[] = [
  { name: "Sarah Santos", relation: "Daughter", phone: "+1-647-555-0123", avatar: "butterfly_blue" },
  { name: "Dr. Patel", relation: "GP", phone: "+1-416-555-0456", avatar: "robin_red" },
  { name: "James Santos", relation: "Son", phone: "+1-905-555-0789", avatar: "butterfly_green" },
];

const MARGARET_MEDICATIONS: Medication[] = [
  { name: "Lisinopril", dosage: "10mg", schedule: "morning", purpose: "Blood pressure" },
  { name: "Metformin", dosage: "500mg", schedule: "morning_evening", purpose: "Diabetes" },
  { name: "Acetaminophen", dosage: "500mg", schedule: "as_needed", purpose: "Pain management" },
];

type ChecklistItem = {
  id: string;
  label: string;
  sublabel: string;
  icon: "pill" | "heart" | "checkin";
  done: boolean;
};

function GardenPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleBack = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => router.push("/?from=garden"), 500);
  }, [router]);

  const [gardenState, setGardenState] = useState<GardenState>({
    plant_health: 0.75,
    sky: "clear",
    nudge: true,
  });
  const [showBpEntry, setShowBpEntry] = useState(false);
  const [nudgeText, setNudgeText] = useState("Good morning Margaret! Your garden looks lovely today.");
  const [mobilePanel, setMobilePanel] = useState<"none" | "tasks" | "contacts">("none");

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "med-lisinopril", label: "Lisinopril 10mg", sublabel: "Blood pressure", icon: "pill", done: false },
    { id: "med-metformin-am", label: "Metformin 500mg", sublabel: "Morning dose", icon: "pill", done: false },
    { id: "bp", label: "Log Blood Pressure", sublabel: "Tap to record", icon: "heart", done: false },
    { id: "checkin", label: "Daily Check-in", sublabel: "How are you feeling?", icon: "checkin", done: false },
    { id: "med-metformin-pm", label: "Metformin 500mg", sublabel: "Evening dose", icon: "pill", done: false },
  ]);

  useEffect(() => {
    if (!PATIENT_ID) return;
    api.getPatientSummary(PATIENT_ID).then((data) => {
      const summary = data as { garden_state?: GardenState; caregiver_summary?: string };
      if (summary.garden_state) setGardenState(summary.garden_state);
      if (summary.caregiver_summary) setNudgeText(summary.caregiver_summary);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!PATIENT_ID) return;
    const channel = subscribeToTable(
      "assessments",
      `patient_id=eq.${PATIENT_ID}`,
      (payload) => {
        const record = payload as { new?: { garden_state?: GardenState; caregiver_summary?: string } };
        if (record.new?.garden_state) setGardenState(record.new.garden_state);
        if (record.new?.caregiver_summary) setNudgeText(record.new.caregiver_summary);
      },
    );
    return () => { channel.unsubscribe(); };
  }, []);

  const markDone = useCallback((id: string) => {
    setChecklist((prev) => prev.map((item) => item.id === id ? { ...item, done: true } : item));
  }, []);

  const handleChecklistTap = useCallback(async (item: ChecklistItem) => {
    if (item.done) return;

    if (item.id === "bp") {
      setShowBpEntry(true);
      setMobilePanel("none");
      return;
    }

    markDone(item.id);

    if (item.icon === "pill") {
      const medName = item.label.split(" ")[0];
      setNudgeText(`Well done! ${medName} logged. Your garden is blooming.`);
      setGardenState((prev) => ({ ...prev, plant_health: Math.min(1, prev.plant_health + 0.05) }));
      if (PATIENT_ID) {
        try {
          await api.postReading({ patient_id: PATIENT_ID, type: "medication", value: { taken: true, medication_name: medName } });
        } catch {}
      }
    } else if (item.id === "checkin") {
      setNudgeText("Check-in logged! Your garden appreciates you.");
      setGardenState((prev) => ({ ...prev, plant_health: Math.min(1, prev.plant_health + 0.03) }));
      if (PATIENT_ID) {
        try {
          await api.postReading({ patient_id: PATIENT_ID, type: "checkin", value: { mood: "good", note: "Daily check-in" } });
        } catch {}
      }
    }
  }, [markDone]);

  const handleBpSubmit = useCallback(async (systolic: number, diastolic: number) => {
    markDone("bp");
    setNudgeText(`Blood pressure logged: ${systolic}/${diastolic}. Thank you, Margaret!`);
    if (PATIENT_ID) {
      try {
        await api.postReading({ patient_id: PATIENT_ID, type: "bp", value: { systolic, diastolic } });
      } catch {}
    }
  }, [markDone]);

  const completedCount = checklist.filter((i) => i.done).length;

  const iconMap = {
    pill: Pill,
    heart: Heart,
    checkin: SmilePlus,
  };

  const checklistContent = (
    <div className="bg-white/15 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl p-3 md:p-4 flex flex-col max-h-[70vh] md:max-h-full md:h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base md:text-lg font-bold text-white drop-shadow">Today&apos;s Tasks</h2>
        <span className="text-xs font-semibold text-white/60 bg-white/10 px-2.5 py-0.5 rounded-full">
          {completedCount}/{checklist.length}
        </span>
      </div>

      <div className="w-full h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
          animate={{ width: `${(completedCount / checklist.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {checklist.map((item, i) => {
          const Icon = iconMap[item.icon];
          return (
            <motion.button
              key={item.id}
              onClick={() => handleChecklistTap(item)}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl transition-all text-left ${
                item.done
                  ? "bg-emerald-500/20 border border-emerald-400/30"
                  : "bg-white/10 border border-white/15 hover:bg-white/20 active:scale-[0.97]"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                item.done
                  ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                  : "bg-white/15 border border-white/20"
              }`}>
                {item.done ? (
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
                ) : (
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/70" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${item.done ? "text-emerald-200 line-through" : "text-white"}`}>
                  {item.label}
                </p>
                <p className={`text-xs truncate ${item.done ? "text-emerald-300/60" : "text-white/50"}`}>
                  {item.sublabel}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {completedCount === checklist.length && (
        <motion.div
          className="mt-3 text-center py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-emerald-200 font-bold text-sm">All done! Your garden is thriving!</p>
        </motion.div>
      )}
    </div>
  );

  return (
    <AuroraBackground skyState={gardenState.sky} health={gardenState.plant_health}>
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

      {/* Nudge text (top center) */}
      <div className="absolute top-4 md:top-6 left-16 md:left-20 right-4 md:right-20 z-20 text-center">
        <BlurFade delay={0.3} inView>
          <motion.p
            key={nudgeText}
            className="text-xs md:text-lg font-medium text-white/90 max-w-md mx-auto bg-black/30 backdrop-blur-sm rounded-2xl px-3 md:px-5 py-2 md:py-3 shadow-lg border border-white/15"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {nudgeText}
          </motion.p>
        </BlurFade>
      </div>

      {/* Health tag */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-20 bottom-[38%] md:bottom-[38%]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-black/40 backdrop-blur-sm shadow-lg border border-white/20">
          <div
            className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full animate-pulse"
            style={{
              backgroundColor:
                gardenState.plant_health > 0.7 ? "#22c55e"
                  : gardenState.plant_health > 0.4 ? "#eab308"
                  : "#ef4444",
            }}
          />
          <span className="text-xs md:text-sm font-bold text-white tracking-wide">
            {gardenState.plant_health > 0.7 ? "Blooming"
              : gardenState.plant_health > 0.4 ? "Growing"
              : "Wilting"}
          </span>
        </div>
      </motion.div>

      {/* === DESKTOP: Left Checklist Panel (hidden on mobile) === */}
      <div className="hidden md:block absolute left-3 top-20 bottom-3 z-20 w-64 lg:w-72">
        <BlurFade delay={0.2} inView>
          {checklistContent}
        </BlurFade>
      </div>

      {/* === DESKTOP: Right Butterfly Contacts (hidden on mobile) === */}
      <div className="hidden md:flex absolute right-3 top-20 z-20 flex-col gap-3 items-center">
        {MARGARET_CONTACTS.map((contact, i) => (
          <BlurFade key={contact.name} delay={0.4 + i * 0.1} inView>
            <ButterflyContact contact={contact} position="stacked" />
          </BlurFade>
        ))}
      </div>

      {/* === MOBILE: Bottom action bar (visible only on mobile) === */}
      <div className="md:hidden absolute bottom-4 left-4 right-4 z-20 flex gap-2">
        <motion.button
          onClick={() => setMobilePanel(mobilePanel === "tasks" ? "none" : "tasks")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl backdrop-blur-xl border shadow-lg transition-all ${
            mobilePanel === "tasks"
              ? "bg-emerald-500/30 border-emerald-400/40 text-emerald-200"
              : "bg-white/15 border-white/20 text-white"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-sm font-semibold">Tasks ({completedCount}/{checklist.length})</span>
        </motion.button>
        <motion.button
          onClick={() => setMobilePanel(mobilePanel === "contacts" ? "none" : "contacts")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl backdrop-blur-xl border shadow-lg transition-all ${
            mobilePanel === "contacts"
              ? "bg-blue-500/30 border-blue-400/40 text-blue-200"
              : "bg-white/15 border-white/20 text-white"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <Users className="w-5 h-5" />
          <span className="text-sm font-semibold">Family</span>
        </motion.button>
      </div>

      {/* === MOBILE: Slide-up panels === */}
      <AnimatePresence>
        {mobilePanel === "tasks" && (
          <motion.div
            className="md:hidden absolute bottom-20 left-4 right-4 z-30"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {checklistContent}
          </motion.div>
        )}
        {mobilePanel === "contacts" && (
          <motion.div
            className="md:hidden absolute bottom-20 left-4 right-4 z-30"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="bg-white/15 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-4 space-y-3">
              <h2 className="text-lg font-bold text-white drop-shadow mb-2">Family Contacts</h2>
              {MARGARET_CONTACTS.map((contact) => (
                <ButterflyContact key={contact.name} contact={contact} position="stacked" />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Garden Gate (AI Help) */}
      <GardenGate patientName="Margaret" />

      {/* Grass / ground */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-600/30 via-green-500/15 to-transparent pointer-events-none" />

      {/* BP Entry Flow Modal */}
      <BpEntryFlow
        onSubmit={handleBpSubmit}
        visible={showBpEntry}
        onClose={() => setShowBpEntry(false)}
      />
    </AuroraBackground>
  );
}

export default GardenPage;
