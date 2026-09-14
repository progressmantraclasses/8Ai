// StockRow — presentational component rendering a single stock row with metrics

"use client";

import React from "react";
import type { StockWithMetrics } from "@portfolio/shared";
import {
  formatCurrency,
  formatWeight,
  formatNumber,
} from "@/lib/formatters";
import GainLossCell from "./GainLossCell";

interface StockRowProps {
  stock: StockWithMetrics;
  index: number;
}

export default function StockRow({ stock, index }: StockRowProps) {
  const { derived } = stock;

  // Visual indicator for fetch status
  const statusDot =
    stock.fetchStatus === "ok" ? (
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gain mr-2" title="Live data" />
    ) : stock.fetchStatus === "stale" ? (
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2" title="Stale data" />
    ) : (
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-loss mr-2" title="Data unavailable" />
    );

  return (
    <tr
      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors duration-150 group"
    >
      {/* Index */}
      <td className="px-4 py-3 text-surface-200/50 text-sm text-center w-12">
        {index + 1}
      </td>

      {/* Particulars (Stock Name) */}
      <td className="px-4 py-3 text-sm font-medium text-white">
        <div className="flex items-center">
          {statusDot}
          <span>{stock.particulars}</span>
        </div>
      </td>

      {/* Purchase Price */}
      <td className="px-4 py-3 text-sm text-surface-200/80 text-right font-mono">
        {formatCurrency(stock.purchasePrice)}
      </td>

      {/* Quantity */}
      <td className="px-4 py-3 text-sm text-surface-200/80 text-center font-mono">
        {stock.quantity}
      </td>

      {/* Investment */}
      <td className="px-4 py-3 text-sm text-surface-200/90 text-right font-mono">
        {formatCurrency(derived.investment)}
      </td>

      {/* Portfolio Weight */}
      <td className="px-4 py-3 text-sm text-surface-200/70 text-center">
        {formatWeight(derived.portfolioWeight)}
      </td>

      {/* Exchange Code */}
      <td className="px-4 py-3 text-xs text-accent-light font-mono text-center">
        {stock.exchangeCode}
      </td>

      {/* CMP */}
      <td className="px-4 py-3 text-sm text-white text-right font-mono font-medium">
        {stock.cmp !== null ? (
          <span className="inline-flex items-center">
            {formatCurrency(stock.cmp)}
            {stock.fetchStatus === "ok" && (
              <span className="ml-1.5 w-1 h-1 rounded-full bg-gain animate-pulse-subtle" />
            )}
          </span>
        ) : (
          <span className="text-surface-200/40">—</span>
        )}
      </td>

      {/* Present Value */}
      <td className="px-4 py-3 text-sm text-surface-200/90 text-right font-mono">
        {formatCurrency(derived.presentValue)}
      </td>

      {/* Gain/Loss (absolute + percentage) */}
      <td className="px-4 py-3 text-right">
        <GainLossCell
          value={derived.gainLoss}
          showBoth={true}
          percentValue={derived.gainLossPercent}
        />
      </td>

      {/* P/E Ratio */}
      <td className="px-4 py-3 text-sm text-surface-200/70 text-center font-mono">
        {formatNumber(stock.peRatioTTM)}
      </td>

      {/* Latest Earnings */}
      <td className="px-4 py-3 text-sm text-surface-200/70 text-right font-mono">
        {formatNumber(stock.latestEarnings)}
      </td>
    </tr>
  );
}
