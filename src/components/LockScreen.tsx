"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { UserRole } from "@/types";

interface LockScreenProps {
  onAuthenticated: (role: UserRole) => void;
}

export default function LockScreen({ onAuthenticated }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Incorrect password. Access denied.");
        setLoading(false);
        return;
      }

      onAuthenticated(data.role);
    } catch (err: any) {
      setError(err?.message || "Connection failed. Please check network.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-sm bg-zinc-900/70 border border-zinc-800 rounded-xl p-8 shadow-xl">
        {/* Header */}
        <div className="mb-8">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-200 mb-4">
            <Lock className="w-4 h-4" />
          </div>

          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            thorappankochunni
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Enter your access key to unlock the vault.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Access Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loading}
                autoFocus
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-50 text-zinc-900 font-medium rounded-lg flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Clean Footer Tiers */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Tier:</span>
          <div className="flex gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-400">viewer</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-400">uploader</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-400">admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
