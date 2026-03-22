"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { BlurFade } from "@/components/shared/blur-fade";

const LandingScene3D = dynamic(
  () => import("@/components/landing/landing-scene-3d").then((m) => m.LandingScene3D),
  { ssr: false }
);

const INTERFACES = [
  {
    href: "/garden",
    icon: "🌿",
    title: "The Garden",
    subtitle: "Patient wellness companion",
    description: "A living garden that reflects Margaret's health. Tap butterflies to call family.",
    gradient: "from-emerald-400 to-teal-500",
    bgHover: "group-hover:bg-emerald-50/30",
    border: "hover:border-emerald-300/60",
    shadow: "hover:shadow-emerald-200/30",
  },
  {
    href: "/caregiver",
    icon: "💙",
    title: "Caregiver",
    subtitle: "Family peace of mind",
    description: "Daily green/yellow/red signals. Know how Mum is doing at a glance.",
    gradient: "from-blue-400 to-indigo-500",
    bgHover: "group-hover:bg-blue-50/30",
    border: "hover:border-blue-300/60",
    shadow: "hover:shadow-blue-200/30",
  },
  {
    href: "/clinical",
    icon: "🏥",
    title: "Clinical",
    subtitle: "Healthcare intelligence",
    description: "AI risk alerts, patient timelines, and real-time monitoring dashboards.",
    gradient: "from-teal-400 to-cyan-500",
    bgHover: "group-hover:bg-teal-50/30",
    border: "hover:border-teal-300/60",
    shadow: "hover:shadow-teal-200/30",
  },
];

function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 3D Garden Scene Background */}
      <LandingScene3D />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
        {/* Logo + Title */}
        <BlurFade delay={0.1} inView>
          <motion.div
            className="flex items-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/25">
              🌳
            </div>
            <span className="text-2xl font-bold text-white tracking-wider uppercase drop-shadow-lg">
              Canopy
            </span>
          </motion.div>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-center mb-3 leading-tight drop-shadow-lg">
            <span className="text-white">
              Continuous Care,
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
              Naturally
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <p className="text-sm md:text-base text-white/70 text-center max-w-md mb-14 leading-relaxed drop-shadow">
            Remote care powered by AI, keeping elderly patients healthy at home.
          </p>
        </BlurFade>

        {/* Interface Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {INTERFACES.map((item, index) => (
            <BlurFade key={item.href} delay={0.4 + index * 0.1} inView>
              <Link href={item.href}>
                <motion.div
                  className={`group relative p-8 md:p-10 bg-white/15 backdrop-blur-xl rounded-3xl border border-white/25 ${item.border} ${item.shadow} shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full`}
                  whileHover={{ y: -6, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 rounded-3xl ${item.bgHover} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      {item.icon}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1 drop-shadow">
                      {item.title}
                    </h2>
                    <p className="text-xs font-medium text-white/50 mb-3 uppercase tracking-wider">
                      {item.subtitle}
                    </p>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Arrow */}
                    <div className="mt-6 flex items-center gap-2 text-base font-semibold text-white/50 group-hover:text-white transition-colors">
                      <span>Open</span>
                      <motion.span
                        className="inline-block text-lg"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </BlurFade>
          ))}
        </div>

        {/* Footer badge */}
        <BlurFade delay={0.8} inView>
          <motion.div
            className="mt-12 flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/15 text-xs text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Hack the Globe 2026 &middot; Health &amp; Humanity &middot; BCG Toronto
          </motion.div>
        </BlurFade>
      </div>
    </main>
  );
}

export default HomePage;
