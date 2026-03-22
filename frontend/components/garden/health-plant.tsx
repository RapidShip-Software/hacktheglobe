"use client";

import { motion } from "framer-motion";

type HealthPlantProps = {
  health: number; // 0 to 1
};

function HealthPlant({ health }: HealthPlantProps) {
  const h = Math.max(0, Math.min(1, health));

  // Colours based on health
  const stemLight = h > 0.5 ? "#6ee7a0" : h > 0.2 ? "#c4c23a" : "#a08060";
  const stemDark = h > 0.5 ? "#16a34a" : h > 0.2 ? "#6b8a1a" : "#6b4226";
  const leafLight = h > 0.5 ? "#4ade80" : h > 0.2 ? "#a3e635" : "#d97706";
  const leafDark = h > 0.5 ? "#15803d" : h > 0.2 ? "#4d7c0f" : "#92400e";
  const petalLight = h > 0.7 ? "#f9a8d4" : h > 0.4 ? "#fde047" : "transparent";
  const petalDark = h > 0.7 ? "#db2777" : h > 0.4 ? "#f59e0b" : "transparent";
  const potLight = "#cd7f32";
  const potMid = "#a0522d";
  const potDark = "#6b3410";
  const droopAngle = (1 - h) * 25;

  const stemTopX = 100 - droopAngle * 0.2;
  const stemTopY = 120 - h * 30;
  const flowerCY = 110 - h * 30;

  return (
    <motion.div
      className="relative w-48 h-64 mx-auto"
      animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))" }}
    >
      <svg
        viewBox="0 0 200 280"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Pot gradient - cylindrical shading */}
          <linearGradient id="potGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={potDark} />
            <stop offset="25%" stopColor={potLight} />
            <stop offset="50%" stopColor={potMid} />
            <stop offset="80%" stopColor={potDark} />
            <stop offset="100%" stopColor={potDark} />
          </linearGradient>
          <linearGradient id="potRimGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={potDark} />
            <stop offset="30%" stopColor="#d4956b" />
            <stop offset="60%" stopColor={potMid} />
            <stop offset="100%" stopColor={potDark} />
          </linearGradient>
          <radialGradient id="soilGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#7a4c2a" />
            <stop offset="100%" stopColor="#3d1f0a" />
          </radialGradient>

          {/* Stem gradient */}
          <linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={stemDark} />
            <stop offset="40%" stopColor={stemLight} />
            <stop offset="100%" stopColor={stemDark} />
          </linearGradient>

          {/* Leaf gradients */}
          <radialGradient id="leafGrad1" cx="30%" cy="40%" r="70%">
            <stop offset="0%" stopColor={leafLight} />
            <stop offset="100%" stopColor={leafDark} />
          </radialGradient>
          <radialGradient id="leafGrad2" cx="70%" cy="40%" r="70%">
            <stop offset="0%" stopColor={leafLight} />
            <stop offset="100%" stopColor={leafDark} />
          </radialGradient>

          {/* Petal gradient */}
          <radialGradient id="petalGrad" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor={petalLight} />
            <stop offset="100%" stopColor={petalDark} />
          </radialGradient>

          {/* Flower center gradient */}
          <radialGradient id="centerGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="100%" stopColor="#ca8a04" />
          </radialGradient>

          {/* Highlight for specular */}
          <radialGradient id="potHighlight" cx="35%" cy="30%" r="40%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* === POT (3D cylindrical look) === */}
        {/* Pot body */}
        <motion.path
          d="M60 230 L70 270 L130 270 L140 230 Z"
          fill="url(#potGrad)"
          stroke={potDark}
          strokeWidth="1.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        />
        {/* Pot highlight overlay */}
        <path
          d="M65 232 L72 268 L105 268 L115 232 Z"
          fill="url(#potHighlight)"
          opacity={0.5}
        />
        {/* Pot rim (3D elliptical top) */}
        <motion.ellipse
          cx="100"
          cy="229"
          rx="43"
          ry="8"
          fill="url(#potRimGrad)"
          stroke={potDark}
          strokeWidth="1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        />
        {/* Inner rim shadow */}
        <ellipse cx="100" cy="229" rx="37" ry="6" fill="rgba(0,0,0,0.15)" />

        {/* Soil (3D ellipse with gradient) */}
        <ellipse cx="100" cy="228" rx="36" ry="5.5" fill="url(#soilGrad)" />
        {/* Soil highlight */}
        <ellipse cx="92" cy="226" rx="14" ry="2.5" fill="rgba(255,255,255,0.08)" />

        {/* Pot bottom rim */}
        <ellipse cx="100" cy="270" rx="30" ry="4" fill={potDark} />

        {/* === STEM (3D tube with gradient) === */}
        {/* Shadow stem behind */}
        <motion.path
          d={`M102 225 Q${102 - droopAngle * 0.3} ${182 - h * 20} ${stemTopX + 2} ${stemTopY + 2}`}
          fill="none"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="7"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
        />
        {/* Main stem */}
        <motion.path
          d={`M100 225 Q${100 - droopAngle * 0.3} ${180 - h * 20} ${stemTopX} ${stemTopY}`}
          fill="none"
          stroke="url(#stemGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
        />
        {/* Stem highlight */}
        <motion.path
          d={`M99 225 Q${99 - droopAngle * 0.3} ${180 - h * 20} ${stemTopX - 1} ${stemTopY}`}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
        />

        {/* === LEAVES (3D with gradients + veins + shadow) === */}
        {/* Left leaf shadow */}
        <motion.g
          style={{ transformOrigin: "85px 170px" }}
          animate={{ rotate: -droopAngle * 0.5 }}
          transition={{ type: "spring", stiffness: 40 }}
        >
          <ellipse cx="66" cy="172" rx="26" ry="11" fill="rgba(0,0,0,0.1)" />
        </motion.g>

        {/* Left leaf */}
        <motion.g
          style={{ transformOrigin: "85px 170px" }}
          animate={{ rotate: -droopAngle * 0.5 }}
          transition={{ type: "spring", stiffness: 40 }}
        >
          <motion.ellipse
            cx="65"
            cy="168"
            rx="26"
            ry="11"
            fill="url(#leafGrad1)"
            initial={{ scale: 0 }}
            animate={{ scale: h > 0.1 ? 1 : 0.3 }}
            transition={{ delay: 0.8, type: "spring" }}
          />
          {/* Leaf vein */}
          <line x1="85" y1="168" x2="45" y2="168" stroke={leafDark} strokeWidth="0.7" opacity={0.5} />
          <line x1="75" y1="168" x2="55" y2="162" stroke={leafDark} strokeWidth="0.5" opacity={0.3} />
          <line x1="70" y1="168" x2="55" y2="174" stroke={leafDark} strokeWidth="0.5" opacity={0.3} />
          {/* Leaf highlight */}
          <ellipse cx="60" cy="165" rx="12" ry="4" fill="rgba(255,255,255,0.15)" />
        </motion.g>

        {/* Right leaf shadow */}
        <motion.g
          style={{ transformOrigin: "115px 150px" }}
          animate={{ rotate: droopAngle * 0.4 }}
          transition={{ type: "spring", stiffness: 40 }}
        >
          <ellipse cx="136" cy="152" rx="29" ry="12" fill="rgba(0,0,0,0.1)" />
        </motion.g>

        {/* Right leaf */}
        <motion.g
          style={{ transformOrigin: "115px 150px" }}
          animate={{ rotate: droopAngle * 0.4 }}
          transition={{ type: "spring", stiffness: 40 }}
        >
          <motion.ellipse
            cx="135"
            cy="148"
            rx="29"
            ry="12"
            fill="url(#leafGrad2)"
            initial={{ scale: 0 }}
            animate={{ scale: h > 0.2 ? 1 : 0.2 }}
            transition={{ delay: 1.0, type: "spring" }}
          />
          {/* Leaf veins */}
          <line x1="115" y1="148" x2="158" y2="148" stroke={leafDark} strokeWidth="0.7" opacity={0.5} />
          <line x1="125" y1="148" x2="148" y2="141" stroke={leafDark} strokeWidth="0.5" opacity={0.3} />
          <line x1="130" y1="148" x2="148" y2="155" stroke={leafDark} strokeWidth="0.5" opacity={0.3} />
          {/* Leaf highlight */}
          <ellipse cx="140" cy="145" rx="14" ry="4.5" fill="rgba(255,255,255,0.15)" />
        </motion.g>

        {/* Small leaf with depth */}
        <motion.g
          style={{ transformOrigin: "85px 140px" }}
          animate={{ rotate: -droopAngle * 0.3, scale: h > 0.3 ? 1 : 0 }}
          transition={{ delay: 1.1, type: "spring" }}
        >
          <ellipse cx="76" cy="144" rx="19" ry="9" fill="rgba(0,0,0,0.08)" />
          <ellipse cx="75" cy="140" rx="19" ry="9" fill="url(#leafGrad1)" opacity={0.85} />
          <line x1="85" y1="140" x2="58" y2="140" stroke={leafDark} strokeWidth="0.5" opacity={0.4} />
          <ellipse cx="72" cy="137" rx="9" ry="3" fill="rgba(255,255,255,0.12)" />
        </motion.g>

        {/* === FLOWER (3D layered petals with gradients) === */}
        {h > 0.4 && (
          <motion.g
            style={{ transformOrigin: `${stemTopX}px ${flowerCY}px` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: h > 0.7 ? 1.1 : 0.6, opacity: 1 }}
            transition={{ delay: 1.3, type: "spring", stiffness: 50 }}
          >
            {/* Petal shadow layer */}
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <ellipse
                key={`shadow-${angle}`}
                cx={stemTopX + Math.cos((angle * Math.PI) / 180) * 13 + 1}
                cy={flowerCY + Math.sin((angle * Math.PI) / 180) * 13 + 2}
                rx="9"
                ry="6"
                fill="rgba(0,0,0,0.1)"
                transform={`rotate(${angle}, ${stemTopX + Math.cos((angle * Math.PI) / 180) * 13}, ${flowerCY + Math.sin((angle * Math.PI) / 180) * 13})`}
              />
            ))}

            {/* Back petals (larger, darker) */}
            {[30, 150, 270].map((angle) => (
              <motion.ellipse
                key={`back-${angle}`}
                cx={stemTopX + Math.cos((angle * Math.PI) / 180) * 15}
                cy={flowerCY + Math.sin((angle * Math.PI) / 180) * 15}
                rx="10"
                ry="6"
                fill={petalDark}
                opacity={0.6}
                transform={`rotate(${angle}, ${stemTopX + Math.cos((angle * Math.PI) / 180) * 15}, ${flowerCY + Math.sin((angle * Math.PI) / 180) * 15})`}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: angle * 0.003 }}
              />
            ))}

            {/* Front petals (main) */}
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <motion.ellipse
                key={angle}
                cx={stemTopX + Math.cos((angle * Math.PI) / 180) * 13}
                cy={flowerCY + Math.sin((angle * Math.PI) / 180) * 13}
                rx="9"
                ry="6"
                fill="url(#petalGrad)"
                opacity={0.85}
                transform={`rotate(${angle}, ${stemTopX + Math.cos((angle * Math.PI) / 180) * 13}, ${flowerCY + Math.sin((angle * Math.PI) / 180) * 13})`}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: angle * 0.003 }}
              />
            ))}

            {/* Petal highlights */}
            {[0, 120, 240].map((angle) => (
              <ellipse
                key={`hl-${angle}`}
                cx={stemTopX + Math.cos((angle * Math.PI) / 180) * 10}
                cy={flowerCY + Math.sin((angle * Math.PI) / 180) * 10 - 2}
                rx="4"
                ry="2"
                fill="rgba(255,255,255,0.3)"
                transform={`rotate(${angle}, ${stemTopX + Math.cos((angle * Math.PI) / 180) * 10}, ${flowerCY + Math.sin((angle * Math.PI) / 180) * 10})`}
              />
            ))}

            {/* Center (3D sphere look) */}
            <circle cx={stemTopX} cy={flowerCY} r="7" fill="url(#centerGrad)" />
            <circle cx={stemTopX - 2} cy={flowerCY - 2} r="3" fill="rgba(255,255,255,0.35)" />
          </motion.g>
        )}

        {/* Sparkles for very healthy plants */}
        {h > 0.8 && (
          <>
            {[
              { cx: 70, cy: 130, d: 0 },
              { cx: 140, cy: 110, d: 0.5 },
              { cx: 90, cy: 90, d: 1 },
              { cx: 50, cy: 150, d: 1.5 },
              { cx: 150, cy: 140, d: 0.3 },
            ].map((s, i) => (
              <motion.g key={i}>
                {/* Star sparkle */}
                <motion.circle
                  cx={s.cx}
                  cy={s.cy}
                  r="2.5"
                  fill="#fde047"
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: s.d }}
                />
                <motion.circle
                  cx={s.cx}
                  cy={s.cy}
                  r="1"
                  fill="white"
                  animate={{ opacity: [0, 0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: s.d + 0.1 }}
                />
              </motion.g>
            ))}
          </>
        )}
      </svg>
    </motion.div>
  );
}

export { HealthPlant };
