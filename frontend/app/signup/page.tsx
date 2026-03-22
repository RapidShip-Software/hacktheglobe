"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const LandingScene3D = dynamic(
  () => import("@/components/landing/landing-scene-3d").then((m) => m.LandingScene3D),
  { ssr: false }
);

function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // Sign up with Supabase Auth
      const { error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      // Set session cookie for middleware
      document.cookie = `canopy_user=${encodeURIComponent(JSON.stringify({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role: "patient",
      }))};path=/;max-age=86400`;

      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }, [name, email, password, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: "#87ceeb" }}>
      <LandingScene3D />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo-heart.png" alt="" className="h-16 object-contain drop-shadow-lg" />
            <span className="font-semibold tracking-wide" style={{ fontSize: "2.5rem", color: "#4db8a4" }}>
              Canopy
            </span>
          </div>
          <p className="text-sm text-white/70 font-medium">
            Shelter for the people you love.
          </p>
        </div>

        {/* Sign up card */}
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
          <h2 className="text-xl font-bold text-white drop-shadow mb-1">Create your account</h2>
          <p className="text-sm text-white/70 font-medium mb-6">Join Canopy to start caring</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white/90 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marco Ayuste"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/90 border border-white/50 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/90 border border-white/50 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/90 border border-white/50 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <motion.p
                className="text-sm text-red-200 font-medium bg-red-500/30 border border-red-400/30 rounded-xl px-4 py-2.5"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-300 font-semibold hover:text-emerald-200 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/50 mt-6">
          Hack the Globe 2026 &middot; Health &amp; Humanity &middot; BCG Toronto
        </p>
      </motion.div>
    </div>
  );
}

export default SignupPage;
