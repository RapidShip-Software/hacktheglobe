"use client";

import { useRef, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { BlurFade } from "@/components/shared/blur-fade";
import { ErrorBoundary } from "@/components/shared/error-boundary";

type FlyTarget = "garden" | "nest" | "clinical";
type FlyToFn = (target: FlyTarget) => Promise<void>;

const LandingScene3D = dynamic(
  () => import("@/components/landing/landing-scene-3d").then((m) => m.LandingScene3D),
  { ssr: false }
);

const INTERFACES: Array<{
  href: string;
  flyTarget: FlyTarget;
  icon: string;
  iconImage?: string;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  bgHover: string;
  border: string;
  shadow: string;
}> = [
  {
    href: "/garden",
    flyTarget: "garden",
    icon: "\u{1F33F}",
    iconImage: "/garden-logo.png",
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
    flyTarget: "nest",
    icon: "\u{1FABA}",
    title: "The Nest",
    subtitle: "Family peace of mind",
    description: "Looking over your loved ones. Daily green/yellow/red signals at a glance.",
    gradient: "from-amber-400 to-orange-500",
    bgHover: "group-hover:bg-amber-50/30",
    border: "hover:border-amber-300/60",
    shadow: "hover:shadow-amber-200/30",
  },
  {
    href: "/clinical",
    flyTarget: "clinical",
    icon: "\u{1F3E5}",
    title: "The Clinic",
    subtitle: "Healthcare intelligence",
    description: "AI risk alerts, patient timelines, and real-time monitoring dashboards.",
    gradient: "from-teal-400 to-cyan-500",
    bgHover: "group-hover:bg-teal-50/30",
    border: "hover:border-teal-300/60",
    shadow: "hover:shadow-teal-200/30",
  },
];

function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flyToRef = useRef<FlyToFn | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fromParam = searchParams.get("from") as FlyTarget | null;
  const initialFlyFrom = fromParam && ["garden", "nest", "clinical"].includes(fromParam) ? fromParam : undefined;

  const handleCardClick = useCallback(async (flyTarget: FlyTarget, href: string) => {
    if (isTransitioning) return;
    if (!flyToRef.current) {
      router.push(href);
      return;
    }
    setIsTransitioning(true);
    await flyToRef.current(flyTarget);
    router.push(href);
  }, [isTransitioning, router]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 3D Garden Scene Background */}
      <ErrorBoundary autoRetry maxRetries={3}>
        <LandingScene3D flyToRef={flyToRef} initialFlyFrom={initialFlyFrom} />
      </ErrorBoundary>

      {/* White fade overlay during transition */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 bg-white z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
        {/* Logo */}
        <BlurFade delay={0.1} inView>
          <motion.div
            className="flex items-center justify-center gap-3 md:gap-5 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img src="/logo-heart.png" alt="Canopy Heart" className="h-20 sm:h-24 md:h-28 object-contain drop-shadow-2xl" />
            <span
              className="font-extrabold tracking-tight"
              style={{
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                color: "#4db8a4",
                textShadow: "0 4px 20px rgba(0,0,0,0.15)",
                lineHeight: 1,
              }}
            >
              Canopy
            </span>
          </motion.div>
          <p className="text-sm md:text-base font-medium text-white/60 italic tracking-wide -mt-4 drop-shadow">
            shelter for the people you love.
          </p>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 leading-tight">
            <span className="text-white drop-shadow-xl">
              Continuous Care,
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
              Naturally
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <p className="text-base md:text-lg font-bold text-white drop-shadow-md text-center max-w-md mb-16 leading-relaxed">
            Remote care powered by AI, keeping elderly patients healthy at home.
          </p>
        </BlurFade>

        {/* Interface Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {INTERFACES.map((item, index) => (
            <BlurFade key={item.href} delay={0.4 + index * 0.1} inView>
              <motion.div
                className={`group relative p-8 md:p-10 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer h-full overflow-hidden`}
                whileHover={{ y: -6, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCardClick(item.flyTarget, item.href)}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 rounded-3xl ${item.bgHover} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${item.iconImage ? "bg-white/80" : `bg-gradient-to-br ${item.gradient}`} flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 overflow-hidden`}>
                    {item.iconImage ? (
                      <img src={item.iconImage} alt={item.title} className="w-14 h-14 object-contain" />
                    ) : (
                      item.icon
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                    {item.title}
                  </h2>
                  <p className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">
                    {item.subtitle}
                  </p>
                  <p className="text-base font-medium text-white/90 leading-relaxed drop-shadow">
                    {item.description}
                  </p>

                  {/* Arrow */}
                  <div className="mt-8 flex items-center gap-2 text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    <span>Open</span>
                    <motion.span
                      className="inline-block text-xl"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {"\u2192"}
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </BlurFade>
          ))}
        </div>

        {/* Footer badge */}
        <BlurFade delay={0.8} inView>
          <motion.div
            className="mt-12 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white shadow-md border border-slate-200 text-sm font-semibold text-slate-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Hack the Globe 2026 &middot; Health &amp; Humanity &middot; BCG Toronto
          </motion.div>
        </BlurFade>
      </div>
    </main>
  );
}

function HomePage() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  );
}

export default HomePage;
