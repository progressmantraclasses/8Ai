import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Portfolio Dashboard | Real-Time Stock Tracker",
  description:
    "Dynamic portfolio dashboard tracking 26 stock holdings across 6 sectors with real-time CMP updates from Yahoo Finance, P/E ratios, and sector-level analytics.",
  keywords: [
    "portfolio dashboard",
    "stock tracker",
    "Yahoo Finance",
    "sector analysis",
    "gain loss tracker",
    "Indian stocks",
    "NSE",
    "BSE",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="font-sans antialiased">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
