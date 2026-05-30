import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sleep Clues — Frictionless Sleep Tracker",
  description: "Log your sleep and habits in under 30 seconds to automatically reveal disruptors and helpers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-20 sm:pb-0 bg-[#090b16] text-[#f8fafc]">
        <Navigation />
        <main className="flex-1 w-full max-w-md mx-auto px-4 pt-6 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
