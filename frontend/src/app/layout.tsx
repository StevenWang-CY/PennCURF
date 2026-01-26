import type { Metadata } from "next";
import { Playfair_Display, Inter_Tight } from "next/font/google"; // High-end typography
import "./globals.css";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BackendStatusProvider } from "@/contexts/BackendStatusContext";
import NavBar from "@/components/NavBar";
import BackendWakeUp from "@/components/BackendWakeUp";

// "Massive Serif" for headlines
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

// "High Legibility" Sans for body
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Penn CURF Research Finder",
  description: "Find undergraduate research opportunities at Penn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${interTight.variable} font-sans antialiased bg-[var(--background)] min-h-screen flex flex-col`}>
        <BackendStatusProvider>
          <BackendWakeUp />
          <AuthProvider>
            <ProfileProvider>
              <NavBar />
              <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                {children}
              </main>
              <footer className="bg-white border-t border-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                  <p className="text-gray-500 text-sm">Penn CURF Research Finder &copy; {new Date().getFullYear()}</p>
                </div>
              </footer>
            </ProfileProvider>
          </AuthProvider>
        </BackendStatusProvider>
      </body>
    </html>
  );
}
