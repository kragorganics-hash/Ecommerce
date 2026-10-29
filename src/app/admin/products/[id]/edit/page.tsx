import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EditProductForm } from "./EditProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage(props: EditProductPageProps) {
  const { id } = await props.params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { displayOrder: "asc" } },
      },
    }),
    db.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return <EditProductForm initialProduct={product} categories={categories} />;
}
