import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import BfCacheRecover from "@/components/BfCacheRecover";
import LeaderboardButton from "@/components/LeaderboardButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "May Madness Scoring",
  description: "O.B.I. Spring Classic Golf Tournament",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <BfCacheRecover />
          {/* FAB/panel first; main content wrapped so z-1 sits below fixed z-30/40/50 overlays only where they draw */}
          <LeaderboardButton />
          <div className="relative z-[1] min-h-dvh">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
