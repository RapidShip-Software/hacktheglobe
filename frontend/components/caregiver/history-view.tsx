"use client";

import { motion } from "framer-motion";

type HistoryItem = {
  id: string;
  date: string;
  status: "green" | "yellow" | "red";
  summary: string;
};

type HistoryViewProps = {
  items: HistoryItem[];
};

const statusEmoji = {
  green: "🟢",
  yellow: "🟡",
  red: "🔴",
};

function HistoryView({ items }: HistoryViewProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-extrabold text-white drop-shadow-lg mb-4">Recent History</h3>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          className="relative pl-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          {/* Timeline line */}
          {index < items.length - 1 && (
            <div className="absolute left-[11px] top-8 w-0.5 h-full bg-white/30 shadow-sm" />
          )}
          {/* Timeline dot */}
          <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-white/45 backdrop-blur-md border-2 border-white/50 shadow-md flex items-center justify-center text-xs">
            {statusEmoji[item.status]}
          </div>

          <div className="bg-white/45 backdrop-blur-3xl backdrop-saturate-150 rounded-2xl p-4 border border-white/30 hover:border-white/50 hover:shadow-xl transition-all">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold text-white/80 drop-shadow-sm uppercase tracking-wider">{item.date}</span>
            </div>
            <p className="text-sm font-bold text-white drop-shadow-md leading-relaxed">{item.summary}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export { HistoryView };
export type { HistoryItem };
