import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/providers/WalletContextProvider";
import { AppProvider } from "@/providers/AppProvider";
import { Navbar } from "@/components/Navbar";
import { RegistrationCheck } from "@/components/RegistrationCheck";
import { ToasterProvider } from "@/components/ToasterProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Degen Decks",
  description: "Play Whot on Solana, Win Solana!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletContextProvider>
          <AppProvider>
            <Navbar/>
            {children}
            <RegistrationCheck />
            <ToasterProvider />
          </AppProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
