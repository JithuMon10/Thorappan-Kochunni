"use client";

import React from "react";
import { X, Download, ExternalLink } from "lucide-react";

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title: string | null;
}

export default function LightboxModal({ isOpen, onClose, imageUrl, title }: LightboxModalProps) {
  if (!isOpen || !imageUrl) return null;

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
          <span className="text-xs font-medium text-zinc-200 truncate pr-4">
            {title || "Image Preview"}
          </span>
          <div className="flex items-center gap-1.5">
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
