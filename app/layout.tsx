import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ինֆո",
  description: "Կիսվեք տեղեկություններով՝ առանց ձեր անունը կամ կապի տվյալները նշելու։",
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hy">
      <head><link rel="preload" href="/fonts/NotoSansArmenian.ttf" as="font" type="font/ttf" crossOrigin="anonymous"/></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
