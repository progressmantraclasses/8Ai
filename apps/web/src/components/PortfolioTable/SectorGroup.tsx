// SectorGroup — renders collapsible sector header, stock rows, and subtotal row

"use client";

import React, { useState } from "react";
import type { SectorSummary } from "@portfolio/shared";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import StockRow from "./StockRow";
import GainLossCell from "./GainLossCell";

interface SectorGroupProps {
  sector: SectorSummary;
}

/** Maps sector names to gradient accent colors for visual distinction */
const SECTOR_COLORS: Record<string, string> = {
  "Financial Sector": "from-blue-500/20 to-blue-600/5",
  "Tech Sector": "from-violet-500/20 to-violet-600/5",
  Consumer: "from-emerald-500/20 to-emerald-600/5",
  Power: "from-amber-500/20 to-amber-600/5",
  "Pipe Sector": "from-cyan-500/20 to-cyan-600/5",
  Others: "from-rose-500/20 to-rose-600/5",
};

const SECTOR_BORDER_COLORS: Record<string, string> = {
  "Financial Sector": "border-blue-500/30",
  "Tech Sector": "border-violet-500/30",
  Consumer: "border-emerald-500/30",
  Power: "border-amber-500/30",
  "Pipe Sector": "border-cyan-500/30",
  Others: "border-rose-500/30",
};

export default function SectorGroup({ sector }: SectorGroupProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const gradientClass = SECTOR_COLORS[sector.sector] || "from-gray-500/20 to-gray-600/5";
  const borderClass = SECTOR_BORDER_COLORS[sector.sector] || "border-gray-500/30";

  return (
    <tbody className="animate-fade-in">
      {/* Sector Header Row */}
      <tr
        className={`bg-gradient-to-r ${gradientClass} cursor-pointer group`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td
          colSpan={12}
          className={`px-4 py-3 border-l-4 ${borderClass}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Expand/Collapse indicator */}
              <svg
                className={`w-4 h-4 text-surface-200/60 transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>

              <h3 className="text-sm font-semibold text-white tracking-wide">
                {sector.sector}
              </h3>
              <span className="text-xs text-surface-200/40 bg-white/5 px-2 py-0.5 rounded-full">
                {sector.stocks.length} stocks
              </span>
            </div>

            {/* Sector summary — visible even when collapsed */}
            <div className="flex items-center gap-6 text-xs">
              <div className="text-surface-200/60">
                Invested:{" "}
                <span className="text-surface-200/90 font-mono font-medium">
                  {formatCurrency(sector.totalInvestment)}
                </span>
              </div>
              <div className="text-surface-200/60">
                Current:{" "}
                <span className="text-surface-200/90 font-mono font-medium">
                  {formatCurrency(sector.totalPresentValue)}
                </span>
              </div>
              <GainLossCell
                value={sector.totalGainLoss}
                showBoth={true}
                percentValue={sector.totalGainLossPercent}
              />
            </div>
          </div>
        </td>
      </tr>

      {/* Stock Rows — only visible when expanded */}
      {isExpanded &&
        sector.stocks.map((stock, index) => (
          <StockRow key={stock.id} stock={stock} index={index} />
        ))}

      {/* Sector Subtotal Row — only visible when expanded */}
      {isExpanded && (
        <tr className="bg-white/[0.02] border-b border-white/10">
          <td className="px-4 py-2.5" colSpan={2}>
            <span className="text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
              {sector.sector} Total
            </span>
          </td>
          <td colSpan={2}></td>
          <td className="px-4 py-2.5 text-sm text-white text-right font-mono font-semibold">
            {formatCurrency(sector.totalInvestment)}
          </td>
          <td></td>
          <td></td>
          <td></td>
          <td className="px-4 py-2.5 text-sm text-white text-right font-mono font-semibold">
            {formatCurrency(sector.totalPresentValue)}
          </td>
          <td className="px-4 py-2.5 text-right">
            <GainLossCell
              value={sector.totalGainLoss}
              showBoth={true}
              percentValue={sector.totalGainLossPercent}
            />
          </td>
          <td></td>
          <td></td>
        </tr>
      )}
    </tbody>
  );
}
