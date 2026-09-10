import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserRole, hashPassword } from "@/lib/auth";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabaseServer";

export async function PUT(req: NextRequest) {
  const currentRole = await getCurrentUserRole();
  if (currentRole !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Only Admin can update access passwords." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { targetRole, newPassword } = body;

    if (!targetRole || !["viewer", "uploader", "admin"].includes(targetRole)) {
      return NextResponse.json({ error: "Invalid target role specified." }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 3) {
      return NextResponse.json(
        { error: "New password must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: `Password for ${targetRole} updated in local test mode. To persist permanently, connect Supabase.`,
      });
    }

    const supabase = getSupabaseServerClient();
    const newHash = await hashPassword(newPassword);

    const { error } = await supabase
      .from("app_passwords")
      .upsert({
        role: targetRole,
        password_hash: newHash,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Failed to update password:", error);
      return NextResponse.json(
        { error: `Database error updating password: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully changed password for [${targetRole}]!`,
    });
  } catch (err: any) {
    console.error("Admin password update error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
