// GainLossCell — single source of truth for gain/loss values and color coding

"use client";

import React from "react";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface GainLossCellProps {
  /** Absolute gain/loss value in ₹ */
  value: number | null;
  /** Optional: show as percentage instead of absolute value */
  isPercent?: boolean;
  /** Optional: show both absolute and percentage */
  showBoth?: boolean;
  /** Percentage value (required when showBoth is true) */
  percentValue?: number | null;
  /** Additional CSS classes */
  className?: string;
}

// Renders gain/loss with color coding and graceful fallback for unavailable data
export default function GainLossCell({
  value,
  isPercent = false,
  showBoth = false,
  percentValue,
  className = "",
}: GainLossCellProps) {
  // Null CMP means we can't compute gain/loss — show a dash, not zero
  if (value === null) {
    return (
      <span className={`text-surface-200/50 ${className}`}>—</span>
    );
  }

  const isPositive = value > 0;
  const isZero = value === 0;

  // Color classes based on gain/loss direction
  const colorClass = isZero
    ? "text-surface-200/70"
    : isPositive
    ? "text-gain"
    : "text-loss";

  const bgClass = isZero
    ? ""
    : isPositive
    ? "bg-gain-bg"
    : "bg-loss-bg";

  if (showBoth) {
    return (
      <div className={`flex flex-col items-end ${className}`}>
        <span
          className={`${colorClass} font-medium text-sm`}
        >
          {formatCurrency(value)}
        </span>
        <span
          className={`${colorClass} text-xs mt-0.5 px-1.5 py-0.5 rounded ${bgClass}`}
        >
          {formatPercent(percentValue ?? null)}
        </span>
      </div>
    );
  }

  if (isPercent) {
    return (
      <span
        className={`${colorClass} px-2 py-1 rounded text-sm font-medium ${bgClass} ${className}`}
      >
        {formatPercent(value)}
      </span>
    );
  }

  return (
    <span className={`${colorClass} font-medium text-sm ${className}`}>
      {formatCurrency(value)}
    </span>
  );
}
