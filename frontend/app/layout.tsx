import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DES Pune University — Unified Platform",
  description:
    "Your complete university operating system. Manage courses, collaborate with peers, track assignments, and access resources — all in one place.",
  keywords: [
    "DES Pune University",
    "Student Portal",
    "University Dashboard",
    "Academic Platform",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className={`${inter.variable} h-full antialiased`} style={{ colorScheme: "light" }}>
      <body className="min-h-full flex flex-col font-sans" style={{ background: "#F8F9FB", color: "#111827" }}>
        {children}
      </body>
    </html>
  );
}
