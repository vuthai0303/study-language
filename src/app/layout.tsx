import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { StoreProvider } from "@/store/provider";
import { LoadingOverlay } from "@/components/loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyLanguage",
  description: "Application to learn languages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-svh`}
      >
        <StoreProvider>
          <Header />
          <main className="h-[calc(100% - 64px)] overflow-hidden">
            {children}
          </main>
          <LoadingOverlay />
        </StoreProvider>
      </body>
    </html>
  );
}
