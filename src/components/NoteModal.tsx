"use client";

import React, { useState } from "react";
import { X, Copy, Check, FileText } from "lucide-react";
import { PostItem } from "@/types";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostItem | null;
}

export default function NoteModal({ isOpen, onClose, post }: NoteModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const content = post.content || "";
  const lines = content.split("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full max-h-[85vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 truncate pr-4">
            <div className="p-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 truncate">
                {post.title || "Note"}
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                {lines.length} lines • {content.length} characters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3 flex-1 overflow-auto rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 font-mono text-xs text-zinc-200">
          <div className="flex">
            <div className="select-none pr-3 text-right text-zinc-600 border-r border-zinc-800 mr-3 shrink-0">
              {lines.map((_, i) => (
                <div key={i} className="leading-5">
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="overflow-x-auto w-full">
              {lines.map((line, i) => (
                <div key={i} className="leading-5 whitespace-pre">
                  {line || " "}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
