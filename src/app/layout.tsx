import type { Metadata } from "next";
import { Ubuntu_Mono } from "next/font/google";
import "./globals.css";

const ubuntuMono = Ubuntu_Mono({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "project",
  description: "a keyboard-first project, task, and habit tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link href="/images/favicon.ico" rel="icon" />
      <body className={ubuntuMono.className}>{children}</body>
    </html>
  );
}
