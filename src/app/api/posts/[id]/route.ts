import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/auth";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabaseServer";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = await getCurrentUserRole();
  if (role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin privileges required to delete items." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, message: "Item deleted (dev mode)" });
  }

  try {
    const supabase = getSupabaseServerClient();

    // 1. Fetch post to see if it has a file attached in storage
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("file_url, type")
      .eq("id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching post before delete:", fetchError);
    }

    // 2. If it's a file, remove from Supabase Storage
    if (post?.file_url) {
      try {
        const urlParts = post.file_url.split("/thorappankochunni_files/");
        if (urlParts.length > 1) {
          const filePath = decodeURIComponent(urlParts[1].split("?")[0]);
          await supabase.storage.from("thorappankochunni_files").remove([filePath]);
        }
      } catch (storageErr) {
        console.warn("Storage deletion warning:", storageErr);
      }
    }

    // 3. Delete from posts table
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Failed to delete post:", deleteError);
      return NextResponse.json({ error: "Failed to delete post from database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Post and associated files deleted" });
  } catch (err: any) {
    console.error("Delete post error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
