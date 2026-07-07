import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EFG Consulting · Client Portal",
  description: "Meta Ads reporting portal for EFG Consulting clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
