"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/garden/aurora-background";
import { HealthPlant } from "@/components/garden/health-plant";
import { ButterflyContact } from "@/components/garden/butterfly-contact";
import { MedicationReminder } from "@/components/garden/medication-reminder";
import { GardenGate } from "@/components/garden/garden-gate";
import { BlurFade } from "@/components/shared/blur-fade";
import type { Contact, Medication, GardenState } from "@/lib/types";

// Demo data (Margaret Chen)
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
  const [nudgeText, setNudgeText] = useState("Good morning Margaret! Your garden looks lovely today 🌿");

  // Simulate real-time updates (in production, this would be Supabase Realtime)
  useEffect(() => {
    const interval = setInterval(() => {
      setGardenState((prev) => ({
        ...prev,
        plant_health: Math.min(1, prev.plant_health + (Math.random() * 0.02 - 0.005)),
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleTakeMedication = () => {
    setShowMedReminder(false);
    setNudgeText("Well done! Medication logged. Your garden is blooming 🌸");
    setGardenState((prev) => ({
      ...prev,
      plant_health: Math.min(1, prev.plant_health + 0.05),
    }));

    // Show reminder again after a bit (demo purposes)
    setTimeout(() => setShowMedReminder(true), 15000);
  };

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

      {/* Health Plant (center) */}
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
        medication={MARGARET_MEDICATIONS[0]}
        onTake={handleTakeMedication}
        visible={showMedReminder}
      />
    </AuroraBackground>
  );
}

export default GardenPage;
