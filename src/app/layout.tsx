import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "LeadLeak AI",
  description: "Pilot-System für verpasste Anfragen bei Schweizer KMU.",
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
        <PublicFooter />
      </body>
    </html>
  );
}
