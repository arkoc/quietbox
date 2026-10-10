import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quietbox — Ուղարկել տեղեկություն",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
