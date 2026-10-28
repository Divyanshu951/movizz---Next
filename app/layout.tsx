import type { Metadata } from "next";
import { Calistoga, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const calistoga = Calistoga({
  variable: "--font-calistoga",
  weight: "400",
  subsets: ["latin"],
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movizz | Cinematic Buzz",
  description: "Discover trending movies, TV series, audience reviews, and your personal wishlist.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${calistoga.variable} ${serif.variable} ${inter.variable}  h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <NavBar />
      </body>
    </html>
  );
}
