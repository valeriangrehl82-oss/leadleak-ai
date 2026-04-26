import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "LeadLeak AI",
  description: "Lead-Recovery fuer Schweizer KMU.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH">
      <body className="min-h-screen bg-slate-50 text-navy-950">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
