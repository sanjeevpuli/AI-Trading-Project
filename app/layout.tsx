import type { Metadata } from "next";
import "./globals.css";
import WebSocketInitializer from "@/components/WebSocketInitializer";
import { AuthProvider } from "@/context/AuthContext";

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
      className="h-full antialiased font-sans"
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
