
import type { Metadata } from "next";

import "./globals.css";
import Providers from "./components/layout/Providers";
import Header from "./components/layout/Header";
import ScrollToTop from "./components/ScrollToTop";



export const metadata: Metadata = {
  title: "ShopCart | Your Online Shopping Store",
  description:
    "Shop the latest products at ShopCart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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