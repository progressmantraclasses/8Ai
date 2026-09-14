// LoadingSpinner — skeleton shimmer loading placeholder for portfolio dashboard

"use client";

import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="w-full animate-fade-in">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-surface-900/60 p-5 space-y-3"
          >
            <div className="h-3 w-24 bg-white/5 rounded animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
            <div className="h-8 w-32 bg-white/5 rounded animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
            <div className="h-3 w-20 bg-white/5 rounded animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="rounded-xl border border-white/10 bg-surface-900/50 p-5 mb-8">
        <div className="h-3 w-32 bg-white/5 rounded mb-4 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
        <div className="h-[200px] bg-white/[0.02] rounded-lg flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-white/5 border-t-accent/30 animate-spin" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-white/10 bg-surface-900/50 overflow-hidden">
        {/* Table header */}
        <div className="bg-white/[0.04] px-4 py-3 flex gap-4">
          {[40, 120, 80, 50, 90, 60, 70, 80, 90, 100, 60, 70].map((w, i) => (
            <div
              key={i}
              className="h-3 bg-white/5 rounded animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-white/5 via-white/10 to-white/5"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* Table rows */}
        {[...Array(8)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="px-4 py-3 flex gap-4 border-t border-white/5"
            style={{ animationDelay: `${rowIndex * 100}ms` }}
          >
            {[40, 120, 80, 50, 90, 60, 70, 80, 90, 100, 60, 70].map((w, i) => (
              <div
                key={i}
                className="h-4 bg-white/[0.03] rounded animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03]"
                style={{ width: w, animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
