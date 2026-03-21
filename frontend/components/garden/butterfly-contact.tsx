"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Contact } from "@/lib/types";

type ButterflyContactProps = {
  contact: Contact;
  position: "left" | "center" | "right";
};

const butterflyColours: Record<string, { wing: string; body: string }> = {
  butterfly_blue: { wing: "#60a5fa", body: "#2563eb" },
  butterfly_green: { wing: "#4ade80", body: "#16a34a" },
  robin_red: { wing: "#fb923c", body: "#ea580c" },
};

function ButterflyContact({ contact, position }: ButterflyContactProps) {
  const [showModal, setShowModal] = useState(false);
  const colours = butterflyColours[contact.avatar] || { wing: "#a78bfa", body: "#7c3aed" };

  const positionClasses = {
    left: "left-8 bottom-36 md:bottom-40",
    center: "left-1/2 -translate-x-1/2 bottom-32 md:bottom-36",
    right: "right-20 bottom-36 md:bottom-40",
  };

  return (
    <>
      <motion.button
        className={`absolute ${positionClasses[position]} z-20 flex flex-col items-center gap-1 cursor-pointer group`}
        onClick={() => setShowModal(true)}
        animate={{
          y: [0, -8, 0, -4, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Butterfly SVG */}
        <svg width="60" height="50" viewBox="0 0 60 50" className="drop-shadow-lg">
          {/* Left wing */}
          <motion.ellipse
            cx="20"
            cy="22"
            rx="16"
            ry="18"
            fill={colours.wing}
            opacity={0.85}
            animate={{ rx: [16, 12, 16] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="20"
            cy="32"
            rx="12"
            ry="12"
            fill={colours.wing}
            opacity={0.7}
            animate={{ rx: [12, 8, 12] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
          />
          {/* Right wing */}
          <motion.ellipse
            cx="40"
            cy="22"
            rx="16"
            ry="18"
            fill={colours.wing}
            opacity={0.85}
            animate={{ rx: [16, 12, 16] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="40"
            cy="32"
            rx="12"
            ry="12"
            fill={colours.wing}
            opacity={0.7}
            animate={{ rx: [12, 8, 12] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
          />
          {/* Body */}
          <ellipse cx="30" cy="26" rx="3" ry="16" fill={colours.body} />
          {/* Antennae */}
          <line x1="28" y1="12" x2="22" y2="4" stroke={colours.body} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="32" y1="12" x2="38" y2="4" stroke={colours.body} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="22" cy="3" r="2" fill={colours.body} />
          <circle cx="38" cy="3" r="2" fill={colours.body} />
        </svg>

        {/* Name label */}
        <span className="text-xs font-medium text-white/90 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 whitespace-nowrap">
          {contact.name}
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center"
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

              <h3 className="text-2xl font-bold text-gray-800 mb-1">{contact.name}</h3>
              <p className="text-sm text-gray-500 mb-1">{contact.relation}</p>
              <p className="text-lg text-gray-600 mb-6">{contact.phone}</p>

              <div className="flex gap-3 justify-center">
                <motion.a
                  href={`tel:${contact.phone}`}
                  className="flex-1 py-3 rounded-2xl text-white font-semibold text-lg"
                  style={{ backgroundColor: colours.body }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  📞 Call
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
