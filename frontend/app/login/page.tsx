"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const USERS: Record<string, { password: string; name: string; role: string }> = {
  "margaret@canopy.care": { password: "garden123", name: "Margaret Santos", role: "patient" },
  "sarah@canopy.care": { password: "nest123", name: "Sarah Santos", role: "family" },
};

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    const user = USERS[email.toLowerCase().trim()];
    if (!user || user.password !== password) {
      setError("Invalid email or password. Please try again.");
      setIsLoading(false);
      return;
    }

    // Set session cookie
    document.cookie = `canopy_user=${encodeURIComponent(JSON.stringify({ email: email.toLowerCase().trim(), name: user.name, role: user.role }))};path=/;max-age=86400`;
    router.push("/");
  }, [email, password, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-100/20 blur-3xl" />
      </div>

      <motion.div
        className="relative w-full max-w-md"
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
          <p className="text-sm text-slate-500 font-medium">
            Shelter for the people you love.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-6">Sign in to continue to your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Demo Accounts</p>
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

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Hack the Globe 2026 &middot; Health &amp; Humanity &middot; BCG Toronto
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;
