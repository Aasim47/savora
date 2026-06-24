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
  metadataBase: new URL('https://bhojanwale.in'),
  title: "Bhojanwale | Discover & Order from Premium Local Restaurants",
  description: "Bhojanwale curates the finest culinary experiences and delivers them straight to your door. Explore top-rated local restaurants, discover new cuisines, and enjoy premium food delivery in your city.",
  keywords: ["food delivery", "order food online", "premium dining", "local restaurants", "Bhojanwale", "biryani delivery", "restaurant delivery"],
  authors: [{ name: "Bhojanwale" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bhojanwale.in",
    siteName: "Bhojanwale",
    title: "Bhojanwale | Premium Food Delivery",
    description: "Curating the finest culinary experiences and delivering them straight to your door. Order from the best restaurants in your city.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=1200&h=630",
        width: 1200,
        height: 630,
        alt: "Bhojanwale Premium Dining",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bhojanwale | Premium Food Delivery",
    description: "Curating the finest culinary experiences and delivering them straight to your door.",
    images: ["https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=1200&h=630"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
      <body className="min-h-full flex flex-col font-sans bg-base text-primary relative">
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
