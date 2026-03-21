import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Canopy - Continuous Remote Care",
  description:
    "A continuous remote care platform that keeps elderly patients healthy at home. AI-powered wellness monitoring for patients, caregivers, and clinicians.",
  keywords: ["remote care", "elderly care", "health monitoring", "AI healthcare"],
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
