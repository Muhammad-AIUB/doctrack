import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AppHeader } from "@/components/layout/AppHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocTrack — Medical queue & ETA",
  description:
    "Real-time queue tracking and dynamic ETA for doctor chambers. Patients see their place; staff run sessions from one dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
      >
        <AuthProvider>
          <AppHeader />
          <main className="min-h-[calc(100dvh-3.5rem)]">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
