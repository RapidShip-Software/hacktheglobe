"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FlyToFn = (target: "garden" | "nest" | "clinical" | "team") => Promise<void>;

const LandingScene3D = dynamic(
  () => import("@/components/landing/landing-scene-3d").then((m) => m.LandingScene3D),
  { ssr: false }
);

const USERS: Record<string, { password: string; name: string; role: string }> = {
  "margaret@canopy.care": { password: "garden123", name: "Margaret Santos", role: "patient" },
  "sarah@canopy.care": { password: "nest123", name: "Sarah Santos", role: "family" },
};

function LoginPage() {
  const router = useRouter();
  const flyToRef = useRef<FlyToFn | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const flyAndNavigate = useCallback(async () => {
    if (flyToRef.current) {
      setIsTransitioning(true);
      await flyToRef.current("garden");
    }
    router.push("/?from=garden");
  }, [router]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const trimmedEmail = email.toLowerCase().trim();

    // Try hardcoded demo accounts first
    const demoUser = USERS[trimmedEmail];
    if (demoUser && demoUser.password === password) {
      document.cookie = `canopy_user=${encodeURIComponent(JSON.stringify({ email: trimmedEmail, name: demoUser.name, role: demoUser.role }))};path=/;max-age=86400`;
      await flyAndNavigate();
      return;
    }

    // Try Supabase Auth
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError || !data.user) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      const userName = data.user.user_metadata?.full_name || trimmedEmail.split("@")[0];
      document.cookie = `canopy_user=${encodeURIComponent(JSON.stringify({ email: trimmedEmail, name: userName, role: "patient" }))};path=/;max-age=86400`;
      await flyAndNavigate();
    } catch {
      setError("Invalid email or password. Please try again.");
      setIsLoading(false);
    }
  }, [email, password, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: "#87ceeb" }}>
      {/* 3D Scene Background */}
      <LandingScene3D flyToRef={flyToRef} />

      {/* White fade during fly-to */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 bg-white z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
          />
        )}
      </AnimatePresence>

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
            <span
              className="font-semibold tracking-wide"
              style={{ fontSize: "2.5rem", color: "#4db8a4" }}
            >
              Canopy
            </span>
          </div>
          <p className="text-sm text-white/70 font-medium">
            Shelter for the people you love.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
          <h2 className="text-xl font-bold text-white drop-shadow mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-6">Sign in to continue to your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@canopy.care"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <motion.p
                className="text-sm text-red-500 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-white/20">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Demo Accounts</p>
            <div className="space-y-2">
              <button
                onClick={() => { setEmail("margaret@canopy.care"); setPassword("garden123"); setError(""); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-left hover:bg-emerald-100 transition-colors"
              >
                <span className="text-2xl">{"👵"}</span>
                <div>
                  <p className="text-sm font-bold text-emerald-800">Margaret Santos</p>
                  <p className="text-xs text-emerald-600">Patient (Grandmother)</p>
                </div>
              </button>
              <button
                onClick={() => { setEmail("sarah@canopy.care"); setPassword("nest123"); setError(""); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-100 text-left hover:bg-amber-100 transition-colors"
              >
                <span className="text-2xl">{"👩"}</span>
                <div>
                  <p className="text-sm font-bold text-amber-800">Sarah Santos</p>
                  <p className="text-xs text-amber-600">Family (Daughter)</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-emerald-300 font-semibold hover:text-emerald-200 transition-colors">
            Sign up
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-white/50 mt-4">
          Hack the Globe 2026 &middot; Health &amp; Humanity &middot; BCG Toronto
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;
