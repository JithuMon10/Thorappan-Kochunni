import React from "react";

interface VerifiedBadgeProps {
  className?: string;
}

export default function VerifiedBadge({ className = "w-3.5 h-3.5" }: VerifiedBadgeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`inline-block shrink-0 ${className}`}
      aria-label="Approved"
    >
      <title>Approved</title>
      {/* Instagram 12-lobed scalloped badge */}
      <path
        d="M19.965 8.521C19.988 8.347 20 8.173 20 8c0-2.761-2.239-5-5-5-.173 0-.347.012-.521.035C13.418 2.378 12.727 2 12 2s-1.418.378-2.479 1.035C9.347 3.012 9.173 3 9 3 6.239 3 4 5.239 4 8c0 .173.012.347.035.521C3.378 9.582 3 10.273 3 11s.378 1.418 1.035 2.479C4.012 13.653 4 13.827 4 14c0 2.761 2.239 5 5 5 .173 0 .347-.012.521-.035C10.582 19.622 11.273 20 12 20s1.418-.378 2.479-1.035c.174.023.348.035.521.035 2.761 0 5-2.239 5-5 0-.173-.012-.347-.035-.521C20.622 12.418 21 11.727 21 11s-.378-1.418-1.035-2.479z"
        fill="#0095F6"
      />
      {/* Instagram white checkmark */}
      <path
        d="M10.02 14.5a.75.75 0 0 1-.53-.22l-2.27-2.27a.75.75 0 1 1 1.06-1.06l1.74 1.74 4.74-4.74a.75.75 0 1 1 1.06 1.06l-5.27 5.27a.75.75 0 0 1-.53.22z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
