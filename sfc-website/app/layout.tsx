import type { Metadata } from "next";
import { Inter, Titillium_Web, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-titillium",
});
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "St. Andrew's Fan Club — SFC",
  description: "Where the Thrill of Sport Meets the Greatest Story.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${titillium.variable} ${jetbrains.variable} min-h-full flex flex-col text-sfc-text`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}