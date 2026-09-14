"use client";

import React, { useState } from "react";
import { usePortfolioPolling } from "@/hooks/usePortfolioPolling";
import Header from "@/components/Header";
import PortfolioSummaryCards from "@/components/PortfolioSummaryCards";
import PortfolioInsights from "@/components/PortfolioInsights";
import SectorChart from "@/components/SectorChart";
import PortfolioTable from "@/components/PortfolioTable/PortfolioTable";
import ErrorBanner from "@/components/ErrorBanner";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const {
    data,
    error,
    isLoading,
    isStale,
    isRefreshing,
    lastUpdated,
    refresh,
  } = usePortfolioPolling();

  const [isDismissed, setIsDismissed] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          lastUpdated={null}
          isRefreshing={true}
          isStale={false}
          onRefresh={refresh}
        />
        <LoadingSpinner />
      </div>
    );
  }

  if (!data && error) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          lastUpdated={null}
          isRefreshing={false}
          isStale={false}
          onRefresh={refresh}
        />
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-16 h-16 rounded-full bg-loss-bg flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-loss"
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
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Unable to Load Portfolio
          </h2>
          <p className="text-sm text-surface-200/60 max-w-md mb-6">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-dark rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalStockCount = data.sectors.reduce(
    (sum, s) => sum + s.stocks.length,
    0
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Header
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        isStale={isStale}
        onRefresh={refresh}
      />

      {error && !isDismissed && (
        <ErrorBanner
          message={error}
          lastUpdated={lastUpdated}
          isPartial={data.hasErrors}
          onDismiss={() => setIsDismissed(true)}
        />
      )}

      <PortfolioSummaryCards
        totalInvestment={data.totalInvestment}
        totalPresentValue={data.totalPresentValue}
        totalGainLoss={data.totalGainLoss}
        totalGainLossPercent={data.totalGainLossPercent}
        stockCount={totalStockCount}
        sectorCount={data.sectors.length}
      />

      <PortfolioInsights sectors={data.sectors} />

      <SectorChart
        sectors={data.sectors}
        totalInvestment={data.totalInvestment}
      />

      <PortfolioTable
        sectors={data.sectors}
        totalInvestment={data.totalInvestment}
        totalPresentValue={data.totalPresentValue}
        totalGainLoss={data.totalGainLoss}
        totalGainLossPercent={data.totalGainLossPercent}
      />

      <footer className="mt-8 pb-4 text-center">
        <p className="text-xs text-surface-200/30">
          Data sourced from Yahoo Finance (CMP) · P/E and earnings from reference data ·
          Prices refresh every 15 seconds
        </p>
        <p className="text-xs text-surface-200/20 mt-1">
          Built for Octa Byte AI · Portfolio Dashboard Case Study
        </p>
      </footer>
    </div>
  );
}
