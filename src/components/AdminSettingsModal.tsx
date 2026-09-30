"use client";

import React, { useState, useEffect } from "react";
import { X, KeyRound, Check, Loader2, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { UserRole } from "@/types";

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccessChanged?: (siteClosed: boolean) => void;
}

export default function AdminSettingsModal({ isOpen, onClose, onAccessChanged }: AdminSettingsModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("viewer");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Site Access Control (Close access to all users)
  const [siteClosed, setSiteClosed] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [accessMessage, setAccessMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/admin/site-access")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.siteClosed === "boolean") {
            setSiteClosed(data.siteClosed);
          }
        })
        .catch((err) => console.error("Failed to load site access setting:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSiteAccess = async () => {
    setLoadingAccess(true);
    setAccessMessage(null);
    const newStatus = !siteClosed;
    try {
      const res = await fetch("/api/admin/site-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteClosed: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccessMessage({ type: "error", text: data.error || "Failed to update access." });
      } else {
        setSiteClosed(newStatus);
        setAccessMessage({
          type: "success",
          text: newStatus
            ? "Site access closed to all users except Admin."
            : "Access restored. All users can log in.",
        });
        if (onAccessChanged) onAccessChanged(newStatus);
      }
    } catch (err: any) {
      setAccessMessage({ type: "error", text: err?.message || "Failed to update access." });
    } finally {
      setLoadingAccess(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || loading) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/passwords", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: selectedRole,
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to update password." });
      } else {
        setMessage({ type: "success", text: data.message || `Password for ${selectedRole} updated.` });
        setNewPassword("");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Network error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <h2 className="text-base font-semibold text-zinc-100">
            Vault Settings
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage vault access and role passwords
          </p>
        </div>

        {/* Site Access Control */}
        <div className="mb-5 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${siteClosed ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
              <span className="text-xs font-semibold text-zinc-200">
                Close access to all users
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleSiteAccess}
              disabled={loadingAccess}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                siteClosed
                  ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60"
              }`}
            >
              {loadingAccess ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : siteClosed ? (
                <>
                  <Lock className="w-3 h-3 text-red-400" />
                  <span>Access Closed</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-zinc-400" />
                  <span>Close Access</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {siteClosed ? (
              <span className="text-red-400 font-medium">
                Active: Only Admin can log in. Other users see &quot;Site has been closed. Contact admin.&quot;
              </span>
            ) : (
              "When closed, only Admin can log in. Other users entering password will see: 'Site has been closed. Contact admin.'"
            )}
          </p>
          {accessMessage && (
            <div
              className={`mt-2.5 p-2 rounded-lg border text-xs flex items-center gap-2 ${
                accessMessage.type === "success"
                  ? "bg-zinc-800/80 border-zinc-700 text-zinc-200"
                  : "bg-red-950/30 border-red-800/40 text-red-300"
              }`}
            >
              {accessMessage.type === "success" && <Check className="w-3.5 h-3.5 text-zinc-300" />}
              <span>{accessMessage.text}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="pt-2 border-t border-zinc-800/80">
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Change Role Password
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["viewer", "uploader", "editor", "admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedRole(r);
                    setMessage(null);
                  }}
                  className={`py-1.5 px-3 rounded-lg border text-xs capitalize transition-colors ${
                    selectedRole === r
                      ? "bg-zinc-800 border-zinc-700 text-zinc-100 font-medium"
                      : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              New Password for {selectedRole}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 pr-10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                  : "bg-red-950/30 border-red-800/40 text-red-300"
              }`}
            >
              {message.type === "success" && <Check className="w-3.5 h-3.5 text-zinc-300" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newPassword.trim()}
              className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 text-zinc-900 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 space-y-1 font-mono">
          <p className="text-zinc-400">Direct SQL alternative in Supabase:</p>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px] overflow-x-auto select-all">
            UPDATE app_passwords SET password_hash = crypt(&apos;new_pass&apos;, gen_salt(&apos;bf&apos;, 10)) WHERE role = &apos;{selectedRole}&apos;;
          </div>
        </div>
      </div>
    </div>
  );
}
