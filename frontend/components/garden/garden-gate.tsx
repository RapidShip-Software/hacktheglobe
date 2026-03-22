"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Web Speech Recognition types (not in default TS lib)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

type GardenGateProps = {
  patientName: string;
  externalOpen?: boolean;
  onClose?: () => void;
};

function GardenGate({ patientName, externalOpen, onClose }: GardenGateProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen ?? internalOpen;
  const setIsOpen = (v: boolean) => {
    setInternalOpen(v);
    if (!v && onClose) onClose();
  };
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    { role: "ai", text: `Hello ${patientName}! I'm here to help you with anything you need. How are you feeling today?` },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const speak = useCallback((text: string, index: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Toggle off if already speaking this message
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    // Chrome bug: cancel() followed immediately by speak() silently fails.
    // A short delay + resume fixes this.
    setTimeout(() => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      const voices = synth.getVoices();
      const preferred = voices.find(
        (v) => v.name.includes("Samantha") || v.name.includes("Google UK English Female") || v.name.includes("Microsoft Zira")
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setSpeakingIndex(index);
      utterance.onend = () => setSpeakingIndex(null);
      utterance.onerror = () => setSpeakingIndex(null);

      synth.speak(utterance);
      // Chrome sometimes pauses synth after cancel, force resume
      synth.resume();
    }, 100);
  }, [speakingIndex]);

  const toggleListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    // Stop any TTS so the mic doesn't pick it up
    window.speechSynthesis?.cancel();
    setSpeakingIndex(null);

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setInput(transcript);

      // Auto-send when speech ends (final result)
      if (event.results[event.results.length - 1].isFinal) {
        setTimeout(() => {
          setIsListening(false);
        }, 500);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  // Track which message index we last auto-spoke to prevent repeats
  const lastSpokenRef = useRef<number>(-1);

  // Auto-speak new AI messages & scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    if (autoSpeak && lastMsg?.role === "ai" && lastIdx > 0 && lastIdx !== lastSpokenRef.current) {
      lastSpokenRef.current = lastIdx;
      // Small delay so the message renders first
      const timer = setTimeout(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          const synth = window.speechSynthesis;
          synth.cancel();
          // Delay after cancel to avoid Chrome silent-fail bug
          setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(lastMsg.text);
            utterance.rate = 0.85;
            utterance.pitch = 1.05;
            utterance.volume = 1;
            const voices = synth.getVoices();
            const preferred = voices.find(
              (v) => v.name.includes("Samantha") || v.name.includes("Google UK English Female") || v.name.includes("Microsoft Zira")
            );
            if (preferred) utterance.voice = preferred;
            utterance.onstart = () => setSpeakingIndex(lastIdx);
            utterance.onend = () => setSpeakingIndex(null);
            utterance.onerror = () => setSpeakingIndex(null);
            synth.speak(utterance);
            synth.resume();
          }, 100);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [messages, autoSpeak]);

  // Load voices (some browsers need this)
  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, patient_name: patientName }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "I'm having a little trouble right now, dear. Please try again in a moment, or tap a butterfly to call your family." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, patientName]);

  return (
    <>
      {/* Gate button (hidden when externally controlled) */}
      {externalOpen === undefined && (
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
          <span className="text-base font-extrabold text-slate-900 drop-shadow-md bg-white/30 backdrop-blur-2xl backdrop-saturate-150 rounded-full px-5 py-2 shadow-xl border border-white/40">
            Help
          </span>
        </motion.button>
      )}

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
              className="absolute inset-0 bg-black/20 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-md bg-white/30 backdrop-blur-3xl backdrop-saturate-200 border-l border-white/40 shadow-2xl flex flex-col"
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
                  <h3 className="font-extrabold text-slate-900 drop-shadow-md mb-0.5">Garden Helper</h3>
                  <p className="text-xs font-semibold text-slate-700">Always here for you</p>
                </div>
                {/* Auto-speak toggle */}
                <button
                  onClick={() => {
                    if (autoSpeak) window.speechSynthesis?.cancel();
                    setAutoSpeak(!autoSpeak);
                    setSpeakingIndex(null);
                  }}
                  className={`ml-auto w-9 h-9 rounded-full flex items-center justify-center text-lg transition-colors ${
                    autoSpeak ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                  }`}
                  title={autoSpeak ? "Auto-read ON" : "Auto-read OFF"}
                >
                  {autoSpeak ? "🔊" : "🔇"}
                </button>
                <button
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setSpeakingIndex(null);
                    setIsOpen(false);
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
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
                    <div className={`max-w-[80%] ${msg.role === "ai" ? "group/msg" : ""}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl text-base leading-relaxed ${
                          msg.role === "user"
                            ? "bg-emerald-500 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-800 rounded-bl-md"
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.role === "ai" && (
                        <button
                          onClick={() => speak(msg.text, i)}
                          className={`mt-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                            speakingIndex === i
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-gray-50 text-gray-400 hover:text-emerald-600"
                          }`}
                          title={speakingIndex === i ? "Stop reading" : "Read aloud"}
                        >
                          {speakingIndex === i ? "🔊 Speaking..." : "🔈 Read"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
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
                  {/* Mic button */}
                  <motion.button
                    type="button"
                    onClick={toggleListening}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors ${
                      isListening
                        ? "bg-red-100 text-red-500 border-2 border-red-300"
                        : "bg-gray-50 text-gray-400 border border-gray-200 hover:text-emerald-600 hover:border-emerald-300"
                    }`}
                    whileTap={{ scale: 0.9 }}
                    title={isListening ? "Stop listening" : "Speak to type"}
                  >
                    {isListening ? (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        🔴
                      </motion.span>
                    ) : (
                      "🎤"
                    )}
                  </motion.button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Ask me anything..."}
                    className={`flex-1 px-4 py-3 rounded-xl bg-gray-50 border text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent ${
                      isListening ? "border-red-300 bg-red-50/30" : "border-gray-200"
                    }`}
                  />
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-md disabled:opacity-50"
                    whileHover={{ scale: isLoading ? 1 : 1.05 }}
                    whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  >
                    {isLoading ? "..." : "Send"}
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
