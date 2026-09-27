"use client";

import React, { useState, useEffect } from "react";
import { X, Edit2, Loader2, Check } from "lucide-react";
import { PostItem } from "@/types";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostItem | null;
  onPostUpdated: (updated: PostItem) => void;
}

export default function EditPostModal({
  isOpen,
  onClose,
  post,
  onPostUpdated,
}: EditPostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title || post.file_name || "");
      setContent(post.content || "");
      setError(null);
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update item.");
      } else {
        const updated: PostItem = {
          ...post,
          title: title.trim() || null,
          content: content,
        };
        onPostUpdated(updated);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700/60 text-zinc-300">
            <Edit2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Edit Post
            </h2>
            <p className="text-[11px] text-zinc-400">
              Update name or description
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Title / Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post Title / Name..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Description / Content
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Description, notes, or code..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 font-mono resize-y"
            />
          </div>

          {error && (
            <div className="p-2 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-1.5 px-4 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 text-zinc-900 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
