import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductView } from "@/features/catalog/ProductView";
import type { Metadata } from "next";


interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const { slug } = await props.params;

  const product = await db.product.findUnique({
    where: { slug },
    select: { name: true, subtitle: true, description: true },
  });

  if (!product) {
    return { title: "Product Not Found | Krag Organic" };
  }

  return {
    title: `${product.name} | Krag Organic`,
    description: product.subtitle || product.description.slice(0, 150),
  };
}

export default async function ProductDetailPage(props: ProductPageProps) {
  const { slug } = await props.params;

  const product = await db.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch 4 related products in the same category or overall
  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: {
      category: true,
      images: true,
      variants: true,
      reviews: true,
    },
  });

  return <ProductView product={product} relatedProducts={relatedProducts} />;
}
