import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "The Royal Study | Chess Logic Puzzle",
  description: "A premium 3x3 chess puzzle game. Calculate, predict, and execute the exact moves to solve the royal study.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fontSans.variable}`}>
      <body className={`${fontSans.variable} font-sans antialiased text-gray-800 bg-white`}>
        {children}
      </body>
    </html>
  );
}
