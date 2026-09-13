"use client";

import React, { useState, useEffect } from "react";
import LockScreen from "@/components/LockScreen";
import Dashboard from "@/components/Dashboard";
import { UserRole } from "@/types";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // Require password on every new visit:
  // Each time the site or tab is freshly opened, sessionStorage is empty,
  // so the user is ALWAYS treated as a total stranger.
  useEffect(() => {
    const initSession = async () => {
      try {
        const isTabUnlocked = sessionStorage.getItem("vault_session_unlocked");

        if (!isTabUnlocked) {
          // Fresh visit: clear any old server cookie and force lock screen
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
          setRole(null);
          setLoading(false);
          return;
        }

        // Active tab session: verify with server
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.role) {
            setRole(data.role);
          } else {
            sessionStorage.removeItem("vault_session_unlocked");
            setRole(null);
          }
          setIsSupabaseConfigured(Boolean(data.isSupabaseConfigured));
        } else {
          sessionStorage.removeItem("vault_session_unlocked");
          setRole(null);
        }
      } catch (err) {
        console.error("Session check error:", err);
        sessionStorage.removeItem("vault_session_unlocked");
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Auto-wipe session on tab close or navigation away
    const handlePageHide = () => {
      navigator.sendBeacon("/api/auth/logout");
      sessionStorage.removeItem("vault_session_unlocked");
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  const handleAuthenticated = (userRole: UserRole) => {
    sessionStorage.setItem("vault_session_unlocked", "true");
    setRole(userRole);
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("vault_session_unlocked");
      await fetch("/api/auth/logout", { method: "POST" });
      setRole(null);
    } catch (err) {
      console.error("Logout error:", err);
      sessionStorage.removeItem("vault_session_unlocked");
      setRole(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-500 text-xs">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!role) {
    return <LockScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <Dashboard
      role={role}
      onLogout={handleLogout}
      isSupabaseConfigured={isSupabaseConfigured}
    />
  );
}
