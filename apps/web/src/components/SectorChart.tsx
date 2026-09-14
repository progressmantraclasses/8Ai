// SectorChart — donut chart and breakdown list of portfolio allocation by sector

"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { SectorSummary } from "@portfolio/shared";
import { formatCurrencyCompact, formatWeight } from "@/lib/formatters";

interface SectorChartProps {
  sectors: SectorSummary[];
  totalInvestment: number;
}

/** Color palette for sector slices — distinct, accessible colors */
const SECTOR_CHART_COLORS = [
  "#6366f1", // Indigo — Financial
  "#8b5cf6", // Violet — Tech
  "#22c55e", // Green — Consumer
  "#f59e0b", // Amber — Power
  "#06b6d4", // Cyan — Pipe
  "#f43f5e", // Rose — Others
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
      percent: number;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-surface-800 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-white">{data.name}</p>
      <p className="text-xs text-surface-200/70 mt-1">
        {formatCurrencyCompact(data.value)}
      </p>
      <p className="text-xs text-accent-light">
        {formatWeight(data.percent)}
      </p>
    </div>
  );
}

export default function SectorChart({
  sectors,
  totalInvestment,
}: SectorChartProps) {
  const chartData = sectors.map((sector) => ({
    name: sector.sector,
    value: sector.totalInvestment,
    percent: totalInvestment > 0 ? sector.totalInvestment / totalInvestment : 0,
  }));

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900/50 backdrop-blur-sm p-5 mb-8">
      <h3 className="text-sm font-semibold text-surface-200/70 uppercase tracking-wider mb-4">
        Sector Allocation
      </h3>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="w-full lg:w-1/2 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SECTOR_CHART_COLORS[index % SECTOR_CHART_COLORS.length]}
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-xs text-surface-200/70">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Breakdown List */}
        <div className="w-full lg:w-1/2 space-y-3">
          {sectors.map((sector, index) => {
            const weight =
              totalInvestment > 0
                ? sector.totalInvestment / totalInvestment
                : 0;

            return (
              <div key={sector.sector} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{
                    backgroundColor:
                      SECTOR_CHART_COLORS[index % SECTOR_CHART_COLORS.length],
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-200/80 truncate">
                      {sector.sector}
                    </span>
                    <span className="text-sm text-surface-200/60 font-mono ml-2">
                      {formatWeight(weight)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-white/5 rounded-full h-1.5 mt-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${weight * 100}%`,
                        backgroundColor:
                          SECTOR_CHART_COLORS[
                            index % SECTOR_CHART_COLORS.length
                          ],
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-surface-200/50 font-mono w-24 text-right flex-shrink-0">
                  {formatCurrencyCompact(sector.totalInvestment)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
