import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import OfflineGate from "@/components/shared/OfflineGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "লেখক ফোরাম — বাংলা লেখকদের সোশ্যাল প্ল্যাটফর্ম",
  description:
    "লেখক ফোরাম: বাংলা লেখকদের জন্য সোশ্যাল ফিড, টাইমলাইন, রিচ-টেক্সট পোস্ট, ছবি-ভিডিও-অডিও কোলাজ সহ আধুনিক প্ল্যাটফর্ম।",
  keywords: ["লেখক ফোরাম", "Lekhok Forum", "বাংলা লেখা", "সাহিত্য", "সোশ্যাল নেটওয়ার্ক"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "লেখক ফোরাম — Lekhok Forum",
    description: "বাংলা লেখকদের নিজের সোশ্যাল প্ল্যাটফর্ম",
    siteName: "লেখক ফোরাম",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoBengali.variable} antialiased`}
      >
        <OfflineGate>{children}</OfflineGate>
        <Toaster />
      </body>
    </html>
  );
}
