// PortfolioSummaryCards — displays total investment, present value, gain/loss, and holding counts

"use client";

import React from "react";
import { formatCurrencyCompact, formatPercent, formatLargeNumber } from "@/lib/formatters";

interface PortfolioSummaryCardsProps {
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalGainLossPercent: number | null;
  stockCount: number;
  sectorCount: number;
}

export default function PortfolioSummaryCards({
  totalInvestment,
  totalPresentValue,
  totalGainLoss,
  totalGainLossPercent,
  stockCount,
  sectorCount,
}: PortfolioSummaryCardsProps) {
  const isGain = totalGainLoss !== null && totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Investment */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-surface-900/60 backdrop-blur-sm p-5 group hover:border-white/20 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-xs font-medium text-surface-200/50 uppercase tracking-wider mb-1">
            Total Investment
          </p>
          <p className="text-2xl font-bold text-white font-mono">
            {formatCurrencyCompact(totalInvestment)}
          </p>
          <p className="text-xs text-surface-200/40 mt-2">
            {stockCount} stocks · {sectorCount} sectors
          </p>
        </div>
      </div>

      {/* Present Value */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-surface-900/60 backdrop-blur-sm p-5 group hover:border-white/20 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-xs font-medium text-surface-200/50 uppercase tracking-wider mb-1">
            Present Value
          </p>
          <p className="text-2xl font-bold text-white font-mono">
            {totalPresentValue !== null
              ? formatCurrencyCompact(totalPresentValue)
              : "—"}
          </p>
          <p className="text-xs text-surface-200/40 mt-2">
            Live market value
          </p>
        </div>
      </div>

      {/* Total Gain/Loss */}
      <div
        className={`relative overflow-hidden rounded-xl border bg-surface-900/60 backdrop-blur-sm p-5 group transition-all duration-300 ${
          totalGainLoss === null
            ? "border-white/10 hover:border-white/20"
            : isGain
            ? "border-gain/20 hover:border-gain/40"
            : "border-loss/20 hover:border-loss/40"
        }`}
      >
        <div
          className={`absolute inset-0 pointer-events-none ${
            totalGainLoss === null
              ? "bg-gradient-to-br from-gray-500/5 to-transparent"
              : isGain
              ? "bg-gradient-to-br from-gain/5 to-transparent"
              : "bg-gradient-to-br from-loss/5 to-transparent"
          }`}
        />
        <div className="relative">
          <p className="text-xs font-medium text-surface-200/50 uppercase tracking-wider mb-1">
            Total Gain / Loss
          </p>
          <p
            className={`text-2xl font-bold font-mono ${
              totalGainLoss === null
                ? "text-surface-200/50"
                : isGain
                ? "text-gain"
                : "text-loss"
            }`}
          >
            {totalGainLoss !== null
              ? formatCurrencyCompact(totalGainLoss)
              : "—"}
          </p>
          <p
            className={`text-xs mt-2 font-medium ${
              totalGainLossPercent === null
                ? "text-surface-200/40"
                : isGain
                ? "text-gain/70"
                : "text-loss/70"
            }`}
          >
            {formatPercent(totalGainLossPercent)}
          </p>
        </div>
      </div>

      {/* Portfolio Health */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-surface-900/60 backdrop-blur-sm p-5 group hover:border-white/20 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-xs font-medium text-surface-200/50 uppercase tracking-wider mb-1">
            Portfolio Summary
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-white">{stockCount}</p>
            <p className="text-sm text-surface-200/50">Holdings</p>
          </div>
          <p className="text-xs text-surface-200/40 mt-2">
            Across {sectorCount} sectors
          </p>
        </div>
      </div>
    </div>
  );
}
