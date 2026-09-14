// ErrorBanner — user-facing banner displaying clear error messages and data freshness

"use client";

import React from "react";
import { formatTime } from "@/lib/formatters";

interface ErrorBannerProps {
  /** The error message to display */
  message: string;
  /** ISO timestamp of when the error occurred or last good data */
  lastUpdated: string | null;
  /** Whether this is a partial error (some data available) vs. full failure */
  isPartial?: boolean;
  /** Callback to dismiss the banner */
  onDismiss?: () => void;
}

export default function ErrorBanner({
  message,
  lastUpdated,
  isPartial = false,
  onDismiss,
}: ErrorBannerProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-4 py-3 mb-6 border animate-slide-up ${
        isPartial
          ? "bg-amber-500/10 border-amber-500/20 text-amber-200"
          : "bg-loss-bg border-loss/20 text-loss-light"
      }`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        {/* Warning icon */}
        <svg
          className={`w-5 h-5 flex-shrink-0 ${
            isPartial ? "text-amber-400" : "text-loss"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>

        <div>
          <p className="text-sm font-medium">{message}</p>
          {lastUpdated && (
            <p className="text-xs mt-0.5 opacity-70">
              Last successful update: {formatTime(lastUpdated)}
            </p>
          )}
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-surface-200/50 hover:text-white transition-colors p-1"
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
