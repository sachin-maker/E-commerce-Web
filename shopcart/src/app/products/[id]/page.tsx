import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetailsClient from "@/app/components/product-details/ProductDetailsClient";

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Product ${id} | ShopCart`,
    description:
      "View product details, pricing, availability and reviews on ShopCart.",
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;

  if (!id || id.trim().length === 0) {
    notFound();
  }

  return <ProductDetailsClient productId={id} />;
}