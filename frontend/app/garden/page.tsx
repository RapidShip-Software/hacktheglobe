"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Heart, SmilePlus } from "lucide-react";
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
    <AuroraBackground skyState={gardenState.sky}>
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

      {/* Health Plant (centre) */}
      <div className="flex-1 flex items-center justify-center">
        <BlurFade delay={0.5} inView>
          <HealthPlant health={gardenState.plant_health} />
          {/* Health indicator */}
          <motion.div
            className="text-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-sm">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor:
                    gardenState.plant_health > 0.7
                      ? "#22c55e"
                      : gardenState.plant_health > 0.4
                      ? "#eab308"
                      : "#ef4444",
                }}
              />
              <span className="text-xs font-medium text-gray-600">
                {gardenState.plant_health > 0.7
                  ? "Blooming"
                  : gardenState.plant_health > 0.4
                  ? "Needs care"
                  : "Wilting"}
              </span>
            </div>
          </motion.div>
        </BlurFade>
      </div>

      {/* Action buttons (floating, top-left) */}
      <div className="absolute top-6 left-6 z-20 flex gap-2">
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
