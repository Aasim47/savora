import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bhojanwale | Premium Dining",
  description: "Editorial multi-restaurant food ordering platform.",
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ]
  },
  manifest: '/site.webmanifest'
};

import { CartProvider } from "@/context/CartContext";
import { CustomerNotificationProvider } from "@/components/customer/CustomerNotificationProvider";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { GlobalErrorHandler } from "@/components/layout/GlobalErrorHandler";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-base text-primary">
        <AuthProvider>
          <CustomerNotificationProvider>
            <CartProvider>
              {children}
              <AuthModal />
              <GlobalErrorHandler />
            </CartProvider>
          </CustomerNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
