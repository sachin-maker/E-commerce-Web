
import type { Metadata } from "next";

import HeroSection from "@/app/components/home/HeroSection";
import CategoriesSection from "@/app/components/home/CategoriesSection";
import FeaturedProducts from "@/app/components/home/FeaturedProducts";
import PromotionalBanners from "@/app/components/home/PromotionalBanners";
import BenefitsSection from "@/app/components/home/BenefitsSection";
import Footer from "@/app/components/layout/Footer";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://shopcart.com";

export const metadata: Metadata = {
  title: "ShopCart | Your Online Shopping Store",
  description:
    "Shop the latest products at ShopCart. Discover quality products, great prices, and a seamless online shopping experience.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "ShopCart",
    title:
      "ShopCart | Your Online Shopping Store",
    description:
      "Shop the latest products at ShopCart. Discover quality products, great prices, and a seamless online shopping experience.",
  },

  twitter: {
    card: "summary",
    title:
      "ShopCart | Your Online Shopping Store",
    description:
      "Shop the latest products at ShopCart. Discover quality products, great prices, and a seamless online shopping experience.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ShopCart",
    url: siteUrl,
    description:
      "Shop the latest products at ShopCart.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?search={search_term_string}`,
      },
      "query-input":
        "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ShopCart",
    url: siteUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            websiteJsonLd
          ).replace(/</g, "\\u003c"),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            organizationJsonLd
          ).replace(/</g, "\\u003c"),
        }}
      />

      <main className="homepage">
        <HeroSection />

        <CategoriesSection />

        <FeaturedProducts />

        <PromotionalBanners />

        <BenefitsSection />
      </main>

      <Footer />
    </>
  );
}


