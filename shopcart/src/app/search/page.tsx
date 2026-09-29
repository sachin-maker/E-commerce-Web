import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | ShopCart",
  description: "Search products on ShopCart.",
  robots: {
    index: false,
    follow: true,
  },
};

function SearchPageFallback() {
  return (
    <main className="search-page">
      <div className="search-page-container">
        <div className="search-status" role="status">
          Loading search...
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageClient />
    </Suspense>
  );
}
