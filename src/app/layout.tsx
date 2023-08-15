import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NUS EVS Tracker",
  description: "Track your evs credit history",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="max-w-2xl mx-auto p-4 my-8">{children}</div>
      </body>
    </html>
  );
}
