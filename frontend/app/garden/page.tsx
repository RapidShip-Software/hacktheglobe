"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Heart, SmilePlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AuroraBackground } from "@/components/garden/aurora-background";
import { HealthPlant } from "@/components/garden/health-plant";
import { ButterflyContact } from "@/components/garden/butterfly-contact";
import { MedicationReminder } from "@/components/garden/medication-reminder";
import { GardenGate } from "@/components/garden/garden-gate";
import { BpEntryFlow } from "@/components/garden/bp-entry-flow";
import { BlurFade } from "@/components/shared/blur-fade";
import { api } from "@/lib/api";
import { subscribeToTable } from "@/lib/supabase";
import type { Contact, Medication, GardenState } from "@/lib/types";

const PATIENT_ID = process.env.NEXT_PUBLIC_DEMO_PATIENT_ID || "";

const MARGARET_CONTACTS: Contact[] = [
  { name: "Sarah Chen", relation: "Daughter", phone: "+1-647-555-0123", avatar: "butterfly_blue" },
  { name: "Dr. Patel", relation: "GP", phone: "+1-416-555-0456", avatar: "robin_red" },
  { name: "James Chen", relation: "Son", phone: "+1-905-555-0789", avatar: "butterfly_green" },
];

const MARGARET_MEDICATIONS: Medication[] = [
  { name: "Lisinopril", dosage: "10mg", schedule: "morning", purpose: "Blood pressure" },
  { name: "Metformin", dosage: "500mg", schedule: "morning_evening", purpose: "Diabetes" },
  { name: "Acetaminophen", dosage: "500mg", schedule: "as_needed", purpose: "Pain management" },
];

function GardenPage() {
  const [gardenState, setGardenState] = useState<GardenState>({
    plant_health: 0.75,
    sky: "clear",
    nudge: true,
  });
  const [showMedReminder, setShowMedReminder] = useState(true);
  const [showBpEntry, setShowBpEntry] = useState(false);
  const [nudgeText, setNudgeText] = useState("Good morning Margaret! Your garden looks lovely today.");
  const [currentMedIndex, setCurrentMedIndex] = useState(0);

  // Fetch latest assessment on mount
  useEffect(() => {
    if (!PATIENT_ID) return;

    api.getPatientSummary(PATIENT_ID).then((data) => {
      const summary = data as { garden_state?: GardenState; caregiver_summary?: string };
      if (summary.garden_state) {
        setGardenState(summary.garden_state);
      }
      if (summary.caregiver_summary) {
        const short = summary.caregiver_summary.slice(0, 120);
        setNudgeText(short);
      }
    }).catch(() => {
      // Fallback to defaults if API is unavailable
    });
  }, []);

  // Subscribe to Supabase Realtime for assessments
  useEffect(() => {
    if (!PATIENT_ID) return;

    const channel = subscribeToTable(
      "assessments",
      `patient_id=eq.${PATIENT_ID}`,
      (payload) => {
        const record = payload as { new?: { garden_state?: GardenState; caregiver_summary?: string } };
        if (record.new?.garden_state) {
          setGardenState(record.new.garden_state);
        }
        if (record.new?.caregiver_summary) {
          const short = record.new.caregiver_summary.slice(0, 120);
          setNudgeText(short);
        }
      },
    );

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleTakeMedication = useCallback(async () => {
    setShowMedReminder(false);
    const med = MARGARET_MEDICATIONS[currentMedIndex];

    setNudgeText(`Well done! ${med.name} logged. Your garden is blooming.`);
    setGardenState((prev) => ({
      ...prev,
      plant_health: Math.min(1, prev.plant_health + 0.05),
      nudge: false,
    }));

    // POST to API
    if (PATIENT_ID) {
      try {
        await api.postReading({
          patient_id: PATIENT_ID,
          type: "medication",
          value: { taken: true, medication_name: med.name },
        });
      } catch {
        // Silently fail for demo, garden already updated optimistically
      }
    }

    // Cycle to next medication and show reminder again
    setTimeout(() => {
      setCurrentMedIndex((prev) => (prev + 1) % MARGARET_MEDICATIONS.length);
      setShowMedReminder(true);
    }, 15000);
  }, [currentMedIndex]);

  const handleBpSubmit = useCallback(async (systolic: number, diastolic: number) => {
    setNudgeText(`Blood pressure logged: ${systolic}/${diastolic}. Thank you, Margaret!`);

    if (PATIENT_ID) {
      try {
        await api.postReading({
          patient_id: PATIENT_ID,
          type: "bp",
          value: { systolic, diastolic },
        });
      } catch {
        // Silently fail for demo
      }
    }
  }, []);

  const handleCheckin = useCallback(async () => {
    setNudgeText("Check-in logged! Your garden appreciates you.");
    setGardenState((prev) => ({
      ...prev,
      plant_health: Math.min(1, prev.plant_health + 0.03),
    }));

    if (PATIENT_ID) {
      try {
        await api.postReading({
          patient_id: PATIENT_ID,
          type: "checkin",
          value: { mood: "good", note: "Daily check-in" },
        });
      } catch {
        // Silently fail
      }
    }
  }, []);

  return (
    <AuroraBackground skyState={gardenState.sky} health={gardenState.plant_health}>
      {/* Nudge text */}
      <div className="pt-8 px-6 text-center">
        <BlurFade delay={0.3} inView>
          <motion.p
            key={nudgeText}
            className="text-lg md:text-xl font-medium text-gray-700/80 max-w-lg mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {nudgeText}
          </motion.p>
        </BlurFade>
      </div>

      {/* Health tag — floating above the plant (center of scene) */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{ bottom: "38%" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-sm shadow-lg border border-white/20">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{
              backgroundColor:
                gardenState.plant_health > 0.7
                  ? "#22c55e"
                  : gardenState.plant_health > 0.4
                  ? "#eab308"
                  : "#ef4444",
            }}
          />
          <span className="text-sm font-bold text-white tracking-wide">
            {gardenState.plant_health > 0.7
              ? "Blooming"
              : gardenState.plant_health > 0.4
              ? "Growing"
              : "Wilting"}
          </span>
        </div>
      </motion.div>

      {/* DEBUG: Health slider */}
      <div className="absolute top-20 left-6 z-30 bg-black/50 backdrop-blur-sm rounded-xl p-3 flex flex-col gap-1">
        <label className="text-white text-xs font-bold">Health: {gardenState.plant_health.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={gardenState.plant_health}
          onChange={(e) => setGardenState((prev) => ({ ...prev, plant_health: parseFloat(e.target.value) }))}
          className="w-40 accent-green-500"
        />
        <div className="flex gap-1 mt-1">
          {[0, 0.15, 0.3, 0.5, 0.7, 0.9, 1].map((v) => (
            <button
              key={v}
              onClick={() => setGardenState((prev) => ({ ...prev, plant_health: v }))}
              className="text-[10px] px-1.5 py-0.5 bg-white/20 text-white rounded hover:bg-white/40"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons (floating, top-left) */}
      <div className="absolute top-6 left-6 z-20 flex gap-2">
        <Link
          href="/"
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-lg cursor-pointer hover:bg-white/80 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <motion.button
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-lg"
          onClick={() => setShowBpEntry(true)}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart className="w-5 h-5 text-rose-500" />
          <span className="text-sm font-semibold text-gray-700">Log BP</span>
        </motion.button>
        <motion.button
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-lg"
          onClick={handleCheckin}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)" }}
          whileTap={{ scale: 0.95 }}
        >
          <SmilePlus className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-semibold text-gray-700">Check In</span>
        </motion.button>
      </div>

      {/* Grass / ground */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-600/30 via-green-500/15 to-transparent pointer-events-none" />

      {/* Butterfly Contacts */}
      <ButterflyContact contact={MARGARET_CONTACTS[0]} position="left" />
      <ButterflyContact contact={MARGARET_CONTACTS[1]} position="center" />
      <ButterflyContact contact={MARGARET_CONTACTS[2]} position="right" />

      {/* Garden Gate (AI Help) */}
      <GardenGate patientName="Margaret" />

      {/* Medication Reminder (bottom slide-up) */}
      <MedicationReminder
        medication={MARGARET_MEDICATIONS[currentMedIndex]}
        onTake={handleTakeMedication}
        visible={showMedReminder}
      />

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
