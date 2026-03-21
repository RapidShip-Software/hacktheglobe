"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AuroraBackgroundProps = {
  skyState: "clear" | "cloudy" | "stormy";
  children: React.ReactNode;
  className?: string;
};

function AuroraBackground({ skyState, children, className }: AuroraBackgroundProps) {
  const skyGradients = {
    clear: "from-sky-200 via-blue-100 to-emerald-50",
    cloudy: "from-slate-300 via-gray-200 to-blue-100",
    stormy: "from-slate-500 via-gray-400 to-slate-300",
  };

  const auroraColours = {
    clear: "[--aurora:repeating-linear-gradient(100deg,#86efac_10%,#67e8f9_15%,#c4b5fd_20%,#86efac_25%,#a5f3fc_30%)]",
    cloudy: "[--aurora:repeating-linear-gradient(100deg,#94a3b8_10%,#cbd5e1_15%,#e2e8f0_20%,#94a3b8_25%,#f1f5f9_30%)]",
    stormy: "[--aurora:repeating-linear-gradient(100deg,#475569_10%,#64748b_15%,#94a3b8_20%,#475569_25%,#64748b_30%)]",
  };

  return (
    <motion.main
      className={cn(
        "relative flex flex-col h-screen overflow-hidden",
        "bg-gradient-to-b",
        skyGradients[skyState],
        className,
      )}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      {/* Aurora effect layer */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-[10px] opacity-40",
          auroraColours[skyState],
          "[background-image:var(--aurora)]",
          "[background-size:300%,_200%]",
          "[background-position:50%_50%,50%_50%]",
          "animate-[aurora_15s_linear_infinite]",
          "blur-[10px]",
          "after:absolute after:inset-0 after:[background-image:var(--aurora)]",
          "after:[background-size:200%,_100%]",
          "after:animate-[aurora_8s_linear_infinite_reverse]",
          "after:mix-blend-difference after:blur-[10px]",
        )}
      />

      {/* Floating clouds for cloudy/stormy */}
      {(skyState === "cloudy" || skyState === "stormy") && (
        <>
          <motion.div
            className="absolute top-[8%] w-40 h-16 bg-white/30 rounded-full blur-xl"
            animate={{ x: ["-10%", "110%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-[15%] w-56 h-20 bg-white/20 rounded-full blur-2xl"
            animate={{ x: ["110%", "-10%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      {/* Sun for clear sky */}
      {skyState === "clear" && (
        <motion.div
          className="absolute top-8 right-12 w-20 h-20 rounded-full bg-gradient-to-br from-amber-200 to-yellow-300 blur-sm"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 to-yellow-200 animate-pulse" />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </motion.main>
  );
}

export { AuroraBackground };
