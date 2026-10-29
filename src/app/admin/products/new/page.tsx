"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft, AlertCircle, Check } from "lucide-react";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface VariantForm {
  name: string;
  flavor: string;
  weight: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [suggestedUsage, setSuggestedUsage] = useState("");
  const [allergens, setAllergens] = useState("");
  const [packageSize, setPackageSize] = useState("");
  const [basePrice, setBasePrice] = useState<number>(3500);
  const [compareAtPrice, setCompareAtPrice] = useState<number | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Images
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1000&q=80",
  ]);

  // Variants
  const [variants, setVariants] = useState<VariantForm[]>([
    {
      name: "Natural / 1kg",
      flavor: "Natural",
      weight: "1kg",
      sku: "PROD-NAT-1KG",
      price: 3500,
      compareAtPrice: 4000,
      stock: 50,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products?.length > 0) {
          // Extract unique categories
          const catsMap = new Map();
          data.products.forEach((p: { category: Category }) => {
            if (p.category) catsMap.set(p.category.id, p.category);
          });
          const catsList = Array.from(catsMap.values());
          setCategories(catsList);
          if (catsList.length > 0) setCategoryId(catsList[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(slugify(val));
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        name: `Option ${variants.length + 1}`,
        flavor: "",
        weight: "",
        sku: `SKU-${Date.now().toString().slice(-4)}`,
        price: basePrice,
        compareAtPrice: compareAtPrice || null,
        stock: 25,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setErrorMessage("At least one product image is required.");
      return;
    }
    if (variants.length === 0) {
      setErrorMessage("At least one product variant/SKU is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

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
          name: v.name,
          flavor: v.flavor || undefined,
          weight: v.weight || undefined,
          sku: v.sku,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          stock: Number(v.stock),
        })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to create product.");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/products");
    } catch {
      setErrorMessage("Error submitting product. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-[#e6dfd3]">
        <Link
          href="/admin/products"
          className="p-2 bg-white border border-[#e6dfd3] rounded-lg hover:bg-[#fbf9f5] text-[#5c6b64]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#141716]">
            Create New Product Formulation
          </h1>
          <p className="text-xs text-[#5c6b64]">
            Add a new supplement to the Krag Organic public store.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Basic Details */}
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
                onChange={handleNameChange}
                placeholder="e.g. Krag Grass-Fed Whey Isolate"
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
                placeholder="krag-grass-fed-whey-isolate"
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
                placeholder="e.g. 1kg (30 Servings) / 2kg (60 Servings)"
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#141716] mb-1">Subtitle / Key Tagline</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Cold-processed microfiltered whey with 27g protein per scoop"
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
                placeholder="Describe source purity, extraction process, and athletic benefits..."
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
              <label className="block font-semibold text-[#141716] mb-1">Compare-At Price (Optional Strikeout)</label>
              <input
                type="number"
                value={compareAtPrice ?? ""}
                onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 4000"
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>
          </div>
        </div>

        {/* Nutritional & Allergen Information */}
        <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-[#141716] border-b border-[#f3eee3] pb-2">
            2. Ingredients & Usage Directions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#141716] mb-1">Full Ingredients List</label>
              <textarea
                rows={2}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="e.g. Grass-Fed Whey Protein Isolate, Organic Vanilla Bean, Sunflower Lecithin, Stevia."
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Suggested Usage Directions</label>
              <textarea
                rows={2}
                value={suggestedUsage}
                onChange={(e) => setSuggestedUsage(e.target.value)}
                placeholder="Mix 1 scoop with 250ml water 30 mins post-workout."
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#141716] mb-1">Allergens & Verification Notice</label>
              <textarea
                rows={2}
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
                placeholder="Contains Milk. Mark placeholder nutritional information for verification before commercial launch."
                className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-[#141716] border-b border-[#f3eee3] pb-2">
            3. Product Imagery (URLs)
          </h2>

          <div className="flex space-x-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
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

        {/* Variants & SKUs */}
        <div className="bg-white border border-[#e6dfd3] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f3eee3] pb-2">
            <h2 className="font-serif text-base font-bold text-[#141716]">
              4. Variants, Flavors, & Inventory
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
                    placeholder="e.g. Bourbon Vanilla / 1kg"
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
                    placeholder="WHEY-VAN-1"
                    className="w-full px-2.5 py-1.5 bg-white border border-[#e6dfd3] rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#141716] mb-1">Price (NPR)</label>
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
                  <label className="block text-[11px] font-semibold text-[#141716] mb-1">Stock</label>
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
                    onClick={() => handleRemoveVariant(idx)}
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

        {/* Submit Actions */}
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
            {isSubmitting ? "Saving Product..." : "Publish Product Formulation"}
          </button>
        </div>
      </form>
    </div>
  );
}
