"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type BpEntryFlowProps = {
  onSubmit: (systolic: number, diastolic: number) => void;
  visible: boolean;
  onClose: () => void;
};

const SYSTOLIC_PRESETS = [110, 115, 120, 125, 130, 135, 140, 145, 150];
const DIASTOLIC_PRESETS = [65, 70, 75, 80, 85, 90, 95];

function BpEntryFlow({ onSubmit, visible, onClose }: BpEntryFlowProps) {
  const [step, setStep] = useState<"systolic" | "diastolic" | "confirm">("systolic");
  const [systolic, setSystolic] = useState<number | null>(null);
  const [diastolic, setDiastolic] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleReset = () => {
    setStep("systolic");
    setSystolic(null);
    setDiastolic(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleConfirm = async () => {
    if (systolic && diastolic) {
      setSubmitting(true);
      await onSubmit(systolic, diastolic);
      handleReset();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4"
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 30 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {step === "systolic" && "Top Number (Systolic)"}
                {step === "diastolic" && "Bottom Number (Diastolic)"}
                {step === "confirm" && "Confirm Reading"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {step === "systolic" && "Tap the number closest to your reading"}
                {step === "diastolic" && "Now tap the bottom number"}
                {step === "confirm" && "Does this look right?"}
              </p>
            </div>

            {/* Systolic step */}
            {step === "systolic" && (
              <motion.div
                className="grid grid-cols-3 gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {SYSTOLIC_PRESETS.map((val) => (
                  <motion.button
                    key={val}
                    onClick={() => {
                      setSystolic(val);
                      setStep("diastolic");
                    }}
                    className="py-4 rounded-2xl text-xl font-bold text-gray-700 bg-gray-50 border-2 border-gray-200 hover:border-rose-400 hover:bg-rose-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {val}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Diastolic step */}
            {step === "diastolic" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="text-center mb-3 text-lg text-gray-600">
                  Top: <span className="font-bold text-rose-500">{systolic}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {DIASTOLIC_PRESETS.map((val) => (
                    <motion.button
                      key={val}
                      onClick={() => {
                        setDiastolic(val);
                        setStep("confirm");
                      }}
                      className="py-4 rounded-2xl text-xl font-bold text-gray-700 bg-gray-50 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {val}
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={() => setStep("systolic")}
                  className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Go back
                </button>
              </motion.div>
            )}

            {/* Confirm step */}
            {step === "confirm" && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="py-6">
                  <div className="text-5xl font-bold text-gray-800">
                    <span className="text-rose-500">{systolic}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-blue-500">{diastolic}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">mmHg</p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => {
                      setStep("systolic");
                      setSystolic(null);
                      setDiastolic(null);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-lg hover:bg-gray-200 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    Redo
                  </motion.button>
                  <motion.button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {submitting ? "Logging..." : "Log It"}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors text-sm"
            >
              x
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { BpEntryFlow };
