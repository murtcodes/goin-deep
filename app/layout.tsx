import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goin' Deep 2026 — NHL Playoff Pool",
  description: "The boys' NHL playoff pool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
