"use client";

import React, { useMemo } from "react";
import type { SectorSummary, StockWithMetrics } from "@portfolio/shared";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface PortfolioInsightsProps {
  sectors: SectorSummary[];
}

export default function PortfolioInsights({ sectors }: PortfolioInsightsProps) {
  const insights = useMemo(() => {
    let topGainer: StockWithMetrics | null = null;
    let topLoser: StockWithMetrics | null = null;
    let bestSector: SectorSummary | null = null;

    sectors.forEach((sector) => {
      if (
        sector.totalGainLossPercent !== null &&
        typeof sector.totalGainLossPercent === "number" &&
        !isNaN(sector.totalGainLossPercent)
      ) {
        if (
          !bestSector ||
          bestSector.totalGainLossPercent === null ||
          sector.totalGainLossPercent > bestSector.totalGainLossPercent
        ) {
          bestSector = sector;
        }
      }

      sector.stocks.forEach((stock) => {
        const glp = stock.derived?.gainLossPercent;
        if (glp !== null && glp !== undefined && typeof glp === "number" && !isNaN(glp)) {
          if (
            !topGainer ||
            topGainer.derived?.gainLossPercent === null ||
            topGainer.derived?.gainLossPercent === undefined ||
            glp > topGainer.derived.gainLossPercent
          ) {
            topGainer = stock;
          }
          if (
            !topLoser ||
            topLoser.derived?.gainLossPercent === null ||
            topLoser.derived?.gainLossPercent === undefined ||
            glp < topLoser.derived.gainLossPercent
          ) {
            topLoser = stock;
          }
        }
      });
    });

    return { topGainer, topLoser, bestSector };
  }, [sectors]);

  const { topGainer, topLoser, bestSector } = insights;

  const gainer = topGainer as StockWithMetrics | null;
  const loser = topLoser as StockWithMetrics | null;
  const best = bestSector as SectorSummary | null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="rounded-xl border border-white/10 bg-surface-900/60 backdrop-blur-sm p-5 border-l-4 border-l-gain/50">
        <p className="text-xs font-medium text-surface-200/50 uppercase tracking-wider mb-2">
          Top Gainer
        </p>
        {gainer && gainer.derived?.gainLossPercent != null ? (
          <div>
            <p className="text-lg font-bold text-white truncate">
              {gainer.particulars}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-gain font-mono font-bold">
                {formatPercent(gainer.derived.gainLossPercent)}
              </span>
              <span className="text-xs text-surface-200/50 font-mono">
                ({formatCurrency(gainer.derived.gainLoss)})
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-surface-200/50">N/A</p>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-surface-900/60 backdrop-blur-sm p-5 border-l-4 border-l-loss/50">
        <p className="text-xs font-medium text-surface-200/50 uppercase tracking-wider mb-2">
          Top Loser
        </p>
        {loser && loser.derived?.gainLossPercent != null ? (
          <div>
            <p className="text-lg font-bold text-white truncate">
              {loser.particulars}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-loss font-mono font-bold">
                {formatPercent(loser.derived.gainLossPercent)}
              </span>
              <span className="text-xs text-surface-200/50 font-mono">
                ({formatCurrency(loser.derived.gainLoss)})
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-surface-200/50">N/A</p>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-surface-900/60 backdrop-blur-sm p-5 border-l-4 border-l-accent/50">
        <p className="text-xs font-medium text-surface-200/50 uppercase tracking-wider mb-2">
          Best Performing Sector
        </p>
        {best && best.totalGainLossPercent != null ? (
          <div>
            <p className="text-lg font-bold text-white truncate">
              {best.sector}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-accent-light font-mono font-bold">
                {formatPercent(best.totalGainLossPercent)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-surface-200/50">N/A</p>
        )}
      </div>
    </div>
  );
}

