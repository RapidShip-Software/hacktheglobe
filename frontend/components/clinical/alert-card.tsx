"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { ClinicalAlert } from "@/lib/types";

type AlertCardProps = {
  alert: ClinicalAlert;
  onDismiss: () => void;
  onAction?: () => void;
};

const levelConfig = {
  info: {
    bg: "from-blue-50 to-sky-50",
    border: "border-blue-200",
    title: "text-blue-800",
    text: "text-blue-700",
    button: "bg-blue-500",
    icon: "text-blue-500",
  },
  warning: {
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    title: "text-amber-800",
    text: "text-amber-700",
    button: "bg-amber-500",
    icon: "text-amber-500",
  },
  critical: {
    bg: "from-red-50 to-rose-50",
    border: "border-red-200",
    title: "text-red-800",
    text: "text-red-700",
    button: "bg-red-500",
    icon: "text-red-500",
  },
};

function AlertCard({ alert, onDismiss, onAction }: AlertCardProps) {
  const [acted, setActed] = useState(false);
  const config = levelConfig[alert.level];

  return (
    <motion.div
      className={`m-6 mb-0 p-4 rounded-2xl bg-gradient-to-r ${config.bg} border ${config.border}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <AlertTriangle className={`w-6 h-6 ${config.icon}`} />
        </motion.div>
        <div className="flex-1">
          <h3 className={`font-bold ${config.title} mb-1`}>{alert.title}</h3>
          <p className={`text-sm ${config.text} mb-1`}>{alert.summary}</p>
          <p className={`text-sm ${config.text} mb-2 font-medium`}>{alert.recommended_action}</p>
          {alert.triggers.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {alert.triggers.map((t, i) => (
                <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.border} border`}>
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <motion.button
              className={`px-4 py-1.5 rounded-lg ${acted ? "bg-emerald-500" : config.button} text-white text-xs font-semibold flex items-center gap-1.5`}
              whileHover={{ scale: acted ? 1 : 1.03 }}
              whileTap={{ scale: acted ? 1 : 0.97 }}
              onClick={() => {
                if (acted) return;
                setActed(true);
                onAction?.();
                setTimeout(onDismiss, 2000);
              }}
            >
              {acted ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Action Logged
                </>
              ) : (
                "Take Action"
              )}
            </motion.button>
            <button
              onClick={onDismiss}
              className={`px-4 py-1.5 rounded-lg bg-white ${config.title} text-xs font-semibold border ${config.border} hover:bg-gray-50 transition-colors`}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export { AlertCard };
