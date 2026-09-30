import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabaseServer";
import { isSiteClosed } from "@/lib/settings";

export async function GET() {
  const role = await getCurrentUserRole();
  const siteClosed = await isSiteClosed();

  if (siteClosed && role !== "admin") {
    return NextResponse.json({
      authenticated: false,
      role: null,
      error: "Site has been closed. Contact admin.",
      isSupabaseConfigured: isSupabaseConfigured(),
    });
  }

  return NextResponse.json({
    authenticated: Boolean(role),
    role,
    isSupabaseConfigured: isSupabaseConfigured(),
  });
}

