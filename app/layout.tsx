import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import GrainOverlay from "@/components/GrainOverlay";
import CustomCursor from "@/components/CustomCursor";
import RainCanvas from "@/components/RainCanvas";
import SmoothScroll from "@/components/SmoothScroll";
import PixelCursorTrail from "@/components/ui/pixel-trail";
import Nav from "@/components/Nav";
import GlobalSpotlight from "@/components/GlobalSpotlight";
import PageTransition from "@/components/PageTransition";

const urduFont = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-urdu",
  display: "swap",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zai — Abdullah Khan",
  description: "CS/BBA @ Waterloo. Builder. Toronto.",
  openGraph: {
    title: "Zai — Abdullah Khan",
    description: "CS/BBA @ Waterloo. Builder. Toronto.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-void">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${urduFont.variable} bg-void text-off-white antialiased`}
      >
        <SmoothScroll />
        <GrainOverlay />
        <RainCanvas />
        <PixelCursorTrail />
        <CustomCursor />
        <GlobalSpotlight />
        <Nav />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
