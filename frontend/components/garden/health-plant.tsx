"use client";

import { motion } from "framer-motion";

type HealthPlantProps = {
  health: number; // 0 to 1
};

function HealthPlant({ health }: HealthPlantProps) {
  // Clamp health
  const h = Math.max(0, Math.min(1, health));

  // Colours based on health
  const stemColour = h > 0.5 ? "#4ade80" : h > 0.2 ? "#a3a23a" : "#8b7355";
  const leafColour = h > 0.5 ? "#22c55e" : h > 0.2 ? "#84cc16" : "#a16207";
  const flowerColour = h > 0.7 ? "#f472b6" : h > 0.4 ? "#fbbf24" : "transparent";
  const droopAngle = (1 - h) * 25;

  return (
    <motion.div
      className="relative w-48 h-64 mx-auto"
      animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 200 280"
        className="w-full h-full drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pot */}
        <motion.path
          d="M60 230 L70 270 L130 270 L140 230 Z"
          fill="#D2691E"
          stroke="#8B4513"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        />
        <motion.path
          d="M55 224 L145 224 L145 234 L55 234 Z"
          fill="#CD853F"
          rx="4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        />
        {/* Soil */}
        <ellipse cx="100" cy="228" rx="40" ry="6" fill="#5c3a1e" />

        {/* Main stem */}
        <motion.path
          d={`M100 225 Q${100 - droopAngle * 0.3} ${180 - h * 20} ${100 - droopAngle * 0.2} ${120 - h * 30}`}
          fill="none"
          stroke={stemColour}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
        />

        {/* Left leaves */}
        <motion.g
          style={{ transformOrigin: "85px 170px" }}
          animate={{ rotate: -droopAngle * 0.5 }}
          transition={{ type: "spring", stiffness: 40 }}
        >
          <motion.ellipse
            cx="65"
            cy="168"
            rx="25"
            ry="10"
            fill={leafColour}
            opacity={0.9}
            initial={{ scale: 0 }}
            animate={{ scale: h > 0.1 ? 1 : 0.3 }}
            transition={{ delay: 0.8, type: "spring" }}
          />
        </motion.g>

        {/* Right leaves */}
        <motion.g
          style={{ transformOrigin: "115px 150px" }}
          animate={{ rotate: droopAngle * 0.4 }}
          transition={{ type: "spring", stiffness: 40 }}
        >
          <motion.ellipse
            cx="135"
            cy="148"
            rx="28"
            ry="11"
            fill={leafColour}
            opacity={0.85}
            initial={{ scale: 0 }}
            animate={{ scale: h > 0.2 ? 1 : 0.2 }}
            transition={{ delay: 1.0, type: "spring" }}
          />
        </motion.g>

        {/* Small leaf */}
        <motion.ellipse
          cx="75"
          cy="140"
          rx="18"
          ry="8"
          fill={leafColour}
          opacity={0.7}
          style={{ transformOrigin: "85px 140px" }}
          animate={{ rotate: -droopAngle * 0.3, scale: h > 0.3 ? 1 : 0 }}
          transition={{ delay: 1.1, type: "spring" }}
        />

        {/* Flower / bloom (only when healthy) */}
        {h > 0.4 && (
          <motion.g
            style={{ transformOrigin: `${100 - droopAngle * 0.2}px ${115 - h * 30}px` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: h > 0.7 ? 1.1 : 0.6, opacity: 1 }}
            transition={{ delay: 1.3, type: "spring", stiffness: 50 }}
          >
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <motion.ellipse
                key={angle}
                cx={100 - droopAngle * 0.2 + Math.cos((angle * Math.PI) / 180) * 12}
                cy={110 - h * 30 + Math.sin((angle * Math.PI) / 180) * 12}
                rx="8"
                ry="5"
                fill={flowerColour}
                opacity={0.8}
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: angle * 0.003,
                }}
              />
            ))}
            <circle
              cx={100 - droopAngle * 0.2}
              cy={110 - h * 30}
              r="6"
              fill="#fde047"
            />
          </motion.g>
        )}

        {/* Sparkles for very healthy plants */}
        {h > 0.8 && (
          <>
            {[
              { cx: 70, cy: 130, d: 0 },
              { cx: 140, cy: 110, d: 0.5 },
              { cx: 90, cy: 90, d: 1 },
            ].map((s, i) => (
              <motion.circle
                key={i}
                cx={s.cx}
                cy={s.cy}
                r="2"
                fill="#fde047"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: s.d,
                }}
              />
            ))}
          </>
        )}
      </svg>
    </motion.div>
  );
}

export { HealthPlant };
