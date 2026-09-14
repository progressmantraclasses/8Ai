// Header — dashboard title bar with live update status and refresh controls

"use client";

import React from "react";
import { formatRelativeTime } from "@/lib/formatters";

interface HeaderProps {
  lastUpdated: string | null;
  isRefreshing: boolean;
  isStale: boolean;
  onRefresh: () => void;
}

export default function Header({
  lastUpdated,
  isRefreshing,
  isStale,
  onRefresh,
}: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Portfolio Dashboard
        </h1>
        <p className="text-sm text-surface-200/50 mt-1">
          Real-time stock portfolio tracker · 26 holdings across 6 sectors
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Last updated indicator */}
        <div className="flex items-center gap-2 text-xs text-surface-200/50">
          {/* Live dot */}
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isRefreshing
                ? "bg-accent animate-pulse"
                : isStale
                ? "bg-amber-400"
                : "bg-gain animate-pulse-subtle"
            }`}
          />
          <span>
            {isRefreshing
              ? "Refreshing..."
              : isStale
              ? `Stale · ${formatRelativeTime(lastUpdated)}`
              : `Updated ${formatRelativeTime(lastUpdated)}`}
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-200/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh portfolio data"
        >
          <svg
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>
    </header>
  );
}
