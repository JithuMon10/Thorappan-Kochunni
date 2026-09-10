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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.role) {
            setRole(data.role);
          }
          setIsSupabaseConfigured(Boolean(data.isSupabaseConfigured));
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleAuthenticated = (userRole: UserRole) => {
    setRole(userRole);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setRole(null);
    } catch (err) {
      console.error("Logout error:", err);
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
