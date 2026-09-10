import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/auth";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabaseServer";
import { PostItem } from "@/types";

// In-memory store for local testing if Supabase is not connected yet
let localDevPosts: PostItem[] = [
  {
    id: "demo-welcome-note",
    title: "Vault Setup Guide",
    type: "text",
    content:
      "This is your secure file and text vault.\nUse it to transfer code, documents, and images between college lab and home.\n\nConnect Supabase by adding your keys to .env.local to persist all uploads.",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-sample-code",
    title: "Lab Assignment Snippet",
    type: "text",
    content:
      "def run_lab_test():\n    print('Executing transfer test...')\n    return True\n\nif __name__ == '__main__':\n    run_lab_test()",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export async function GET() {
  const role = await getCurrentUserRole();
  if (!role) {
    return NextResponse.json({ error: "Unauthorized. Please enter access password." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ posts: localDevPosts });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return NextResponse.json({ error: "Failed to fetch posts from database" }, { status: 500 });
    }

    return NextResponse.json({ posts: data || [] });
  } catch (err: any) {
    console.error("Posts GET error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (!role || (role !== "uploader" && role !== "admin")) {
    return NextResponse.json(
      { error: "Forbidden: You need 'Uploader' or 'Admin' access to upload files or text." },
      { status: 403 }
    );
  }

  const contentType = req.headers.get("content-type") || "";

  // 1. Text / Code Note Upload (JSON)
  if (contentType.includes("application/json")) {
    try {
      const { title, content } = await req.json();
      if (!content || !content.trim()) {
        return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
      }

      if (!isSupabaseConfigured()) {
        const newPost: PostItem = {
          id: `local-${Date.now()}`,
          title: title?.trim() || "Quick Note",
          type: "text",
          content: content.trim(),
          created_at: new Date().toISOString(),
        };
        localDevPosts = [newPost, ...localDevPosts];
        return NextResponse.json({ success: true, post: newPost });
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: title?.trim() || "Quick Note",
          type: "text",
          content: content.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to insert text note:", error);
        return NextResponse.json({ error: "Failed to save note to database" }, { status: 500 });
      }

      return NextResponse.json({ success: true, post: data });
    } catch (err: any) {
      console.error("JSON post error:", err);
      return NextResponse.json({ error: err?.message || "Invalid payload" }, { status: 400 });
    }
  }

  // 2. File Upload (FormData)
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const title = (formData.get("title") as string) || "";

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const originalName = file.name;
      const fileSize = file.size;
      const fileType = file.type || "application/octet-stream";

      if (!isSupabaseConfigured()) {
        // Dev fallback simulation
        const newPost: PostItem = {
          id: `local-file-${Date.now()}`,
          title: title.trim() || originalName,
          type: "file",
          file_name: originalName,
          file_size: fileSize,
          file_type: fileType,
          file_url: null,
          content: "Demo file upload (Connect Supabase to store actual cloud files)",
          created_at: new Date().toISOString(),
        };
        localDevPosts = [newPost, ...localDevPosts];
        return NextResponse.json({ success: true, post: newPost });
      }

      const supabase = getSupabaseServerClient();
      const buffer = Buffer.from(await file.arrayBuffer());

      // Generate sanitized filename with timestamp prefix
      const cleanFileName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${Date.now()}_${cleanFileName}`;

      // Upload to Supabase Storage Bucket
      const { error: uploadError } = await supabase.storage
        .from("thorappankochunni_files")
        .upload(storagePath, buffer, {
          contentType: fileType,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        return NextResponse.json(
          { error: `Storage upload failed: ${uploadError.message}. Make sure bucket 'thorappankochunni_files' exists.` },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("thorappankochunni_files")
        .getPublicUrl(storagePath);

      const fileUrl = publicUrlData.publicUrl;

      // Insert post row into database
      const { data, error: dbError } = await supabase
        .from("posts")
        .insert({
          title: title.trim() || originalName,
          type: "file",
          file_name: originalName,
          file_url: fileUrl,
          file_size: fileSize,
          file_type: fileType,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Supabase DB insert error:", dbError);
        return NextResponse.json({ error: "Failed to record file in database" }, { status: 500 });
      }

      return NextResponse.json({ success: true, post: data });
    } catch (err: any) {
      console.error("Multipart upload error:", err);
      return NextResponse.json({ error: err?.message || "File upload processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
}
