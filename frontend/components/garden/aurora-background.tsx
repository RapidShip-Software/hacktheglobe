"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const GardenScene3D = dynamic(
  () => import("./garden-scene-3d").then((m) => m.GardenScene3D),
  { ssr: false }
);

type AuroraBackgroundProps = {
  skyState: "clear" | "cloudy" | "stormy";
  children: React.ReactNode;
  className?: string;
  health?: number;
  timeOfDay?: "day" | "sunset" | "night";
};

function AuroraBackground({ skyState, children, className, health = 0.8, timeOfDay }: AuroraBackgroundProps) {
  return (
    <motion.main
      className={cn(
        "relative flex flex-col h-screen overflow-hidden bg-sky-300",
        className,
      )}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      {/* 3D Garden Scene (pure Three.js, no R3F) */}
      <GardenScene3D health={health} skyState={skyState} timeOfDay={timeOfDay} />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </motion.main>
  );
}

export { AuroraBackground };
