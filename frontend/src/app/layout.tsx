import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "@/components/NavBar";
import BackendWakeUp from "@/components/BackendWakeUp";

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
      </body>
    </html>
  );
}
