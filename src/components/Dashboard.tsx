"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LogOut,
  Upload,
  FileText,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  Download,
  Trash2,
  Search,
  Settings,
  Copy,
  Check,
  Eye,
  FileQuestion,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { PostItem, UserRole } from "@/types";
import AdminSettingsModal from "./AdminSettingsModal";
import LightboxModal from "./LightboxModal";
import NoteModal from "./NoteModal";

interface DashboardProps {
  role: UserRole;
  onLogout: () => void;
  isSupabaseConfigured: boolean;
}

export default function Dashboard({ role, onLogout, isSupabaseConfigured }: DashboardProps) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"file" | "note">("file");

  // Filter and search
  const [filterType, setFilterType] = useState<"all" | "files" | "pdf" | "images" | "notes">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Upload file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick note state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Modals
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [activeModalNote, setActiveModalNote] = useState<PostItem | null>(null);

  // Delete & copy state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canUpload = role === "uploader" || role === "admin";
  const canAdmin = role === "admin";

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || uploading) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", fileTitle.trim());

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "File upload failed.");
      } else {
        setSelectedFile(null);
        setFileTitle("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (data.post) {
          setPosts((prev) => [data.post, ...prev]);
        } else {
          fetchPosts();
        }
      }
    } catch (err: any) {
      setUploadError(err?.message || "Upload network error");
    } finally {
      setUploading(false);
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || savingNote) return;

    setSavingNote(true);
    setNoteError(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle.trim() || "Note",
          content: noteContent.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setNoteError(data.error || "Failed to save note.");
      } else {
        setNoteTitle("");
        setNoteContent("");
        if (data.post) {
          setPosts((prev) => [data.post, ...prev]);
        } else {
          fetchPosts();
        }
      }
    } catch (err: any) {
      setNoteError(err?.message || "Network error");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canAdmin) return;
    if (!confirm("Permanently delete this item?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete item");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !searchQuery.trim() ||
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === "all") return true;
      if (filterType === "notes") return post.type === "text";
      if (filterType === "pdf") {
        return (
          post.type === "file" &&
          (post.file_type?.toLowerCase().includes("pdf") ||
            post.file_name?.toLowerCase().endsWith(".pdf"))
        );
      }
      if (filterType === "images") {
        return (
          post.type === "file" &&
          (post.file_type?.startsWith("image/") ||
            /\.(png|jpe?g|gif|webp|svg)$/i.test(post.file_name || ""))
        );
      }
      if (filterType === "files") return post.type === "file";

      return true;
    });
  }, [posts, searchQuery, filterType]);

  const getFileIcon = (fileType?: string | null, fileName?: string | null) => {
    const fn = (fileName || "").toLowerCase();
    const ft = (fileType || "").toLowerCase();

    if (ft.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fn)) {
      return <ImageIcon className="w-4 h-4 text-zinc-400" />;
    }
    if (ft.includes("pdf") || fn.endsWith(".pdf")) {
      return <FileText className="w-4 h-4 text-zinc-400" />;
    }
    if (/\.(zip|tar|gz|rar|7z)$/i.test(fn)) {
      return <FileArchive className="w-4 h-4 text-zinc-400" />;
    }
    if (/\.(py|js|ts|cpp|c|java|html|css|json|sql|sh)$/i.test(fn)) {
      return <FileCode className="w-4 h-4 text-zinc-400" />;
    }
    return <FileQuestion className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 pb-16 text-zinc-100">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-mono font-semibold text-xs text-zinc-200">
            T
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-zinc-100">
              thorappankochunni
            </span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="text-xs text-zinc-400 font-mono capitalize">
              {role}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {canAdmin && (
            <button
              onClick={() => setAdminModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Lock session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Warning banner if Supabase is pending setup */}
      {!isSupabaseConfigured && (
        <div className="bg-zinc-900/60 border-b border-zinc-800 px-4 py-2 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>
            Local Sandbox Mode. Configure Supabase in <code>.env.local</code> to persist data across devices.
          </span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 flex-1 flex flex-col gap-6">
        {/* Upload Box (Only for Uploader & Admin) */}
        {canUpload ? (
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm">
            {/* Tab switch */}
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-800/80">
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === "file"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("note")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === "note"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Text / Note
              </button>
            </div>

            {/* File Upload Tab */}
            {activeTab === "file" && (
              <form onSubmit={handleFileUpload} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <input
                      type="text"
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      placeholder="Title (optional)"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg px-3 py-2 bg-zinc-950/60 transition-colors flex items-center justify-between text-xs text-zinc-300"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Upload className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">
                          {selectedFile ? (
                            <span className="text-zinc-200 font-medium">
                              {selectedFile.name} ({formatFileSize(selectedFile.size)})
                            </span>
                          ) : (
                            <span className="text-zinc-500">
                              Choose file (PDF, image, document, zip)...
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                        Browse
                      </span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                </div>

                {uploadError && (
                  <div className="p-2 rounded bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
                    {uploadError}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!selectedFile || uploading}
                    className="py-1.5 px-4 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-40 text-zinc-950 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Upload</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Note Tab */}
            {activeTab === "note" && (
              <form onSubmit={handleNoteSubmit} className="space-y-3">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note Title / Code Name"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400"
                />
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Paste text, commands, or code snippet here..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 font-mono resize-y"
                />

                {noteError && (
                  <div className="p-2 rounded bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
                    {noteError}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!noteContent.trim() || savingNote}
                    className="py-1.5 px-4 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-40 text-zinc-950 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {savingNote ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Save Note</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>
        ) : (
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-3 rounded-xl text-xs text-zinc-400 flex items-center justify-between">
            <span>Viewing mode enabled. Enter Uploader or Admin password to add files.</span>
          </div>
        )}

        {/* Filter bar and Search */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          {/* Filters without emojis */}
          <div className="flex items-center gap-1.5 text-xs">
            {[
              { id: "all", label: "All" },
              { id: "files", label: "Files" },
              { id: "pdf", label: "PDFs" },
              { id: "images", label: "Images" },
              { id: "notes", label: "Notes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterType === tab.id
                    ? "bg-zinc-800 text-zinc-100 font-medium"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
            <button
              onClick={fetchPosts}
              title="Refresh"
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </section>

        {/* Post Boxes Feed Grid */}
        <section className="flex-1">
          {loading && posts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-500 text-xs gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
              <span>Loading vault...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-xl py-14 px-4 text-center text-xs text-zinc-500">
              {searchQuery ? "No items match your search." : "Vault is empty. Upload a file or save a note."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post) => {
                const isImage =
                  post.type === "file" &&
                  (post.file_type?.startsWith("image/") ||
                    /\.(png|jpe?g|gif|webp|svg)$/i.test(post.file_name || ""));
                const isPdf =
                  post.type === "file" &&
                  (post.file_type?.includes("pdf") ||
                    post.file_name?.toLowerCase().endsWith(".pdf"));
                const isText = post.type === "text";

                return (
                  <div
                    key={post.id}
                    className="surface-card rounded-xl p-4 flex flex-col justify-between group"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-zinc-800 border border-zinc-700/50">
                          {isText ? (
                            <FileCode className="w-3.5 h-3.5 text-zinc-300" />
                          ) : (
                            getFileIcon(post.file_type, post.file_name)
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {formatDate(post.created_at)}
                        </span>
                      </div>

                      {canAdmin && (
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="text-zinc-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-semibold text-zinc-200 truncate mb-2">
                      {post.title || post.file_name || "Untitled"}
                    </h3>

                    {/* Content */}
                    <div className="flex-1 my-1.5">
                      {/* Image Box */}
                      {isImage && post.file_url && (
                        <div
                          onClick={() =>
                            setLightboxImage({
                              url: post.file_url!,
                              title: post.title || post.file_name || "Image Preview",
                            })
                          }
                          className="relative w-full h-40 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 cursor-pointer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.file_url}
                            alt={post.file_name || "Image"}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-2 py-1 rounded bg-zinc-900/90 text-zinc-200 text-[11px] flex items-center gap-1 border border-zinc-700">
                              <Eye className="w-3 h-3" /> Expand
                            </span>
                          </div>
                        </div>
                      )}

                      {/* PDF Box */}
                      {isPdf && (
                        <div className="rounded-lg p-3 bg-zinc-900/70 border border-zinc-800 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-300 shrink-0">
                            PDF
                          </div>
                          <div className="truncate flex-1">
                            <p className="text-xs text-zinc-200 truncate font-medium">
                              {post.file_name}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {formatFileSize(post.file_size)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Generic File Box */}
                      {post.type === "file" && !isImage && !isPdf && (
                        <div className="rounded-lg p-3 bg-zinc-900/70 border border-zinc-800 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
                            {getFileIcon(post.file_type, post.file_name)}
                          </div>
                          <div className="truncate flex-1">
                            <p className="text-xs text-zinc-200 truncate font-medium">
                              {post.file_name}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {formatFileSize(post.file_size)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Text Note Box */}
                      {isText && (
                        <div
                          onClick={() => setActiveModalNote(post)}
                          className="rounded-lg p-3 bg-zinc-950 border border-zinc-800/80 font-mono text-[11px] text-zinc-300 max-h-32 overflow-hidden relative cursor-pointer hover:border-zinc-700 transition-colors"
                        >
                          <pre className="whitespace-pre-wrap line-clamp-4 leading-relaxed text-zinc-300 font-mono">
                            {post.content}
                          </pre>
                          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2.5 mt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      {isText ? (
                        <>
                          <span className="text-[10px] font-mono text-zinc-500">
                            Note
                          </span>
                          <button
                            onClick={() => handleCopyText(post.id, post.content || "")}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors cursor-pointer"
                          >
                            {copiedId === post.id ? (
                              <>
                                <Check className="w-3 h-3 text-zinc-300" />
                                <span className="text-[11px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[11px]">Copy</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {formatFileSize(post.file_size)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {post.file_url ? (
                              <>
                                <a
                                  href={post.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded bg-zinc-800/70 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={post.file_url}
                                  download={post.file_name || "file"}
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors"
                                  title="Download"
                                >
                                  <Download className="w-3 h-3" />
                                  <span className="text-[11px]">Download</span>
                                </a>
                              </>
                            ) : (
                              <span className="text-[10px] text-zinc-500">
                                Connect Supabase
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <AdminSettingsModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      <LightboxModal
        isOpen={Boolean(lightboxImage)}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage?.url || null}
        title={lightboxImage?.title || null}
      />

      <NoteModal
        isOpen={Boolean(activeModalNote)}
        onClose={() => setActiveModalNote(null)}
        post={activeModalNote}
      />
    </div>
  );
}
