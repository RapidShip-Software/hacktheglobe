"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PatientWithRisk } from "./types";

type PatientListProps = {
  patients: PatientWithRisk[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
};

function getRiskBadge(score: number) {
  if (score > 60) return { colour: "bg-red-100 text-red-700 border-red-200", label: "High" };
  if (score > 30) return { colour: "bg-amber-100 text-amber-700 border-amber-200", label: "Medium" };
  return { colour: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Low" };
}

function PatientList({ patients, selectedId, onSelect, loading }: PatientListProps) {
  const [search, setSearch] = useState("");

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative p-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
            C
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Canopy Clinic</h1>
            <p className="text-xs text-gray-400">Patient monitoring</p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="w-full px-4 py-2.5 pl-9 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto p-3 space-y-1">
        {loading ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
            <p className="text-xs text-gray-400">Loading patients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No patients found.</p>
        ) : (
          filtered.map((patient, i) => {
            const badge = getRiskBadge(patient.risk_score);
            const isSelected = selectedId === patient.id;
            return (
              <motion.button
                key={patient.id}
                onClick={() => onSelect(patient.id)}
                className={cn(
                  "w-full text-left p-4 rounded-xl transition-all duration-200",
                  isSelected
                    ? "bg-teal-50 border border-teal-200 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent",
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800 text-sm">{patient.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.colour}`}>
                    {patient.risk_score}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {patient.age}y &middot; {patient.conditions[0] || "No conditions"}
                </p>
              </motion.button>
            );
          })
        )}
      </div>
    </aside>
  );
}

export { PatientList, getRiskBadge };
