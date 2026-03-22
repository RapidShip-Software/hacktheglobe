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
      <h3 className="text-lg font-semibold text-white drop-shadow mb-4">Recent History</h3>
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
            <div className="absolute left-[11px] top-8 w-0.5 h-full bg-white/20" />
          )}
          {/* Timeline dot */}
          <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-xs">
            {statusEmoji[item.status]}
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/15 hover:border-white/25 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-white/40">{item.date}</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{item.summary}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export { HistoryView };
export type { HistoryItem };
