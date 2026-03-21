"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import type { Assessment } from "@/lib/types";

type RiskTimelineProps = {
  assessments: Assessment[];
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
}

function RiskTimeline({ assessments }: RiskTimelineProps) {
  // Reverse to chronological order and take last 14
  const data = [...assessments]
    .reverse()
    .slice(-14)
    .map((a) => ({
      date: formatDate(a.created_at),
      time: formatTime(a.created_at),
      risk_score: a.risk_score,
    }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Risk Score Trend</h3>
        <p className="text-sm text-gray-400 text-center py-8">No assessment data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Risk Score Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value}`, "Risk Score"]}
            labelFormatter={(label: string, payload) => {
              const entry = payload?.[0]?.payload as { time?: string } | undefined;
              return `${label} ${entry?.time || ""}`;
            }}
          />
          <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Alert threshold", fontSize: 10, fill: "#f59e0b", position: "right" }} />
          <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "High risk", fontSize: 10, fill: "#ef4444", position: "right" }} />
          <Area
            type="monotone"
            dataKey="risk_score"
            fill="url(#riskGradient)"
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey="risk_score"
            stroke="#0d9488"
            strokeWidth={2.5}
            dot={{ fill: "#0d9488", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: "#0d9488", stroke: "#fff", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export { RiskTimeline };
