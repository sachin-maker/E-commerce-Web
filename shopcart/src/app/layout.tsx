
import type { Metadata } from "next";

import "./globals.css";
import Providers from "./components/layout/Providers";
import Header from "./components/Header/Header";
import ScrollToTop from "./components/ScrollToTop";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shopcart.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "ShopCart | Your Online Shopping Store",
    template: "%s | ShopCart",
  },

  description:
    "Shop the latest products at ShopCart. Discover quality products, great prices, and a seamless online shopping experience.",

  applicationName: "ShopCart",

  keywords: [
    "ShopCart",
    "online shopping",
    "ecommerce",
    "online store",
    "buy products online",
  ],

  authors: [
    {
      name: "ShopCart",
    },
  ],

  creator: "ShopCart",
  publisher: "ShopCart",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "ShopCart",
    title: "ShopCart | Your Online Shopping Store",
    description:
      "Shop the latest products at ShopCart. Discover quality products, great prices, and a seamless online shopping experience.",
  },

  twitter: {
    card: "summary_large_image",
    title: "ShopCart | Your Online Shopping Store",
    description:
      "Shop the latest products at ShopCart. Discover quality products, great prices, and a seamless online shopping experience.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body>
        <Providers>
          <ScrollToTop />
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}


