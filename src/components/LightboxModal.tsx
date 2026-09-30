"use client";

import React, { useState } from "react";
import { X, Download, ExternalLink, Copy, Check, RefreshCw } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import { copyImageToClipboard } from "@/lib/clipboard";

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title: string | null;
  isApproved?: boolean;
  canAdmin?: boolean;
}

export default function LightboxModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  isApproved,
  canAdmin,
}: LightboxModalProps) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !imageUrl) return null;

  const handleCopy = async () => {
    if (!imageUrl || copying) return;
    setCopying(true);
    try {
      await copyImageToClipboard(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      console.error("Failed to copy image to clipboard:", err);
      alert("Could not copy image to clipboard: " + (err?.message || "Browser error"));
    } finally {
      setCopying(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-2xl overflow-hidden"
      >
        <div className="w-full flex items-center justify-between pb-2.5 mb-2 border-b border-zinc-800">
          <div className="flex items-center gap-1.5 truncate pr-4">
            <span className="text-xs font-medium text-zinc-200 truncate">
              {title || "Image Preview"}
            </span>
            {isApproved && <VerifiedBadge className="w-4 h-4" />}
          </div>
          <div className="flex items-center gap-1.5">
            {canAdmin && (
              <button
                type="button"
                onClick={handleCopy}
                disabled={copying}
                className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs transition-colors cursor-pointer border border-zinc-700/60"
                title="Copy image to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400">Copied</span>
                  </>
                ) : copying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    <span className="text-[11px]">Copying...</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy Image</span>
                  </>
                )}
              </button>
            )}
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Open original"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={imageUrl}
              download
              className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
              title="Download image"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="relative w-full flex-1 flex items-center justify-center overflow-auto max-h-[75vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title || "Image"}
            className="max-w-full max-h-[75vh] object-contain rounded"
          />
        </div>
      </div>
    </div>
  );
}
