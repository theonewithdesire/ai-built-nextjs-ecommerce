'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "../app/styles/globals.css";
import MainLayout from "./components/layout/MainLayout";
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata moved to metadata.js file

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <head>
        <title>Cookies Shop</title>
        <meta name="description" content="Delicious homemade cookies for every occasion" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {isAdminPage ? (
          children
        ) : (
          <MainLayout>
            {children}
          </MainLayout>
        )}
      </body>
    </html>
  );
} 