import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WebSocketInitializer from "@/components/WebSocketInitializer";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuantAI — AI Trading Dashboard",
  description:
    "Professional AI-powered trading dashboard with live agent monitoring, market watchlist, and automated trade execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${geistSans.variable} ${geistMono.variable} font-sans`}
    >
      <body className="h-full" suppressHydrationWarning>
        <AuthProvider>
          <WebSocketInitializer />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
