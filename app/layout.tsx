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
  metadataBase: new URL("https://journal.kidney.pp.ua"),
  title: "Journal of Renal Science",
  description:
    "Незалежний науково-інформаційний онлайн-журнал з нефрології, діалізу, трансплантації нирки та клінічних досліджень.",
  keywords: ["nephrology", "renal science", "dialysis", "kidney transplantation", "нефрологія"],
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: "JRS — усі оновлення" },
        { url: "/feeds/articles.xml", title: "JRS — нові статті" },
        { url: "/feeds/notices.xml", title: "JRS — редакційні повідомлення" },
      ],
    },
  },
  openGraph: {
    title: "Journal of Renal Science",
    description: "Науковий журнал з нефрології, діалізу та трансплантації нирки.",
    type: "website",
    locale: "uk_UA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
