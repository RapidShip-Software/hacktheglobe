"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type CaregiverNotesProps = {
  onSubmit: (note: string) => void;
};

function CaregiverNotes({ onSubmit }: CaregiverNotesProps) {
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!note.trim()) return;
    onSubmit(note.trim());
    setNote("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/15">
      <h3 className="text-lg font-semibold text-white drop-shadow mb-3">Add a Note</h3>
      <p className="text-sm text-white/50 mb-3">Visible to the care team</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Mum mentioned she had trouble sleeping last night..."
        className="w-full h-24 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all"
      />
      <div className="flex items-center justify-between mt-3">
        <AnimatePresence>
          {submitted && (
            <motion.span
              className="text-sm text-emerald-300 font-medium"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              ✓ Note sent to care team
            </motion.span>
          )}
        </AnimatePresence>
        <motion.button
          onClick={handleSubmit}
          disabled={!note.trim()}
          className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          whileHover={{ scale: note.trim() ? 1.03 : 1 }}
          whileTap={{ scale: note.trim() ? 0.97 : 1 }}
        >
          Send Note
        </motion.button>
      </div>
    </div>
  );
}

export { CaregiverNotes };
