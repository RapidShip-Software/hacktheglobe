"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BlurFade } from "@/components/shared/blur-fade";

const INTERFACES = [
  {
    href: "/garden",
    icon: "🌿",
    title: "The Garden",
    subtitle: "Patient wellness companion",
    description: "A living garden that reflects Margaret's health. Tap butterflies to call family.",
    gradient: "from-emerald-400 to-teal-500",
    bgHover: "group-hover:bg-emerald-50",
    border: "hover:border-emerald-300",
    shadow: "hover:shadow-emerald-200/50",
  },
  {
    href: "/caregiver",
    icon: "💙",
    title: "Caregiver",
    subtitle: "Family peace of mind",
    description: "Daily green/yellow/red signals. Know how Mum is doing at a glance.",
    gradient: "from-blue-400 to-indigo-500",
    bgHover: "group-hover:bg-blue-50",
    border: "hover:border-blue-300",
    shadow: "hover:shadow-blue-200/50",
  },
  {
    href: "/clinical",
    icon: "🏥",
    title: "Clinical",
    subtitle: "Healthcare intelligence",
    description: "AI risk alerts, patient timelines, and real-time monitoring dashboards.",
    gradient: "from-teal-400 to-cyan-500",
    bgHover: "group-hover:bg-teal-50",
    border: "hover:border-teal-300",
    shadow: "hover:shadow-teal-200/50",
  },
];

function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#fafbff]">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/40 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-200/30 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-100/20 to-pink-100/20 blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

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
            <span className="text-2xl font-bold text-emerald-600 tracking-wider uppercase">
              Canopy
            </span>
          </motion.div>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-center mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent leading-tight">
            Continuous Care,
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Naturally
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <p className="text-sm md:text-base text-gray-400 text-center max-w-md mb-14 leading-relaxed">
            Remote care powered by AI, keeping elderly patients healthy at home.
          </p>
        </BlurFade>

        {/* Interface Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {INTERFACES.map((item, index) => (
            <BlurFade key={item.href} delay={0.4 + index * 0.1} inView>
              <Link href={item.href}>
                <motion.div
                  className={`group relative p-8 md:p-10 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/80 ${item.border} ${item.shadow} shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer h-full`}
                  whileHover={{ y: -6, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 rounded-3xl ${item.bgHover} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      {item.icon}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                      {item.title}
                    </h2>
                    <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">
                      {item.subtitle}
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Arrow */}
                    <div className="mt-6 flex items-center gap-2 text-base font-semibold text-gray-400 group-hover:text-gray-700 transition-colors">
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
            className="mt-12 flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200/50 text-xs text-gray-400"
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
