// PortfolioTable rendered using @tanstack/react-table with built-in sector grouping
"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { SectorSummary, StockWithMetrics } from "@portfolio/shared";
import GainLossCell from "./GainLossCell";
import {
  formatCurrency,
  formatPercent,
  formatWeight,
} from "@/lib/formatters";

interface PortfolioTableProps {
  sectors: SectorSummary[];
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalGainLossPercent: number | null;
}

const columnHelper = createColumnHelper<StockWithMetrics>();

export default function PortfolioTable({
  sectors,
  totalInvestment,
  totalPresentValue,
  totalGainLoss,
  totalGainLossPercent,
}: PortfolioTableProps) {
  // Flatten data for react-table
  const data = useMemo(() => sectors.flatMap((s) => s.stocks), [sectors]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("sector", {
        header: "Sector",
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: "index",
        header: "#",
        cell: (info) => (info.row.getIsGrouped() ? "" : info.row.index + 1),
      }),
      columnHelper.accessor("particulars", {
        header: "Particulars",
        cell: (info) => {
          if (info.row.getIsGrouped()) {
            return (
              <button
                className="flex items-center gap-2 font-bold text-white text-sm"
                onClick={info.row.getToggleExpandedHandler()}
              >
                <span className="text-accent">
                  {info.row.getIsExpanded() ? "▼" : "▶"}
                </span>
                {info.row.getValue("sector")} ({info.row.subRows.length})
              </button>
            );
          }
          return (
            <div className="flex flex-col">
              <span className="font-medium text-white">{info.getValue()}</span>
              {(info.row.original as StockWithMetrics & { fetchStatus?: string }).fetchStatus === "error" && (
                <span className="text-[10px] text-loss">Fetch Failed</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("purchasePrice", {
        header: "Purchase Price",
        cell: (info) =>
          info.row.getIsGrouped() ? "" : formatCurrency(info.getValue()),
      }),
      columnHelper.accessor("quantity", {
        header: "Qty",
        cell: (info) => (info.row.getIsGrouped() ? "" : info.getValue()),
      }),
      columnHelper.accessor("derived.investment", {
        header: "Investment",
        aggregationFn: "sum",
        cell: (info) => (
          <span className="font-mono font-medium">
            {formatCurrency(info.getValue() as number)}
          </span>
        ),
      }),
      columnHelper.accessor("derived.portfolioWeight", {
        header: "Portfolio %",
        aggregationFn: "sum",
        cell: (info) => (
          <span className="text-accent-light font-mono font-medium">
            {formatWeight(info.getValue() as number)}
          </span>
        ),
      }),
      columnHelper.accessor("exchangeCode", {
        header: "NSE/BSE",
        cell: (info) =>
          info.row.getIsGrouped() ? (
            ""
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-white/80">{info.getValue()}</span>
              <span className="text-[10px] text-surface-200/40">
                {info.row.original.exchange}
              </span>
            </div>
          ),
      }),
      columnHelper.accessor("cmp", {
        header: "CMP",
        cell: (info) => {
          if (info.row.getIsGrouped()) return "";
          const val = info.getValue();
          return val !== null ? (
            <span className="font-mono">{formatCurrency(val)}</span>
          ) : (
            <span className="text-surface-200/30">—</span>
          );
        },
      }),
      columnHelper.accessor("derived.presentValue", {
        header: "Present Value",
        aggregationFn: "sum",
        cell: (info) => {
          const val = info.getValue() as number | null;
          return val !== null ? (
            <span className="font-mono font-medium text-white">
              {formatCurrency(val)}
            </span>
          ) : (
            <span className="text-surface-200/30">—</span>
          );
        },
      }),
      columnHelper.accessor("derived.gainLoss", {
        header: "Gain / Loss",
        aggregationFn: "sum",
        cell: (info) => {
          const val = info.getValue() as number | null;

          if (info.row.getIsGrouped()) {
            const investment = info.row.getValue("derived_investment") as number;
            const presentValue = info.row.getValue("derived_presentValue") as number | null;
            let percent = null;
            if (presentValue !== null && investment > 0) {
              percent = (presentValue - investment) / investment;
            }
            return <GainLossCell value={val} showBoth={true} percentValue={percent} />;
          }

          return (
            <GainLossCell
              value={val}
              showBoth={true}
              percentValue={info.row.original.derived.gainLossPercent}
            />
          );
        },
      }),
      columnHelper.accessor("peRatioTTM", {
        header: "P/E (TTM)",
        cell: (info) => {
          if (info.row.getIsGrouped()) return "";
          const val = info.getValue();
          return val !== null ? (
            <span className="font-mono">{val.toFixed(2)}</span>
          ) : (
            <span className="text-surface-200/30">—</span>
          );
        },
      }),
      columnHelper.accessor("latestEarnings", {
        header: "Earnings",
        cell: (info) => {
          if (info.row.getIsGrouped()) return "";
          const val = info.getValue();
          return val !== null ? (
            <span className="font-mono">{formatCurrency(val)}</span>
          ) : (
            <span className="text-surface-200/30">—</span>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      grouping: ["sector"],
      expanded: true,
    },
    initialState: {
      expanded: true,
    },
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-surface-900/50 backdrop-blur-sm">
      <table className="w-full min-w-[1100px] border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="bg-white/[0.04] border-b border-white/10"
            >
              {headerGroup.headers.map((header) => {
                if (header.column.id === "sector") return null;
                return (
                  <th
                    key={header.id}
                    className="px-4 py-3.5 text-xs font-semibold text-surface-200/50 uppercase tracking-wider text-right first:text-center [&:nth-child(2)]:text-left"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isGroup = row.getIsGrouped();
            return (
              <tr
                key={row.id}
                className={`border-b border-white/5 transition-colors duration-150 ${
                  isGroup
                    ? "bg-surface-800/40 hover:bg-surface-800/60"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                {row.getAllCells().map((cell) => {
                  if (cell.column.id === "sector") return null;
                  return (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 text-sm text-surface-200/80 text-right first:text-center [&:nth-child(2)]:text-left ${
                        isGroup ? "py-4 bg-gradient-to-r from-white/[0.02] to-transparent" : ""
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="bg-white/[0.06] border-t-2 border-accent/30">
            <td className="px-4 py-4 text-center"></td>
            <td className="px-4 py-4 text-left">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Portfolio Total
              </span>
            </td>
            <td colSpan={2}></td>
            <td className="px-4 py-4 text-sm text-white text-right font-mono font-bold">
              {formatCurrency(totalInvestment)}
            </td>
            <td className="px-4 py-4 text-sm text-accent-light text-right font-mono font-semibold">
              100%
            </td>
            <td></td>
            <td></td>
            <td className="px-4 py-4 text-sm text-white text-right font-mono font-bold">
              {formatCurrency(totalPresentValue)}
            </td>
            <td className="px-4 py-4 text-right">
              <GainLossCell
                value={totalGainLoss}
                showBoth={true}
                percentValue={totalGainLossPercent}
              />
            </td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
