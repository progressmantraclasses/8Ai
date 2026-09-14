// Unit tests for pure portfolio calculation functions

import {
  calculateInvestment,
  calculatePresentValue,
  calculateGainLoss,
  calculateGainLossPercent,
  calculatePortfolioWeight,
  calculateDerivedMetrics,
  calculateTotalInvestment,
  calculateSectorSummaries,
  calculatePortfolioTotals,
} from "../src/lib/calculations";
import type { Stock } from "@portfolio/shared";

// --- Test fixtures ---

/** Creates a test Stock with sensible defaults */
function createTestStock(overrides: Partial<Stock> = {}): Stock {
  return {
    id: "test-stock-1",
    particulars: "Test Stock",
    exchangeCode: "TESTSTOCK",
    exchange: "NSE",
    purchasePrice: 100,
    quantity: 10,
    sector: "Test Sector",
    cmp: 120,
    peRatioTTM: 20,
    latestEarnings: 5,
    lastUpdated: new Date().toISOString(),
    fetchStatus: "ok",
    ...overrides,
  };
}

// --- calculateInvestment ---

describe("calculateInvestment", () => {
  it("returns purchasePrice × quantity", () => {
    expect(calculateInvestment(100, 10)).toBe(1000);
  });

  it("handles zero quantity", () => {
    expect(calculateInvestment(100, 0)).toBe(0);
  });

  it("handles large numbers without overflow", () => {
    expect(calculateInvestment(6466, 15)).toBe(96990);
  });

  it("handles decimal purchase prices", () => {
    expect(calculateInvestment(1700.15, 50)).toBeCloseTo(85007.5, 2);
  });
});

// --- calculatePresentValue ---

describe("calculatePresentValue", () => {
  it("returns cmp × quantity when cmp is available", () => {
    expect(calculatePresentValue(120, 10)).toBe(1200);
  });

  it("returns null when cmp is null — null and zero are different facts", () => {
    expect(calculatePresentValue(null, 10)).toBeNull();
  });

  it("returns 0 when cmp is 0 (stock is worth zero, not unknown)", () => {
    expect(calculatePresentValue(0, 10)).toBe(0);
  });
});

// --- calculateGainLoss ---

describe("calculateGainLoss", () => {
  it("returns positive value for gains", () => {
    expect(calculateGainLoss(1200, 1000)).toBe(200);
  });

  it("returns negative value for losses", () => {
    expect(calculateGainLoss(800, 1000)).toBe(-200);
  });

  it("returns zero when present value equals investment", () => {
    expect(calculateGainLoss(1000, 1000)).toBe(0);
  });

  it("returns null when present value is null", () => {
    expect(calculateGainLoss(null, 1000)).toBeNull();
  });
});

// --- calculateGainLossPercent ---

describe("calculateGainLossPercent", () => {
  it("returns gain/loss as a decimal fraction of investment", () => {
    expect(calculateGainLossPercent(200, 1000)).toBeCloseTo(0.2, 5);
  });

  it("returns negative for losses", () => {
    expect(calculateGainLossPercent(-200, 1000)).toBeCloseTo(-0.2, 5);
  });

  it("returns null when gainLoss is null", () => {
    expect(calculateGainLossPercent(null, 1000)).toBeNull();
  });

  it("handles zero investment gracefully", () => {
    expect(calculateGainLossPercent(0, 0)).toBe(0);
  });
});

// --- calculatePortfolioWeight ---

describe("calculatePortfolioWeight", () => {
  it("returns investment as a fraction of total", () => {
    expect(calculatePortfolioWeight(10000, 100000)).toBeCloseTo(0.1, 5);
  });

  it("returns 0 when total portfolio is 0", () => {
    expect(calculatePortfolioWeight(1000, 0)).toBe(0);
  });

  it("returns 1 when investment equals total", () => {
    expect(calculatePortfolioWeight(100000, 100000)).toBeCloseTo(1.0, 5);
  });
});

// --- calculateDerivedMetrics ---

describe("calculateDerivedMetrics", () => {
  it("computes all derived fields from a stock with live CMP", () => {
    const stock = createTestStock({
      purchasePrice: 1490,
      quantity: 50,
      cmp: 1700.15,
    });

    const derived = calculateDerivedMetrics(stock, 1543060);

    expect(derived.investment).toBe(74500);
    expect(derived.presentValue).toBeCloseTo(85007.5, 1);
    expect(derived.gainLoss).toBeCloseTo(10507.5, 1);
    expect(derived.gainLossPercent).toBeCloseTo(0.14104, 3);
    expect(derived.portfolioWeight).toBeCloseTo(0.04828, 3);
  });

  it("handles null CMP — derived values dependent on CMP are null", () => {
    const stock = createTestStock({ cmp: null });
    const derived = calculateDerivedMetrics(stock, 100000);

    expect(derived.investment).toBe(1000); // Still computable
    expect(derived.presentValue).toBeNull();
    expect(derived.gainLoss).toBeNull();
    expect(derived.gainLossPercent).toBeNull();
    expect(derived.portfolioWeight).toBeCloseTo(0.01, 5); // Still computable
  });
});

// --- calculateTotalInvestment ---

describe("calculateTotalInvestment", () => {
  it("sums investment across all stocks", () => {
    const stocks = [
      createTestStock({ purchasePrice: 100, quantity: 10 }),
      createTestStock({ purchasePrice: 200, quantity: 5 }),
    ];

    expect(calculateTotalInvestment(stocks)).toBe(2000);
  });

  it("returns 0 for an empty array", () => {
    expect(calculateTotalInvestment([])).toBe(0);
  });
});

// --- calculateSectorSummaries ---

describe("calculateSectorSummaries", () => {
  it("groups stocks by sector and computes sector totals", () => {
    const stocks = [
      createTestStock({
        id: "s1",
        sector: "Sector A",
        purchasePrice: 100,
        quantity: 10,
        cmp: 120,
      }),
      createTestStock({
        id: "s2",
        sector: "Sector A",
        purchasePrice: 200,
        quantity: 5,
        cmp: 180,
      }),
      createTestStock({
        id: "s3",
        sector: "Sector B",
        purchasePrice: 300,
        quantity: 3,
        cmp: 350,
      }),
    ];

    const summaries = calculateSectorSummaries(stocks);

    expect(summaries).toHaveLength(2);
    expect(summaries[0].sector).toBe("Sector A");
    expect(summaries[0].stocks).toHaveLength(2);
    expect(summaries[0].totalInvestment).toBe(2000);
    expect(summaries[0].totalPresentValue).toBe(2100); // 1200 + 900
    expect(summaries[0].totalGainLoss).toBe(100);

    expect(summaries[1].sector).toBe("Sector B");
    expect(summaries[1].stocks).toHaveLength(1);
    expect(summaries[1].totalInvestment).toBe(900);
  });

  it("handles stocks with null CMP in a sector", () => {
    const stocks = [
      createTestStock({
        id: "s1",
        sector: "Mixed",
        purchasePrice: 100,
        quantity: 10,
        cmp: 120,
      }),
      createTestStock({
        id: "s2",
        sector: "Mixed",
        purchasePrice: 200,
        quantity: 5,
        cmp: null,
      }),
    ];

    const summaries = calculateSectorSummaries(stocks);

    // Should still compute totals — stocks without CMP fall back to investment
    expect(summaries[0].totalPresentValue).toBe(2200); // 1200 + 1000 (fallback)
  });
});

// --- calculatePortfolioTotals ---

describe("calculatePortfolioTotals", () => {
  it("aggregates totals across all sectors", () => {
    const sectors = [
      {
        sector: "A",
        totalInvestment: 10000,
        totalPresentValue: 12000,
        totalGainLoss: 2000,
        totalGainLossPercent: 0.2,
        stocks: [],
      },
      {
        sector: "B",
        totalInvestment: 20000,
        totalPresentValue: 18000,
        totalGainLoss: -2000,
        totalGainLossPercent: -0.1,
        stocks: [],
      },
    ];

    const totals = calculatePortfolioTotals(sectors);

    expect(totals.totalInvestment).toBe(30000);
    expect(totals.totalPresentValue).toBe(30000); // 12000 + 18000
    expect(totals.totalGainLoss).toBe(0);
    expect(totals.totalGainLossPercent).toBe(0);
  });
});
