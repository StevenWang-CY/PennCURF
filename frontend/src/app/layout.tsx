import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} antialiased bg-[var(--background)] min-h-screen flex flex-col`}>
        <nav className="sticky top-0 z-50 bg-[#011F5B]/95 backdrop-blur-md shadow-sm border-b border-blue-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14 items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded bg-white text-[#011F5B] flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                  P
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-white font-bold tracking-tight">Penn CURF</span>
                  <span className="text-xs text-blue-200 font-medium tracking-wide">Research Directory</span>
                </div>
              </Link>
              <div className="flex items-center space-x-8 text-sm font-medium">
                <Link href="/search" className="text-blue-100 hover:text-white transition-colors">
                  Find Research
                </Link>
                <Link href="/profile" className="text-blue-100 hover:text-white transition-colors">
                  My Profile
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-100 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <p className="text-gray-500 text-sm">Penn CURF Research Finder &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
