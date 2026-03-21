"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Medication } from "@/lib/types";

type MedicationReminderProps = {
  medication: Medication | null;
  onTake: () => void;
  visible: boolean;
};

function MedicationReminder({ medication, onTake, visible }: MedicationReminderProps) {
  return (
    <AnimatePresence>
      {visible && medication && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-30"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
        >
          <div className="mx-4 mb-4 p-4 bg-white/85 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50">
            <div className="flex items-center gap-4">
              {/* Pill icon */}
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl">💊</span>
              </motion.div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-800">
                  {medication.name} {medication.dosage}
                </p>
                <p className="text-sm text-gray-500">
                  {medication.purpose}
                </p>
              </div>

              {/* Take Now button */}
              <motion.button
                onClick={onTake}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-500/25"
                whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                Take Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { MedicationReminder };
