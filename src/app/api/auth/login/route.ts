import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabaseServer";
import { createSessionToken, verifyPassword, COOKIE_NAME } from "@/lib/auth";
import { UserRole } from "@/types";

// Default fallback passwords if Supabase is not yet configured (for local dev testing)
const DEV_FALLBACK_PASSWORDS: Record<string, UserRole> = {
  viewer123: "viewer",
  uploader123: "uploader",
  admin123: "admin",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    let authenticatedRole: UserRole | null = null;

    if (!isSupabaseConfigured()) {
      // Supabase is not configured yet - check dev fallback
      const matched = DEV_FALLBACK_PASSWORDS[password];
      if (matched) {
        authenticatedRole = matched;
      }
    } else {
      const supabase = getSupabaseServerClient();
      const { data: passwordRows, error } = await supabase
        .from("app_passwords")
        .select("role, password_hash");

      if (error) {
        console.error("Database query error checking passwords:", error);
        return NextResponse.json(
          { error: "Database error verifying credentials. Ensure supabase_schema.sql was run." },
          { status: 500 }
        );
      }

      if (passwordRows && passwordRows.length > 0) {
        for (const row of passwordRows) {
          const isMatch = await verifyPassword(password, row.password_hash);
          if (isMatch) {
            authenticatedRole = row.role as UserRole;
            break;
          }
        }
      }
    }

    if (!authenticatedRole) {
      // Add slight delay to discourage brute force
      await new Promise((res) => setTimeout(res, 500));
      return NextResponse.json(
        { error: "Incorrect access password. Please try again." },
        { status: 401 }
      );
    }

    // Create signed JWT
    const token = await createSessionToken(authenticatedRole);

    const response = NextResponse.json({
      success: true,
      role: authenticatedRole,
    });

    // Set HTTP-Only secure cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
