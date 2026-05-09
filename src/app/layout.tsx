import { Header } from "@/components/header";
import { LoadingOverlay } from "@/components/loading";
import { StoreProvider } from "@/store/provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
          <main className="h-[calc(100%_-_90px)] md:h-[calc(100%_-_65px)] overflow-auto">
            {children}
          </main>
          <LoadingOverlay />
        </StoreProvider>
      </body>
    </html>
  );
}
