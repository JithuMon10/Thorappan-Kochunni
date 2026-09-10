import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabaseServer";

export async function GET() {
  const role = await getCurrentUserRole();
  return NextResponse.json({
    authenticated: Boolean(role),
    role,
    isSupabaseConfigured: isSupabaseConfigured(),
  });
}
