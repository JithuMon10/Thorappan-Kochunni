import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/auth";
import { isSiteClosed, setSiteClosed } from "@/lib/settings";

export async function GET() {
  const role = await getCurrentUserRole();
  if (role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin privileges required." },
      { status: 403 }
    );
  }

  const siteClosed = await isSiteClosed();
  return NextResponse.json({ siteClosed });
}

export async function POST(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin privileges required." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { siteClosed } = body;

    if (typeof siteClosed !== "boolean") {
      return NextResponse.json({ error: "Invalid payload: siteClosed must be boolean" }, { status: 400 });
    }

    await setSiteClosed(siteClosed);

    return NextResponse.json({
      success: true,
      siteClosed,
      message: siteClosed
        ? "Access closed to all users. Only Admin can log in."
        : "Access restored. All users can log in.",
    });
  } catch (err: any) {
    console.error("Site access update error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
