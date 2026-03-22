"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { BlurFade } from "@/components/shared/blur-fade";

const TeamScene3D = dynamic(
  () => import("@/components/team/team-scene-3d").then((m) => m.TeamScene3D),
  { ssr: false }
);

const TEAM = [
  {
    name: "Marco A.",
    role: "Innovation Engineer",
    emoji: "🛠️",
    gradient: "from-emerald-400 to-teal-500",
    description: "Backend, AI pipeline, 3D scenes, full-stack architecture.",
  },
  {
    name: "Aahir C.",
    role: "Innovation Engineer",
    emoji: "⚡",
    gradient: "from-blue-400 to-indigo-500",
    description: "Frontend polish, TTS/STT accessibility, UI/UX design.",
  },
  {
    name: "Christie K.",
    role: "Impact Analyst",
    emoji: "📊",
    gradient: "from-amber-400 to-orange-500",
    description: "Product management, pitch deck, SDG alignment, KPI strategy.",
  },
  {
    name: "Rojella Santos",
    role: "Business Strategist",
    emoji: "💼",
    gradient: "from-violet-400 to-purple-500",
    description: "Business model, go-to-market, stakeholder analysis, competitive landscape.",
  },
];

function TeamPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleBack = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => router.push("/?from=team"), 500);
  }, [router]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 3D Campfire Scene */}
      <TeamScene3D />

      {/* Back button */}
      <div className="absolute top-4 md:top-6 left-4 md:left-6 z-20">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg cursor-pointer hover:bg-white/20 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>
      </div>

      {/* Exit fade */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            className="fixed inset-0 bg-white z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-10">
            <motion.p
              className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              RapidShip Software
            </motion.p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-xl mb-3">
              The Team
            </h1>
            <p className="text-base text-white/60 max-w-md mx-auto">
              The humans behind Canopy. Built at Hack the Globe 2026.
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
          {TEAM.map((member, i) => (
            <BlurFade key={member.name} delay={0.2 + i * 0.1} inView>
              <motion.div
                className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-xl"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                  {member.emoji}
                </div>
                <h2 className="text-xl font-extrabold text-white mb-0.5 drop-shadow">{member.name}</h2>
                <p className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-2">{member.role}</p>
                <p className="text-sm text-white/70">{member.description}</p>
              </motion.div>
            </BlurFade>
          ))}
        </div>

        <BlurFade delay={0.7} inView>
          <motion.div
            className="mt-10 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-sm font-semibold text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            Hack the Globe 2026 &middot; Health &amp; Humanity &middot; BCG Toronto
          </motion.div>
        </BlurFade>
      </div>
    </main>
  );
}

export default TeamPage;
