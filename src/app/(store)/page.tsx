import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Leaf, Sparkles, Award, Zap } from "lucide-react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/catalog/ProductCard";


export default async function HomePage() {
  // Fetch data in parallel
  const [categories, featuredProducts, bestsellers, newArrivals] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    db.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 4,
      include: {
        category: true,
        images: true,
        variants: true,
        reviews: true,
      },
    }),
    db.product.findMany({
      where: { isActive: true, isBestseller: true },
      take: 4,
      include: {
        category: true,
        images: true,
        variants: true,
        reviews: true,
      },
    }),
    db.product.findMany({
      where: { isActive: true, isNewArrival: true },
      take: 4,
      include: {
        category: true,
        images: true,
        variants: true,
        reviews: true,
      },
    }),
  ]);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-[#12281e] text-[#fbf9f5] overflow-hidden">
        {/* Subtle decorative grid/texture */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b5d5c5_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1b3b2c] border border-[#2d5c44] text-[#dcb36d] text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pure Himalayan & Grass-Fed Nutrition</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                Pure Botanical Nutrition. <br className="hidden sm:inline" />
                <span className="text-[#dcb36d]">Built for Real Performance.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#dcece3] max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Cold-filtered grass-fed whey isolate, micronized creatine, clean pre-workouts, and wild-harvested Himalayan Shilajit. Free from synthetic food dyes, sucralose, or filler gums.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#dcb36d] text-[#12281e] hover:bg-[#e8c688] font-bold text-sm rounded-lg transition-all shadow-md flex items-center justify-center space-x-2 group"
                >
                  <span>Shop All Supplements</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/products?category=protein-powder"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1b3b2c] hover:bg-[#25513d] text-white border border-[#2d5c44] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center"
                >
                  Explore Clean Proteins
                </Link>
              </div>

              {/* Trust badges row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[#1f4533] text-left">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-[#dcb36d] flex-shrink-0" />
                  <span className="text-xs text-[#b5d5c5]">Third-Party Verified Samples</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Leaf className="w-5 h-5 text-[#dcb36d] flex-shrink-0" />
                  <span className="text-xs text-[#b5d5c5]">Zero Synthetic Dyes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-[#dcb36d] flex-shrink-0" />
                  <span className="text-xs text-[#b5d5c5]">100% Grass-Fed Dairy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-[#dcb36d] flex-shrink-0" />
                  <span className="text-xs text-[#b5d5c5]">Free Domestic Delivery &gt; 3.5k</span>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border border-[#25513d] shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1200&q=80"
                  alt="Krag Organic Clean Supplement Formulations"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12281e]/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#1b3b2c]/90 backdrop-blur-md border border-[#2d5c44]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#dcb36d]">
                    Featured Batch
                  </p>
                  <p className="font-serif text-lg font-bold text-white">
                    Cold-Processed Whey Isolate (Bourbon Vanilla)
                  </p>
                  <p className="text-xs text-[#b5d5c5] mt-1">
                    27g native protein &bull; Zero lactose &bull; Unsweetened by chemicals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
              Curated Categories
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#141716] mt-1">
              Engineered by Purpose
            </h2>
          </div>
          <Link
            href="/products"
            className="mt-3 sm:mt-0 text-sm font-semibold text-[#1b3b2c] hover:text-[#25513d] flex items-center space-x-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative rounded-xl overflow-hidden border border-[#e6dfd3] bg-white hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-4/3 bg-[#f3eee3] overflow-hidden">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 240px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#e8f0eb] text-[#1b3b2c]">
                    <Leaf className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif text-base font-bold leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-[#5c6b64] line-clamp-2">
                  {cat.description}
                </p>
                <div className="mt-3 text-xs font-semibold text-[#1b3b2c] flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
              Handcrafted Batches
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#141716] mt-1">
              Featured Formulations
            </h2>
          </div>
          <Link
            href="/products"
            className="mt-3 sm:mt-0 text-sm font-semibold text-[#1b3b2c] hover:text-[#25513d] flex items-center space-x-1"
          >
            <span>See entire collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Quality Standards Section (#our-standards) */}
      <section id="our-standards" className="bg-[#f3eee3] py-20 border-y border-[#e6dfd3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
              Uncompromising Standards
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#141716] mt-2">
              Why We Refuse Industry Shortcuts
            </h2>
            <p className="text-sm sm:text-base text-[#5c6b64] mt-3">
              Most supermarket fitness supplements rely on high-heat processing, artificial flavorings to mask degraded proteins, and cheap fillers. Krag Organic takes the artisan, clinically respected route.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-7 rounded-xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#e8f0eb] text-[#1b3b2c] flex items-center justify-center font-bold mb-5">
                  01
                </div>
                <h3 className="font-serif text-lg font-bold text-[#141716] mb-2">
                  Cold Ceramic Microfiltration
                </h3>
                <p className="text-xs text-[#5c6b64] leading-relaxed">
                  We process our dairy at non-denaturing temperatures under 10°C, preserving active immunoglobulins, alpha-lactalbumin, and lactoferrin.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f3eee3] text-[11px] font-semibold text-[#1b3b2c]">
                Zero heat damage
              </div>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#faebd7] text-[#8c571e] flex items-center justify-center font-bold mb-5">
                  02
                </div>
                <h3 className="font-serif text-lg font-bold text-[#141716] mb-2">
                  Zero Sucralose & Gums
                </h3>
                <p className="text-xs text-[#5c6b64] leading-relaxed">
                  Zero artificial chemical sweeteners or gut-irritating xanthan/guar gums. Sweetened naturally using Madagascar vanilla, organic cacao, and whole leaf stevia.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f3eee3] text-[11px] font-semibold text-[#8c571e]">
                Clean gut microbiome
              </div>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#e8f0eb] text-[#1b3b2c] flex items-center justify-center font-bold mb-5">
                  03
                </div>
                <h3 className="font-serif text-lg font-bold text-[#141716] mb-2">
                  100% Label Transparency
                </h3>
                <p className="text-xs text-[#5c6b64] leading-relaxed">
                  Every active compound is explicitly labeled with exact milligram dosages. We never hide behind proprietary blends or undisclosed filler compounds.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f3eee3] text-[11px] font-semibold text-[#1b3b2c]">
                Fully disclosed formulas
              </div>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#faebd7] text-[#8c571e] flex items-center justify-center font-bold mb-5">
                  04
                </div>
                <h3 className="font-serif text-lg font-bold text-[#141716] mb-2">
                  High Himalayan Botanicals
                </h3>
                <p className="text-xs text-[#5c6b64] leading-relaxed">
                  Authentic gold-grade Shilajit hand-harvested at 16,000+ feet in the pristine Himalayas, standardized to high natural fulvic and humic acid profiles.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f3eee3] text-[11px] font-semibold text-[#8c571e]">
                Pristine elevation harvesting
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
              Customer Favorites
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#141716] mt-1">
              Top Rated Formulations
            </h2>
          </div>
          <Link
            href="/products"
            className="mt-3 sm:mt-0 text-sm font-semibold text-[#1b3b2c] hover:text-[#25513d] flex items-center space-x-1"
          >
            <span>View all bestsellers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Brand Story & Mission Section */}
      <section id="story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1b3b2c] text-white rounded-2xl overflow-hidden border border-[#25513d] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-5">
              <span className="text-xs uppercase tracking-widest font-bold text-[#dcb36d]">
                The Krag Organic Story
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Born From A Passion For Clean Mountain Athletics
              </h2>
              <p className="text-sm text-[#dcece3] leading-relaxed">
                Founded in the foothills of the Himalayas, Krag Organic started with a simple question: Why must athletes choose between effective sports supplements and clean, unadulterated botanical ingredients?
              </p>
              <p className="text-sm text-[#dcece3] leading-relaxed">
                We set out to formulate supplements with the same exacting standards used by fine herbalists and Olympic coaches. Grass-fed dairy, ultra-fine micronization, organic adaptogens, and uncompromised transparency.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#dcb36d] text-[#12281e] font-bold text-xs rounded-lg hover:bg-[#e8c688] transition-colors"
                >
                  <span>Experience The Difference</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-full">
              <Image
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80"
                alt="Athletic training fueled by pure organic supplements"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials (Clearly marked as Sample Content per guidelines) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
            Community Experiences
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#141716] mt-1">
            Voices from the Field
          </h2>
          <p className="text-xs text-[#5c6b64] mt-2 italic">
            *Customer feedback below represents sample illustrative content for this store preview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex text-[#c98a3b] mb-3">
                {"★".repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-[#2b322f] italic leading-relaxed">
                &ldquo;Switching to Krag Grass-Fed Whey was night and day for my digestion. No bloat after heavy squat sessions, and the bourbon vanilla tastes like genuine vanilla bean rather than artificial chemical powder.&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#f3eee3] flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-[#141716]">Rohan Shrestha</p>
                <p className="text-[10px] text-[#5c6b64]">CrossFit Athlete, Kathmandu</p>
              </div>
              <span className="text-[10px] font-semibold text-[#1b3b2c] bg-[#e8f0eb] px-2 py-0.5 rounded">
                Sample Purchaser
              </span>
            </div>
          </div>

          <div className="bg-white p-7 rounded-xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex text-[#c98a3b] mb-3">
                {"★".repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-[#2b322f] italic leading-relaxed">
                &ldquo;The 200-mesh micronized creatine dissolves completely in water with zero leftover sludge at the bottom of the glass. Noticed significant improvements in high-rep power endurance.&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#f3eee3] flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-[#141716]">Dr. Maya Basnet</p>
                <p className="text-[10px] text-[#5c6b64]">Sports Physiotherapist, Pokhara</p>
              </div>
              <span className="text-[10px] font-semibold text-[#1b3b2c] bg-[#e8f0eb] px-2 py-0.5 rounded">
                Sample Purchaser
              </span>
            </div>
          </div>

          <div className="bg-white p-7 rounded-xl border border-[#e6dfd3] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex text-[#c98a3b] mb-3">
                {"★".repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-[#2b322f] italic leading-relaxed">
                &ldquo;Their Himalayan Shilajit resin is legitimate quality. The earthy mineral aroma, high fulvic profile, and smooth morning stamina boost make it my staple daily morning protocol.&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#f3eee3] flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-[#141716]">Aayush Gautam</p>
                <p className="text-[10px] text-[#5c6b64]">Mountain Trail Runner</p>
              </div>
              <span className="text-[10px] font-semibold text-[#1b3b2c] bg-[#e8f0eb] px-2 py-0.5 rounded">
                Sample Purchaser
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#8c571e]">
              Latest Research & Blends
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#141716] mt-1">
              New Small-Batch Arrivals
            </h2>
          </div>
          <Link
            href="/products"
            className="mt-3 sm:mt-0 text-sm font-semibold text-[#1b3b2c] hover:text-[#25513d] flex items-center space-x-1"
          >
            <span>Explore all new items</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
