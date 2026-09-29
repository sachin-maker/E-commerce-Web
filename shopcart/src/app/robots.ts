
import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://shopcart.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/cart/",
          "/checkout/",
          "/orders/",
          "/wishlist/",
          "/login/",
          "/signup/",
          "/search/",
        ],
      },
    ],

    sitemap: `${siteUrl}/sitemap.xml`,
  };
}


