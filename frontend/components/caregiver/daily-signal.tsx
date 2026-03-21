"use client";

import { motion } from "framer-motion";
import { ShineBorder } from "@/components/shared/shine-border";

type DailySignalProps = {
  status: "green" | "yellow" | "red";
  summary: string;
  timestamp: string;
  patientName: string;
};

const statusConfig = {
  green: {
    emoji: "🟢",
    label: "All Clear",
    gradient: "from-emerald-400 to-green-500",
    shineColours: ["#4ade80", "#22c55e", "#86efac"],
    bg: "bg-emerald-50",
    text: "text-emerald-800",
  },
  yellow: {
    emoji: "🟡",
    label: "Needs Attention",
    gradient: "from-amber-400 to-yellow-500",
    shineColours: ["#fbbf24", "#f59e0b", "#fde68a"],
    bg: "bg-amber-50",
    text: "text-amber-800",
  },
  red: {
    emoji: "🔴",
    label: "Alert",
    gradient: "from-red-400 to-rose-500",
    shineColours: ["#f87171", "#ef4444", "#fca5a5"],
    bg: "bg-red-50",
    text: "text-red-800",
  },
};

function DailySignal({ status, summary, timestamp, patientName }: DailySignalProps) {
  const config = statusConfig[status];

  return (
    <ShineBorder
      borderRadius={20}
      borderWidth={2}
      duration={8}
      color={config.shineColours}
      className="w-full"
    >
      <div className={`p-6 md:p-8 rounded-[18px] ${config.bg}`}>
        <div className="flex items-start gap-4">
          <motion.span
            className="text-4xl md:text-5xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {config.emoji}
          </motion.span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold uppercase tracking-wider ${config.text}`}>
                {config.label}
              </span>
              <span className="text-xs text-gray-400">
                {timestamp}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
              {patientName}&apos;s Daily Update
            </h2>
            <p className="text-base text-gray-600 leading-relaxed">
              {summary}
            </p>
          </div>
        </div>
      </div>
    </ShineBorder>
  );
}

export { DailySignal };
