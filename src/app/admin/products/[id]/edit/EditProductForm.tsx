"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus, ArrowLeft, AlertCircle, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Variant {
  id?: string;
  name: string;
  flavor?: string | null;
  weight?: string | null;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
}

interface EditProductFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialProduct: any;
  categories: Category[];
}

export function EditProductForm({ initialProduct, categories }: EditProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialProduct.name);
  const [slug, setSlug] = useState(initialProduct.slug);
  const [categoryId, setCategoryId] = useState(initialProduct.categoryId);
  const [subtitle, setSubtitle] = useState(initialProduct.subtitle || "");
  const [description, setDescription] = useState(initialProduct.description);
  const [ingredients, setIngredients] = useState(initialProduct.ingredients || "");
  const [suggestedUsage, setSuggestedUsage] = useState(initialProduct.suggestedUsage || "");
  const [allergens, setAllergens] = useState(initialProduct.allergens || "");
  const [packageSize, setPackageSize] = useState(initialProduct.packageSize || "");
  const [basePrice, setBasePrice] = useState(initialProduct.basePrice);
  const [compareAtPrice, setCompareAtPrice] = useState<number | null>(initialProduct.compareAtPrice);
  const [isFeatured, setIsFeatured] = useState(initialProduct.isFeatured);
  const [isBestseller, setIsBestseller] = useState(initialProduct.isBestseller);
  const [isNewArrival, setIsNewArrival] = useState(initialProduct.isNewArrival);
  const [isActive, setIsActive] = useState(initialProduct.isActive);

  // Images
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>(
    initialProduct.images?.map((img: { url: string }) => img.url) || []
  );

  // Variants
  const [variants, setVariants] = useState<Variant[]>(initialProduct.variants || []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        name: "New Option",
        flavor: "",
        weight: "",
        sku: `${initialProduct.slug.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        price: basePrice,
        compareAtPrice: compareAtPrice || null,
        stock: 20,
      },
    ]);
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive/toggle this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${initialProduct.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsActive(false);
        setSuccessMessage("Product archived successfully.");
        router.refresh();
      }
    } catch {
      setErrorMessage("Failed to archive product.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        name,
        slug,
        categoryId,
        subtitle: subtitle || undefined,
        description,
        ingredients: ingredients || undefined,
        suggestedUsage: suggestedUsage || undefined,
        allergens: allergens || undefined,
        packageSize: packageSize || undefined,
        basePrice: Number(basePrice),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        isFeatured,
        isBestseller,
        isNewArrival,
        isActive,
        images,
        variants: variants.map((v) => ({
          id: v.id,
          name: v.name,
          flavor: v.flavor || undefined,
          weight: v.weight || undefined,
          sku: v.sku,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          stock: Number(v.stock),
        })),
      };

      const res = await fetch(`/api/admin/products/${initialProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to update product.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("Product updated successfully!");
      router.refresh();
    } catch {
      setErrorMessage("Error updating product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#e6dfd3]">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products"
            className="p-2 bg-white border border-[#e6dfd3] rounded-lg hover:bg-[#fbf9f5] text-[#5c6b64]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#141716]">
              Edit: {initialProduct.name}
            </h1>
            <p className="text-xs text-[#5c6b64]">
              Update pricing, inventory, flavors, and storefront visibility.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleArchive}
          className="px-4 py-2 border border-rose-300 text-rose-700 bg-rose-50 text-xs font-semibold rounded-lg hover:bg-rose-100"
        >
          Archive Product
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Core Details */}
        <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-[#141716] border-b border-[#f3eee3] pb-2">
            1. Core Formulation Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#141716] mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Package Sizing</label>
              <input
                type="text"
                value={packageSize}
                onChange={(e) => setPackageSize(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#141716] mb-1">Subtitle / Key Tagline</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#141716] mb-1">Detailed Description *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Base Price (NPR) *</label>
              <input
                type="number"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Compare-At Price</label>
              <input
                type="number"
                value={compareAtPrice ?? ""}
                onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f3eee3] pb-2">
            <h2 className="font-serif text-base font-bold text-[#141716]">
              2. Variants & Current Stock
            </h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="flex items-center space-x-1 text-xs text-[#1b3b2c] font-semibold hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-4">
            {variants.map((v, idx) => (
              <div key={idx} className="p-4 bg-[#fbf9f5] border border-[#e6dfd3] rounded-xl grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#141716] mb-1">Variant Name</label>
                  <input
                    type="text"
                    required
                    value={v.name}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].name = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#e6dfd3] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#141716] mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={v.sku}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].sku = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#e6dfd3] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#141716] mb-1">Price</label>
                  <input
                    type="number"
                    required
                    value={v.price}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].price = Number(e.target.value);
                      setVariants(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#e6dfd3] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#141716] mb-1">Stock Level</label>
                  <input
                    type="number"
                    required
                    value={v.stock}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].stock = Number(e.target.value);
                      setVariants(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#e6dfd3] rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (variants.length <= 1) return;
                      setVariants(variants.filter((_, i) => i !== idx));
                    }}
                    disabled={variants.length <= 1}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-[#141716] border-b border-[#f3eee3] pb-2">
            3. Product Imagery
          </h2>

          <div className="flex space-x-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-[#1b3b2c] text-white font-semibold rounded-lg hover:bg-[#25513d]"
            >
              Add URL
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative rounded-xl border border-[#e6dfd3] overflow-hidden bg-gray-50 aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Merchandising Toggles */}
        <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs flex flex-wrap gap-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="text-[#1b3b2c] focus:ring-[#1b3b2c] rounded"
            />
            <span className="font-semibold text-[#141716]">Featured Formulation</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isBestseller}
              onChange={(e) => setIsBestseller(e.target.checked)}
              className="text-[#1b3b2c] focus:ring-[#1b3b2c] rounded"
            />
            <span className="font-semibold text-[#141716]">Bestseller Badge</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="text-[#1b3b2c] focus:ring-[#1b3b2c] rounded"
            />
            <span className="font-semibold text-[#141716]">New Arrival Badge</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="text-[#1b3b2c] focus:ring-[#1b3b2c] rounded"
            />
            <span className="font-semibold text-[#141716]">Active on Storefront</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 bg-white border border-[#e6dfd3] text-[#5c6b64] font-semibold rounded-xl hover:bg-[#fbf9f5]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#1b3b2c] text-white font-bold rounded-xl hover:bg-[#25513d] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Save Product Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
