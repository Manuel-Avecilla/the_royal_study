import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "The Royal Study",
  description: "Un sofisticado juego de puzzles de lógica espacial y ajedrez en 3x3. Calcula, predice y ejecuta los movimientos perfectos.",
  icons: {
    icon: "/assets/SVG with shadow/w_rook_svg_withShadow.svg",
  },
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
