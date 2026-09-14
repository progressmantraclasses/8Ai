// Pure calculation functions for portfolio metrics — deterministic, no side effects
import type { Stock, DerivedStockMetrics, StockWithMetrics, SectorSummary } from "@portfolio/shared";

export function calculateInvestment(purchasePrice: number, quantity: number): number {
  return purchasePrice * quantity;
}

export function calculatePresentValue(cmp: number | null, quantity: number): number | null {
  if (cmp === null) return null;
  return cmp * quantity;
}

export function calculateGainLoss(presentValue: number | null, investment: number): number | null {
  if (presentValue === null) return null;
  return presentValue - investment;
}

export function calculateGainLossPercent(gainLoss: number | null, investment: number): number | null {
  if (gainLoss === null) return null;
  if (investment === 0) return 0;
  return gainLoss / investment;
}

export function calculatePortfolioWeight(investment: number, totalPortfolioInvestment: number): number {
  if (totalPortfolioInvestment === 0) return 0;
  return investment / totalPortfolioInvestment;
}

export function calculateDerivedMetrics(stock: Stock, totalPortfolioInvestment: number): DerivedStockMetrics {
  const investment = calculateInvestment(stock.purchasePrice, stock.quantity);
  const presentValue = calculatePresentValue(stock.cmp, stock.quantity);
  const gainLoss = calculateGainLoss(presentValue, investment);
  const gainLossPercent = calculateGainLossPercent(gainLoss, investment);
  const portfolioWeight = calculatePortfolioWeight(investment, totalPortfolioInvestment);
  return { investment, presentValue, gainLoss, gainLossPercent, portfolioWeight };
}

export function calculateTotalInvestment(stocks: Stock[]): number {
  return stocks.reduce((sum, stock) => sum + calculateInvestment(stock.purchasePrice, stock.quantity), 0);
}

// Groups stocks by sector and produces sector-level summaries with aggregated totals
export function calculateSectorSummaries(stocks: Stock[]): SectorSummary[] {
  const totalPortfolioInvestment = calculateTotalInvestment(stocks);
  const sectorMap = new Map<string, Stock[]>();

  for (const stock of stocks) {
    const existing = sectorMap.get(stock.sector) || [];
    existing.push(stock);
    sectorMap.set(stock.sector, existing);
  }

  const summaries: SectorSummary[] = [];

  for (const [sector, sectorStocks] of sectorMap) {
    const stocksWithMetrics: StockWithMetrics[] = sectorStocks.map((stock) => ({
      ...stock,
      derived: calculateDerivedMetrics(stock, totalPortfolioInvestment),
    }));

    const totalInvestment = stocksWithMetrics.reduce((sum, s) => sum + s.derived.investment, 0);
    const hasAnyPresentValue = stocksWithMetrics.some((s) => s.derived.presentValue !== null);

    let totalPresentValue: number | null = null;
    let totalGainLoss: number | null = null;
    let totalGainLossPercent: number | null = null;

    if (hasAnyPresentValue) {
      // Stocks without CMP fall back to investment so sector totals remain meaningful
      totalPresentValue = stocksWithMetrics.reduce(
        (sum, s) => sum + (s.derived.presentValue ?? s.derived.investment),
        0
      );
      totalGainLoss = totalPresentValue - totalInvestment;
      totalGainLossPercent = totalInvestment > 0 ? totalGainLoss / totalInvestment : 0;
    }

    summaries.push({ sector, totalInvestment, totalPresentValue, totalGainLoss, totalGainLossPercent, stocks: stocksWithMetrics });
  }

  return summaries;
}

// Computes grand totals across all sectors
export function calculatePortfolioTotals(sectors: SectorSummary[]): {
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalGainLossPercent: number | null;
} {
  const totalInvestment = sectors.reduce((sum, s) => sum + s.totalInvestment, 0);
  const hasAnyPresentValue = sectors.some((s) => s.totalPresentValue !== null);

  if (!hasAnyPresentValue) {
    return { totalInvestment, totalPresentValue: null, totalGainLoss: null, totalGainLossPercent: null };
  }

  const totalPresentValue = sectors.reduce((sum, s) => sum + (s.totalPresentValue ?? s.totalInvestment), 0);
  const totalGainLoss = totalPresentValue - totalInvestment;
  const totalGainLossPercent = totalInvestment > 0 ? totalGainLoss / totalInvestment : 0;

  return { totalInvestment, totalPresentValue, totalGainLoss, totalGainLossPercent };
}
