"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type GardenGateProps = {
  patientName: string;
};

function GardenGate({ patientName }: GardenGateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    { role: "ai", text: `Hello ${patientName}! I'm here to help you with anything you need. How are you feeling today?` },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "That's good to hear! Remember to log your blood pressure reading today, and don't forget your morning medication. Your garden is looking lovely! 🌿",
        },
      ]);
    }, 1200);
  };

  return (
    <>
      {/* Gate button */}
      <motion.button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1, x: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-16 h-20 rounded-t-full border-4 border-amber-700 bg-gradient-to-b from-amber-600 to-amber-800 flex items-end justify-center pb-1.5 shadow-lg"
          animate={{ rotateY: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-amber-300" />
        </motion.div>
        <span className="text-base font-bold text-white bg-black/40 backdrop-blur-sm rounded-full px-5 py-2 shadow-lg border border-white/20">
          Help
        </span>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-stretch justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg">
                  🌿
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Garden Helper</h3>
                  <p className="text-xs text-gray-400">Always here for you</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-auto w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-base leading-relaxed ${
                        msg.role === "user"
                          ? "bg-emerald-500 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                  <motion.button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Send
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { GardenGate };
