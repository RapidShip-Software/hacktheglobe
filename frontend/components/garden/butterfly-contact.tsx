"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Contact } from "@/lib/types";

type ButterflyContactProps = {
  contact: Contact;
  position: "left" | "center" | "right" | "stacked";
};

const butterflyColours: Record<string, { wing: string; body: string; wingDark: string; highlight: string }> = {
  butterfly_blue: { wing: "#60a5fa", body: "#2563eb", wingDark: "#3b82f6", highlight: "#93c5fd" },
  butterfly_green: { wing: "#4ade80", body: "#16a34a", wingDark: "#22c55e", highlight: "#86efac" },
  robin_red: { wing: "#fb923c", body: "#ea580c", wingDark: "#f97316", highlight: "#fdba74" },
};

function ButterflyContact({ contact, position }: ButterflyContactProps) {
  const [showModal, setShowModal] = useState(false);
  const colours = butterflyColours[contact.avatar] || { wing: "#a78bfa", body: "#7c3aed", wingDark: "#8b5cf6", highlight: "#c4b5fd" };
  const gradId = `bf-grad-${contact.name.replace(/\s/g, "")}`;

  const positionClasses = {
    left: "left-8 bottom-36 md:bottom-40",
    center: "left-1/2 -translate-x-1/2 bottom-32 md:bottom-36",
    right: "right-20 bottom-36 md:bottom-40",
    stacked: "relative",
  };

  const isStacked = position === "stacked";
  const svgSize = isStacked ? { width: 50, height: 42 } : { width: 90, height: 75 };

  return (
    <>
      <motion.button
        className={`${isStacked ? "relative" : `absolute ${positionClasses[position]}`} z-20 flex ${isStacked ? "flex-row items-center gap-2 bg-white/20 backdrop-blur-2xl backdrop-saturate-150 rounded-xl px-3 py-2 border border-white/40 shadow-xl w-40" : "flex-col items-center gap-1"} cursor-pointer group`}
        onClick={() => setShowModal(true)}
        animate={isStacked ? {} : { y: [0, -8, 0, -4, 0] }}
        transition={isStacked ? {} : {
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* 3D Butterfly SVG with gradients, highlights, and depth */}
        <svg width={svgSize.width} height={svgSize.height} viewBox="0 0 60 50" className="drop-shadow-xl shrink-0" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
          <defs>
            {/* Wing gradient for 3D depth */}
            <radialGradient id={`${gradId}-lwg`} cx="40%" cy="30%">
              <stop offset="0%" stopColor={colours.highlight} />
              <stop offset="60%" stopColor={colours.wing} />
              <stop offset="100%" stopColor={colours.wingDark} />
            </radialGradient>
            <radialGradient id={`${gradId}-rwg`} cx="60%" cy="30%">
              <stop offset="0%" stopColor={colours.highlight} />
              <stop offset="60%" stopColor={colours.wing} />
              <stop offset="100%" stopColor={colours.wingDark} />
            </radialGradient>
            {/* Body gradient */}
            <linearGradient id={`${gradId}-bg`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colours.body} />
              <stop offset="100%" stopColor={colours.wingDark} />
            </linearGradient>
          </defs>

          {/* Shadow underneath */}
          <ellipse cx="30" cy="46" rx="18" ry="3" fill="rgba(0,0,0,0.15)" />

          {/* Left upper wing — 3D with gradient + inner pattern */}
          <motion.ellipse
            cx="19" cy="20" rx="16" ry="18"
            fill={`url(#${gradId}-lwg)`}
            stroke={colours.wingDark}
            strokeWidth="0.8"
            animate={{ rx: [16, 12, 16] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Wing pattern spots */}
          <circle cx="14" cy="18" r="4" fill={colours.highlight} opacity={0.4} />
          <circle cx="20" cy="14" r="2.5" fill="white" opacity={0.25} />

          {/* Left lower wing */}
          <motion.ellipse
            cx="19" cy="33" rx="12" ry="12"
            fill={`url(#${gradId}-lwg)`}
            stroke={colours.wingDark}
            strokeWidth="0.6"
            opacity={0.8}
            animate={{ rx: [12, 8, 12] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
          />
          <circle cx="16" cy="32" r="3" fill={colours.highlight} opacity={0.3} />

          {/* Right upper wing */}
          <motion.ellipse
            cx="41" cy="20" rx="16" ry="18"
            fill={`url(#${gradId}-rwg)`}
            stroke={colours.wingDark}
            strokeWidth="0.8"
            animate={{ rx: [16, 12, 16] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx="46" cy="18" r="4" fill={colours.highlight} opacity={0.4} />
          <circle cx="40" cy="14" r="2.5" fill="white" opacity={0.25} />

          {/* Right lower wing */}
          <motion.ellipse
            cx="41" cy="33" rx="12" ry="12"
            fill={`url(#${gradId}-rwg)`}
            stroke={colours.wingDark}
            strokeWidth="0.6"
            opacity={0.8}
            animate={{ rx: [12, 8, 12] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
          />
          <circle cx="44" cy="32" r="3" fill={colours.highlight} opacity={0.3} />

          {/* Body — 3D with gradient and segments */}
          <ellipse cx="30" cy="26" rx="3.5" ry="17" fill={`url(#${gradId}-bg)`} stroke={colours.body} strokeWidth="0.5" />
          {/* Body segments */}
          <line x1="27" y1="20" x2="33" y2="20" stroke={colours.wingDark} strokeWidth="0.4" opacity={0.5} />
          <line x1="27" y1="24" x2="33" y2="24" stroke={colours.wingDark} strokeWidth="0.4" opacity={0.5} />
          <line x1="27" y1="28" x2="33" y2="28" stroke={colours.wingDark} strokeWidth="0.4" opacity={0.5} />
          <line x1="27" y1="32" x2="33" y2="32" stroke={colours.wingDark} strokeWidth="0.4" opacity={0.5} />
          {/* Body highlight (3D sheen) */}
          <ellipse cx="29" cy="22" rx="1.2" ry="8" fill="white" opacity={0.2} />

          {/* Head */}
          <circle cx="30" cy="10" r="3.5" fill={colours.body} stroke={colours.wingDark} strokeWidth="0.5" />
          {/* Eyes */}
          <circle cx="28.5" cy="9" r="1.2" fill="white" />
          <circle cx="31.5" cy="9" r="1.2" fill="white" />
          <circle cx="28.8" cy="9.2" r="0.6" fill="#111" />
          <circle cx="31.8" cy="9.2" r="0.6" fill="#111" />
          {/* Eye highlights */}
          <circle cx="28.3" cy="8.7" r="0.3" fill="white" />
          <circle cx="31.3" cy="8.7" r="0.3" fill="white" />

          {/* Antennae — curved */}
          <path d="M28 7 Q24 1 20 2" stroke={colours.body} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M32 7 Q36 1 40 2" stroke={colours.body} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <circle cx="20" cy="2" r="2" fill={colours.wing} stroke={colours.wingDark} strokeWidth="0.5" />
          <circle cx="40" cy="2" r="2" fill={colours.wing} stroke={colours.wingDark} strokeWidth="0.5" />
        </svg>

        {/* Name label */}
        <span className={`font-extrabold whitespace-nowrap ${isStacked ? "text-sm text-slate-900 drop-shadow-md" : "text-base text-slate-900 drop-shadow-md bg-white/30 backdrop-blur-2xl backdrop-saturate-150 rounded-full px-5 py-2 shadow-xl border border-white/40"}`}>
          {contact.name}
          {isStacked && <span className="block text-[10px] font-bold text-slate-700 drop-shadow-sm">{contact.relation}</span>}
        </span>
      </motion.button>

      {/* Call Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="relative bg-white/30 backdrop-blur-3xl backdrop-saturate-200 rounded-[2.5rem] p-8 shadow-2xl max-w-sm mx-4 text-center border border-white/40"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
            >
              {/* Butterfly icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colours.wing + "30" }}
              >
                <svg width="36" height="30" viewBox="0 0 60 50">
                  <ellipse cx="20" cy="22" rx="14" ry="16" fill={colours.wing} opacity={0.85} />
                  <ellipse cx="40" cy="22" rx="14" ry="16" fill={colours.wing} opacity={0.85} />
                  <ellipse cx="30" cy="24" rx="3" ry="14" fill={colours.body} />
                </svg>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 drop-shadow-md mb-1">{contact.name}</h3>
              <p className="text-sm font-bold text-slate-700 mb-1 drop-shadow-sm">{contact.relation}</p>
              <p className="text-lg font-bold text-slate-800 mb-6 drop-shadow-sm">{contact.phone}</p>

              <div className="flex gap-3 justify-center">
                <motion.a
                  href={`tel:${contact.phone}`}
                  className="flex-1 py-3 rounded-2xl text-white font-semibold text-lg"
                  style={{ backgroundColor: colours.body }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Call
                </motion.a>
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-lg hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { ButterflyContact };
