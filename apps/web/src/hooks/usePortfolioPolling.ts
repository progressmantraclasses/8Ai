// Custom hook — polls /api/portfolio every POLL_INTERVAL_MS and exposes dashboard state
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PortfolioResponse } from "@portfolio/shared";
import { POLL_INTERVAL_MS } from "@portfolio/shared";

interface UsePortfolioPollingResult {
  data: PortfolioResponse | null;
  error: string | null;
  isLoading: boolean;
  isStale: boolean;
  isRefreshing: boolean;
  lastUpdated: string | null;
  refresh: () => void;
}

export function usePortfolioPolling(): UsePortfolioPollingResult {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const isFirstFetch = useRef<boolean>(true);

  const fetchPortfolioData = useCallback(async () => {
    if (isFirstFetch.current) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch("/api/portfolio");
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message || `Server responded with status ${response.status}`);
      }

      const portfolioData: PortfolioResponse = await response.json();
      setData(portfolioData);
      setLastUpdated(portfolioData.lastUpdated);
      setError(null);

      if (portfolioData.hasErrors) {
        setError("Some stock prices could not be fetched. Showing last known values where available.");
      }
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to fetch portfolio data";
      setError(message);
      console.error("[usePortfolioPolling] Fetch failed:", message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFirstFetch.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPortfolioData();
    const intervalId = setInterval(fetchPortfolioData, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchPortfolioData]);

  // Data is stale if older than 2× poll interval
  const isStale = (() => {
    if (!lastUpdated) return false;
    return Date.now() - new Date(lastUpdated).getTime() > POLL_INTERVAL_MS * 2;
  })();

  return { data, error, isLoading, isStale, isRefreshing, lastUpdated, refresh: fetchPortfolioData };
}
