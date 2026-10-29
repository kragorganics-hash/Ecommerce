import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Krag Organic database seeding...");

  // 1. Clean existing records for a fresh idempotent seed
  await prisma.discountRedemption.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.newsletterSubscription.deleteMany();
  await prisma.storeSetting.deleteMany();

  // 2. Seed Default Store Settings
  const settings = [
    { key: "store_name", value: "Krag Organic", description: "Official storefront name" },
    { key: "store_logo", value: "/images/krag-logo.jpeg", description: "Official brand logo" },
    { key: "store_tagline", value: "Pure botanical sports nutrition & clean supplements", description: "Store slogan" },
    { key: "store_email", value: "care@kragorganic.com", description: "Customer care email" },
    { key: "store_phone", value: "+977-1-4567890", description: "Support phone number" },
    { key: "store_address", value: "Kathmandu Valley, Bagmati Province, Nepal", description: "Physical head office" },
    { key: "free_shipping_threshold", value: "3500", description: "Minimum order amount for free domestic delivery (NPR)" },
    { key: "standard_shipping_fee", value: "150", description: "Standard flat delivery rate across Nepal (NPR)" },
    { key: "express_shipping_fee", value: "300", description: "Express same/next day delivery fee in major cities (NPR)" },
    { key: "tax_rate_percent", value: "0", description: "VAT/Sales tax percentage included in prices" },
    { key: "announcement_bar", value: "Sample Store Preview: Free Delivery across Nepal on orders over Rs. 3,500 | Code: KRAG10 for 10% off", description: "Top header marquee message" },
  ];

  for (const s of settings) {
    await prisma.storeSetting.create({ data: s });
  }

  // 3. Seed Users (Admin & Sample Customer)
  const adminPasswordHash = await bcrypt.hash("KragAdmin2026!", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@kragorganic.com",
      name: "Krag Organic Admin",
      phone: "+977 9801234567",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const customerPasswordHash = await bcrypt.hash("Customer2026!", 10);
  const sampleCustomer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      name: "Siddhartha Thapa",
      phone: "+977 9841234567",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
    },
  });

  // Seed sample address for customer
  await prisma.address.create({
    data: {
      userId: sampleCustomer.id,
      fullName: "Siddhartha Thapa",
      addressLine1: "House 42, Shanti Marga",
      addressLine2: "Baluwatar",
      city: "Kathmandu",
      state: "Bagmati Province",
      postalCode: "44600",
      country: "Nepal",
      phone: "+977 9841234567",
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
  });

  // 4. Seed Categories
  const categoriesData = [
    {
      name: "Protein Powder",
      slug: "protein-powder",
      description: "Grass-fed whey isolates and premium organic plant proteins formulated for clean lean muscle recovery.",
      image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=800&q=80",
      displayOrder: 1,
    },
    {
      name: "Creatine & Strength",
      slug: "creatine",
      description: "Ultra-pure micronized creatine monohydrate and strength enhancers for power output and muscular endurance.",
      image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80",
      displayOrder: 2,
    },
    {
      name: "Pre-Workout & Energy",
      slug: "pre-workout",
      description: "Naturally caffeinated focus amplifiers, nitric oxide pumps, and clean energy with zero jitters or artificial dyes.",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
      displayOrder: 3,
    },
    {
      name: "Recovery & Hydration",
      slug: "recovery",
      description: "Clean electrolyte mineral complexes and essential amino acids to accelerate tissue repair and combat fatigue.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      displayOrder: 4,
    },
    {
      name: "Daily Wellness & Adaptogens",
      slug: "wellness",
      description: "Himalayan botanicals, organic Ashwagandha, and restorative vitality tonics for daily hormonal and immune balance.",
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
      displayOrder: 5,
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap.set(cat.slug, created.id);
  }

  // 5. Seed Authentic Krag Organic Flagship Products & Catalog
  const productsData = [
    // AUTHENTIC KRAG ORGANIC FLAGSHIP PRODUCTS
    {
      name: "PROKAM Chocolate Drink Pre-Mix & Protein",
      slug: "prokam-chocolate-drink-pre-mix",
      subtitle: "Nourishing Everyday, The Natural Way • Rich Chocolate Flavour",
      categoryId: categoryMap.get("protein-powder")!,
      description:
        "Nourishing everyday the natural way. PROKAM is an all-natural chocolate drink pre-mix and protein formulation packed with superior nutrition, sustained energy boost, and holistic wellness support. Crafted with rich chocolate flavour, wholesome macro-nutrients, and falcon vitality formula with zero synthetic dyes or preservatives.",
      ingredients: "Wholesome Protein Blend, Premium Cocoa Solids, Whole Grain Flours, Falcon Nutrition Complex, Natural Minerals and Vitamins.",
      suggestedUsage: "Mix 2 scoops (30g) in 200–250ml of warm or cold milk or water. Stir briskly or shake in a bottle until creamy and smooth. Enjoy once or twice daily.",
      allergens: "Contains Milk and Soy. 100% Natural, Preservative-Free.",
      packageSize: "500g Tub / 1kg Tub",
      basePrice: 1850,
      compareAtPrice: 2200,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      images: [
        "/images/prokam.jpeg",
        "/images/prokam-detail.jpeg",
      ],
      variants: [
        { name: "Rich Chocolate / 500g Tub", flavor: "Rich Chocolate", weight: "500g", sku: "PROKAM-CHOC-500G", price: 1850, compareAtPrice: 2200, stock: 85 },
        { name: "Rich Chocolate / 1kg Tub", flavor: "Rich Chocolate", weight: "1kg", sku: "PROKAM-CHOC-1KG", price: 3400, compareAtPrice: 3950, stock: 60 },
      ],
    },
    {
      name: "KRAG Organic Dal Pre Mix",
      slug: "krag-organic-dal-pre-mix",
      subtitle: "Goodness of Dal in Every Bowl • Natural, Nutritious, Delicious",
      categoryId: categoryMap.get("wellness")!,
      description:
        "Goodness of dal in every bowl. KRAG Organic Dal Pre Mix is packed with high protein, rich in fiber, 100% natural, and made with zero preservatives. Made in Nepal (Parsa 02, Sarlahi) with premium slow-roasted lentils and indigenous spices for an authentic, nutritious, and comforting daily meal.",
      ingredients: "Roasted moong dal powder, Roasted masoor dal powder, Roasted toor dal powder, Cumin powder, Coriander powder, Turmeric powder, Himalayan salt, Red chilli powder.",
      suggestedUsage: "Add 50g of Dal Pre Mix to 250–300ml of water. Mix well and cook for a few minutes until desired consistency is achieved. Simple ingredients, great taste!",
      allergens: "100% Plant-Based, No Preservatives, Gluten-Free.",
      packageSize: "400g Pouch / 800g Family Pack",
      basePrice: 480,
      compareAtPrice: 550,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      images: [
        "/images/dal-pre-mix.jpeg",
      ],
      variants: [
        { name: "Traditional Blend / 400g Pouch", flavor: "Traditional Blend", weight: "400g", sku: "DAL-PREMIX-400G", price: 480, compareAtPrice: 550, stock: 120 },
        { name: "Traditional Blend / 800g Family Pack", flavor: "Traditional Blend", weight: "800g", sku: "DAL-PREMIX-800G", price: 890, compareAtPrice: 1050, stock: 75 },
      ],
    },
    {
      name: "KRAG Organic Milk Tea Premix",
      slug: "krag-organic-milk-tea-premix",
      subtitle: "Classic Masala Tea • Rich Aroma, Smooth Taste",
      categoryId: categoryMap.get("wellness")!,
      description:
        "Good things in every cup. KRAG Milk Tea Premix Classic Masala Tea offers authentic Nepali tea flavour, rich aroma, and smooth taste crafted with pure ingredients. Infused with natural cardamom, ginger, cinnamon, and cloves to give you an invigorating, antioxidant-rich tea ritual in less than 2 minutes.",
      ingredients: "Tea powder, Dairy milk powder, Sugar, Natural Spices (Cinnamon, Cardamom, Ginger, Cloves).",
      suggestedUsage: "Boil 100ml of premix in 160ml of water for 1 minute. Strain it into your favorite cup and enjoy.",
      allergens: "Contains Dairy Milk Powder. 100% Natural Ingredients, No Artificial Flavors.",
      packageSize: "200g (20 Pouches of 10g Each)",
      basePrice: 390,
      compareAtPrice: 450,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: true,
      images: [
        "/images/milk-tea.jpeg",
      ],
      variants: [
        { name: "Classic Masala / 200g (20 Pouches)", flavor: "Classic Masala", weight: "200g", sku: "TEA-MASALA-200G", price: 390, compareAtPrice: 450, stock: 150 },
        { name: "Classic Masala / Twin Pack (40 Pouches)", flavor: "Classic Masala", weight: "400g", sku: "TEA-MASALA-400G", price: 740, compareAtPrice: 850, stock: 95 },
      ],
    },
    // PROTEIN
    {
      name: "Krag Grass-Fed Whey Isolate",
      slug: "krag-grass-fed-whey-isolate",
      subtitle: "Cold-processed microfiltered whey with 27g protein per scoop",
      categoryId: categoryMap.get("protein-powder")!,
      description:
        "Crafted from 100% grass-fed pasture-raised dairy, our Whey Isolate undergoes ceramic microfiltration at low temperatures. It provides 27g of pure protein with virtually zero lactose, fat, or cholesterol. Free from artificial sweeteners, sucralose, or synthetic emulsifiers.",
      ingredients: "Grass-Fed Whey Protein Isolate, Organic Madagascar Vanilla Bean, Sunflower Lecithin, Stevia Leaf Extract.",
      suggestedUsage: "Mix 1 scoop (32g) with 250ml of cold water, organic almond milk, or your favorite smoothie. Consume within 45 minutes post-workout.",
      allergens: "Contains Milk (Dairy). Mark placeholder nutritional information for verification before commercial launch.",
      packageSize: "1kg (31 Servings) / 2kg (62 Servings)",
      basePrice: 5800,
      compareAtPrice: 6500,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      images: [
        "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Bourbon Vanilla / 1kg", flavor: "Bourbon Vanilla", weight: "1kg", sku: "WHEY-VAN-1KG", price: 5800, compareAtPrice: 6500, stock: 45 },
        { name: "Bourbon Vanilla / 2kg", flavor: "Bourbon Vanilla", weight: "2kg", sku: "WHEY-VAN-2KG", price: 10400, compareAtPrice: 11800, stock: 28 },
        { name: "Rich Dark Cocoa / 1kg", flavor: "Rich Dark Cocoa", weight: "1kg", sku: "WHEY-CHOC-1KG", price: 5800, compareAtPrice: 6500, stock: 36 },
        { name: "Rich Dark Cocoa / 2kg", flavor: "Rich Dark Cocoa", weight: "2kg", sku: "WHEY-CHOC-2KG", price: 10400, compareAtPrice: 11800, stock: 19 },
        { name: "Natural Unflavored / 1kg", flavor: "Unflavored", weight: "1kg", sku: "WHEY-RAW-1KG", price: 5500, compareAtPrice: 6200, stock: 15 },
      ],
    },
    {
      name: "Organic Raw Plant Protein",
      slug: "organic-raw-plant-protein",
      subtitle: "Synergistic blend of fermented pea, organic pumpkin seed, and organic brown rice",
      categoryId: categoryMap.get("protein-powder")!,
      description:
        "A complete amino acid profile derived purely from clean, certified organic botanical sources. Sprouted and fermented to ensure effortless digestion without bloating. Naturally smooth texture flavored with authentic organic cacao and Ceylon cinnamon.",
      ingredients: "Organic Sprouted Pea Protein, Organic Sacha Inchi, Organic Pumpkin Seed Protein, Organic Raw Fair-Trade Cacao, Organic Ceylon Cinnamon, Monk Fruit Extract.",
      suggestedUsage: "Blend 1 rounded scoop (35g) into 300ml plant milk or coconut water. Excellent as a meal enhancer in oatmeal or baking.",
      allergens: "Vegan, Gluten-Free, Dairy-Free, Soy-Free. Mark placeholder nutritional information for verification before commercial launch.",
      packageSize: "900g (26 Servings)",
      basePrice: 5200,
      compareAtPrice: 5800,
      isFeatured: true,
      isBestseller: false,
      isNewArrival: true,
      images: [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Dark Cacao & Cinnamon / 900g", flavor: "Dark Cacao & Cinnamon", weight: "900g", sku: "PLANT-CACAO-900", price: 5200, compareAtPrice: 5800, stock: 32 },
        { name: "Spiced Chai / 900g", flavor: "Spiced Chai", weight: "900g", sku: "PLANT-CHAI-900", price: 5200, compareAtPrice: 5800, stock: 24 },
      ],
    },
    {
      name: "Micellar Night-Time Casein",
      slug: "micellar-night-time-casein",
      subtitle: "Slow-release sustained protein release for overnight muscular repair",
      categoryId: categoryMap.get("protein-powder")!,
      description:
        "Formulated specifically for evening consumption, Micellar Casein clots gently in the stomach environment, providing a steady release of amino acids for up to 7 hours while you sleep. Helps prevent nocturnal muscle catabolism.",
      ingredients: "Native Micellar Casein, Organic Dutch Cocoa Powder, Sea Salt, Stevia Extract.",
      suggestedUsage: "Mix 1 scoop with 300ml cold water or milk 30 minutes prior to retiring for the night.",
      allergens: "Contains Milk. Mark placeholder nutritional information for verification before commercial launch.",
      packageSize: "1kg (30 Servings)",
      basePrice: 5600,
      compareAtPrice: 6200,
      isFeatured: false,
      isBestseller: false,
      isNewArrival: false,
      images: [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Malted Chocolate / 1kg", flavor: "Malted Chocolate", weight: "1kg", sku: "CASEIN-MALT-1KG", price: 5600, compareAtPrice: 6200, stock: 18 },
      ],
    },

    // CREATINE & STRENGTH
    {
      name: "Micronized 200 Mesh Creatine Monohydrate",
      slug: "micronized-creatine-monohydrate",
      subtitle: "Ultra-fine pharmaceutical grade mesh for instant solubility",
      categoryId: categoryMap.get("creatine")!,
      description:
        "Pure, single-ingredient Creatine Monohydrate milled to an ultra-fine 200-mesh standard. Dissolves cleanly without grittiness. Boosts ATP cellular energy resynthesis, strength milestones, and lean muscle fullness without stomach discomfort.",
      ingredients: "100% Pure Micronized Creatine Monohydrate (Creapure grade standard). Mark placeholder nutritional information for verification before launch.",
      suggestedUsage: "Take 1 level scoop (5g) daily. Mix into water, juice, or your post-workout shake. No loading phase required.",
      allergens: "Gluten-Free, Dairy-Free, Vegan friendly.",
      packageSize: "300g (60 Servings) / 500g (100 Servings)",
      basePrice: 2800,
      compareAtPrice: 3200,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      images: [
        "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Unflavored / 300g", flavor: "Unflavored", weight: "300g", sku: "CREATINE-300G", price: 2800, compareAtPrice: 3200, stock: 85 },
        { name: "Unflavored / 500g", flavor: "Unflavored", weight: "500g", sku: "CREATINE-500G", price: 4200, compareAtPrice: 4800, stock: 54 },
      ],
    },
    {
      name: "Creatine HCL + Betaine Anhydrous",
      slug: "creatine-hcl-betaine",
      subtitle: "High bioavailability strength matrix with zero water bloat",
      categoryId: categoryMap.get("creatine")!,
      description:
        "Combines micro-dosed Creatine Hydrochloride with Betaine Anhydrous to maximize cellular hydration and intramuscular power output. Ideal for athletes in weight-sensitive sports or those sensitive to monohydrate digestive stress.",
      ingredients: "Creatine Hydrochloride (HCL), Betaine Anhydrous, Natural Lemon Oil, Citric Acid, Stevia.",
      suggestedUsage: "Mix 1 scoop with 200ml water 20 minutes prior to training session.",
      allergens: "None known. Mark placeholder nutritional information for verification before commercial launch.",
      packageSize: "240g (60 Servings)",
      basePrice: 3400,
      compareAtPrice: 3900,
      isFeatured: false,
      isBestseller: false,
      isNewArrival: true,
      images: [
        "https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Meyer Lemon / 240g", flavor: "Meyer Lemon", weight: "240g", sku: "CREAT-HCL-LEM", price: 3400, compareAtPrice: 3900, stock: 22 },
        { name: "Crisp Green Apple / 240g", flavor: "Crisp Green Apple", weight: "240g", sku: "CREAT-HCL-APL", price: 3400, compareAtPrice: 3900, stock: 16 },
      ],
    },

    // PRE-WORKOUT
    {
      name: "Krag Natural Pre-Workout Focus",
      slug: "krag-natural-pre-workout-focus",
      subtitle: "Clean organic green coffee energy with L-Citrulline Malate and L-Tyrosine",
      categoryId: categoryMap.get("pre-workout")!,
      description:
        "Say goodbye to synthetic caffeine jitters, tingling facial flushes, and post-training crashes. Krag Natural Pre-Workout features 150mg of smooth organic green coffee bean caffeine, 6g fermented L-Citrulline for peak blood flow, and organic adaptogenic Rhodiola Rosea.",
      ingredients: "Fermented L-Citrulline Malate (2:1), CarnoSyn Beta-Alanine, Organic Green Coffee Bean Extract, L-Tyrosine, Rhodiola Rosea Root, Natural Passionfruit Flavor, Beet Juice Powder for color.",
      suggestedUsage: "Consume 1 scoop dissolved in 300ml cold water 20-30 minutes before high-intensity workouts.",
      allergens: "High caffeine content (150mg/serving). Not recommended for children or pregnant individuals. Mark placeholder nutritional information for verification before commercial launch.",
      packageSize: "360g (30 Servings)",
      basePrice: 3900,
      compareAtPrice: 4500,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      images: [
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Wild Passionfruit / 360g", flavor: "Wild Passionfruit", weight: "360g", sku: "PRE-PASSION-360", price: 3900, compareAtPrice: 4500, stock: 40 },
        { name: "Himalayan Pink Grapefruit / 360g", flavor: "Pink Grapefruit", weight: "360g", sku: "PRE-GRAPE-360", price: 3900, compareAtPrice: 4500, stock: 35 },
      ],
    },
    {
      name: "Non-Stim Nitric Oxide Pump",
      slug: "non-stim-nitric-oxide-pump",
      subtitle: "Caffeine-free blood flow and vasodilation for late-evening workouts",
      categoryId: categoryMap.get("pre-workout")!,
      description:
        "Formulated specifically for athletes training after hours or cycling off stimulant supplements. Rich in red spinach nitrate extract, fermented citrulline, and pine bark extract for maximum muscle fullness without disrupting your circadian sleep rhythm.",
      ingredients: "Fermented L-Citrulline, Red Spinach Extract (std. 9% nitrates), Pine Bark Extract (std. 95% proanthocyanidins), Taurine, Himalayan Rock Salt.",
      suggestedUsage: "Take 1 scoop with 300ml water 20 minutes prior to training session.",
      allergens: "Caffeine-Free. Mark placeholder nutritional information for verification before launch.",
      packageSize: "300g (30 Servings)",
      basePrice: 3600,
      compareAtPrice: 4100,
      isFeatured: false,
      isBestseller: false,
      isNewArrival: true,
      images: [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Watermelon Mint / 300g", flavor: "Watermelon Mint", weight: "300g", sku: "NO-WATER-300", price: 3600, compareAtPrice: 4100, stock: 25 },
      ],
    },

    // RECOVERY & HYDRATION
    {
      name: "Full Spectrum Fermented BCAA 2:1:1",
      slug: "fermented-bcaa-amino",
      subtitle: "Plant-fermented Leucine, Isoleucine, and Valine with natural coconut electrolytes",
      categoryId: categoryMap.get("recovery")!,
      description:
        "Unlike industry-standard BCAAs synthesized from duck feathers or human hair, Krag BCAAs are 100% plant-fermented from organic corn. Paired with freeze-dried coconut water powder to maintain cellular hydration during grueling training blocks.",
      ingredients: "Fermented Instantized L-Leucine, L-Isoleucine, L-Valine (2:1:1 ratio), Freeze-Dried Organic Coconut Water, Pink Himalayan Salt, Natural Citrus Flavor.",
      suggestedUsage: "Sip 1 scoop mixed into 500ml ice-cold water during training or between meals.",
      allergens: "Contains Coconut. Mark placeholder nutritional information for verification before commercial launch.",
      packageSize: "350g (35 Servings)",
      basePrice: 3200,
      compareAtPrice: 3600,
      isFeatured: true,
      isBestseller: false,
      isNewArrival: false,
      images: [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Yuzu Citrus Splash / 350g", flavor: "Yuzu Citrus", weight: "350g", sku: "BCAA-YUZU-350", price: 3200, compareAtPrice: 3600, stock: 38 },
        { name: "Wild Mountain Berry / 350g", flavor: "Wild Berry", weight: "350g", sku: "BCAA-BERRY-350", price: 3200, compareAtPrice: 3600, stock: 42 },
      ],
    },
    {
      name: "Tart Cherry & Magnesium Recovery Tonic",
      slug: "tart-cherry-magnesium-recovery",
      subtitle: "Montmorency tart cherry concentrate paired with bioavailable Magnesium Bisglycinate",
      categoryId: categoryMap.get("recovery")!,
      description:
        "Designed to curb DOMS (delayed onset muscle soreness) and encourage neuromuscular relaxation. Rich in natural anthocyanins from Montmorency tart cherries and gentle, chelated Magnesium Bisglycinate that absorbs smoothly without laxative effects.",
      ingredients: "Organic Tart Cherry Extract (50:1), Magnesium Bisglycinate Chelate, Zinc Picolinate, L-Theanine, Chamomile Flower Extract.",
      suggestedUsage: "Drink 1 scoop in 200ml warm or cold water within 1 hour of going to sleep on hard training days.",
      allergens: "Vegan, Non-GMO. Mark placeholder nutritional information for verification before launch.",
      packageSize: "210g (30 Servings)",
      basePrice: 3500,
      compareAtPrice: 4000,
      isFeatured: false,
      isBestseller: true,
      isNewArrival: false,
      images: [
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Deep Cherry Berry / 210g", flavor: "Deep Cherry Berry", weight: "210g", sku: "REC-CHERRY-210", price: 3500, compareAtPrice: 4000, stock: 29 },
      ],
    },
    {
      name: "Organic Hydration Electrolyte Packets",
      slug: "organic-hydration-electrolyte-packets",
      subtitle: "Real mineral hydration with potassium, magnesium, sodium, and trace Himalayan minerals",
      categoryId: categoryMap.get("recovery")!,
      description:
        "Formulated according to World Health Organization oral rehydration principles. Replenishes sweat-depleted electrolytes with zero artificial food dyes, dextrose spikes, or chemical preservatives.",
      ingredients: "Pink Himalayan Sea Salt, Potassium Citrate, Magnesium Malate, Coconut Water Powder, Organic Lemon Powder, Stevia Leaf.",
      suggestedUsage: "Pour 1 stick packet into 500-750ml water. Shake vigorously until fully dissolved.",
      allergens: "Contains Coconut. Mark placeholder nutritional information for verification before launch.",
      packageSize: "Box of 20 Travel Stick Packs",
      basePrice: 2200,
      compareAtPrice: 2500,
      isFeatured: false,
      isBestseller: false,
      isNewArrival: true,
      images: [
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Citrus Lime / 20 Packs", flavor: "Citrus Lime", weight: "20 Packs", sku: "ELEC-LIME-20", price: 2200, compareAtPrice: 2500, stock: 60 },
        { name: "Raspberry Splash / 20 Packs", flavor: "Raspberry", weight: "20 Packs", sku: "ELEC-RASP-20", price: 2200, compareAtPrice: 2500, stock: 48 },
      ],
    },

    // DAILY WELLNESS & ADAPTOGENS
    {
      name: "Pure Himalayan Purified Shilajit Resin",
      slug: "pure-himalayan-shilajit-resin",
      subtitle: "High-altitude gold-grade mineral pitch standardized to 65%+ Fulvic Acid",
      categoryId: categoryMap.get("wellness")!,
      description:
        "Hand-harvested from pristine high Himalayan rock faces above 16,000 feet. Purified using traditional low-heat spring water methods. Delivers 84+ ionic trace minerals, natural fulvic acid, and humic compounds to enhance mitochondrial energy production and natural stamina.",
      ingredients: "100% Pure Purified Himalayan Shilajit Mineral Pitch. Mark placeholder nutritional information for verification before launch.",
      suggestedUsage: "Dissolve a pea-sized portion (300-500mg) in warm water, herbal tea, or warm milk once daily on an empty stomach.",
      allergens: "Wild-harvested mineral resin. Pregnant individuals should consult their physician.",
      packageSize: "30g Resin Jar (60-90 Servings)",
      basePrice: 4200,
      compareAtPrice: 4800,
      isFeatured: true,
      isBestseller: true,
      isNewArrival: false,
      images: [
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Standard Resin / 30g", flavor: "Earth / Botanical", weight: "30g", sku: "SHIL-JAR-30G", price: 4200, compareAtPrice: 4800, stock: 50 },
        { name: "Value Pack / 50g", flavor: "Earth / Botanical", weight: "50g", sku: "SHIL-JAR-50G", price: 6500, compareAtPrice: 7500, stock: 25 },
      ],
    },
    {
      name: "Organic KSM-66 Ashwagandha Root Extract",
      slug: "organic-ksm-66-ashwagandha",
      subtitle: "Full-spectrum root extract standardized to 5% withanolides for cortisol balance",
      categoryId: categoryMap.get("wellness")!,
      description:
        "The highest concentration full-spectrum root extract on the market today. Extracted using green chemistry without alcohol or chemical solvents. Supports calm mental resilience, healthy cortisol modulation, and restful nocturnal restoration.",
      ingredients: "Organic Ashwagandha Root Extract (KSM-66), Organic Black Pepper Extract (BioPerine), Vegetable Cellulose Capsule.",
      suggestedUsage: "Take 1-2 capsules daily with a meal, preferably in the evening.",
      allergens: "Vegetarian / Vegan capsules. Mark placeholder nutritional information for verification before commercial launch.",
      packageSize: "60 Veggie Capsules (30-60 Servings)",
      basePrice: 2400,
      compareAtPrice: 2800,
      isFeatured: false,
      isBestseller: false,
      isNewArrival: false,
      images: [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "600mg / 60 Capsules", flavor: "Capsule", weight: "60 Capsules", sku: "ASH-CAP-60", price: 2400, compareAtPrice: 2800, stock: 70 },
      ],
    },
    {
      name: "Himalayan Organic Daily Greens & Superfoods",
      slug: "himalayan-daily-greens-superfood",
      subtitle: "Alkalizing blend of wheatgrass, spirulina, moringa, and digestive enzymes",
      categoryId: categoryMap.get("wellness")!,
      description:
        "A daily micronutrient foundation packed with cold-pressed organic greens, raw spirulina, wild moringa, and DigeZyme broad-spectrum digestive enzymes. Smooth, clean taste naturally flavored with organic peppermint.",
      ingredients: "Organic Barley Grass, Organic Wheatgrass, Spirulina, Chlorella, Moringa Leaf, DigeZyme Enzyme Complex, Peppermint Leaf.",
      suggestedUsage: "Mix 1 scoop with 250ml cold water or freshly pressed citrus juice every morning.",
      allergens: "Gluten-Free, 100% Organic, Vegan. Mark placeholder nutritional information for verification before launch.",
      packageSize: "270g (30 Servings)",
      basePrice: 3800,
      compareAtPrice: 4400,
      isFeatured: true,
      isBestseller: false,
      isNewArrival: true,
      images: [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Crisp Peppermint / 270g", flavor: "Crisp Peppermint", weight: "270g", sku: "GREENS-PEP-270", price: 3800, compareAtPrice: 4400, stock: 34 },
      ],
    },
    {
      name: "Triple Strength Wild Marine Omega-3",
      slug: "triple-strength-wild-marine-omega-3",
      subtitle: "Molecularly distilled wild anchovy oil providing 1200mg EPA + DHA per serving",
      categoryId: categoryMap.get("wellness")!,
      description:
        "Third-party tested for oxidation, heavy metals, and PCBs. Triple-strength molecular distillation concentrated in triglyceride form for maximum bioavailability. Enhanced with organic rosemary and natural lemon oil for zero fishy burps.",
      ingredients: "Purified Wild Deep-Sea Fish Oil (Anchovy, Sardine), Softgel Capsule (Gelatin, Glycerin, Purified Water), Natural Lemon Oil, Mixed Tocopherols.",
      suggestedUsage: "Take 2 softgels daily with a meal containing healthy dietary fats.",
      allergens: "Contains Fish (Anchovy, Sardine). Mark placeholder nutritional information for verification before launch.",
      packageSize: "120 Softgels (60 Servings)",
      basePrice: 3100,
      compareAtPrice: 3600,
      isFeatured: false,
      isBestseller: true,
      isNewArrival: false,
      images: [
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=80",
      ],
      variants: [
        { name: "Natural Lemon / 120 Softgels", flavor: "Natural Lemon", weight: "120 Softgels", sku: "OMEGA-120", price: 3100, compareAtPrice: 3600, stock: 40 },
      ],
    },
  ];

  for (const item of productsData) {
    const { images, variants, ...prodData } = item;

    const createdProduct = await prisma.product.create({
      data: prodData,
    });

    // Create images
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: images[i],
          altText: `${createdProduct.name} - View ${i + 1}`,
          isPrimary: i === 0,
          displayOrder: i,
        },
      });
    }

    // Create variants and initial inventory logs
    for (const v of variants) {
      const createdVariant = await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          name: v.name,
          flavor: v.flavor,
          weight: v.weight,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          stock: v.stock,
        },
      });

      // Log initial stock
      await prisma.inventoryLog.create({
        data: {
          productVariantId: createdVariant.id,
          changeQuantity: v.stock,
          previousStock: 0,
          newStock: v.stock,
          reason: "RESTOCK",
          notes: "Initial inventory setup upon launch",
          createdByAdminId: adminUser.id,
        },
      });
    }

    // Add realistic sample reviews with clear sample status
    await prisma.productReview.create({
      data: {
        productId: createdProduct.id,
        authorName: "Anil Shrestha",
        rating: 5,
        title: "Clean taste and digests easily",
        comment: "Sample Review: No digestive bloating compared to commercial supermarket brands. Noticeable difference during morning sessions.",
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });

    await prisma.productReview.create({
      data: {
        productId: createdProduct.id,
        authorName: "Pooja Gurung",
        rating: 5,
        title: "High quality formulation",
        comment: "Sample Review: Love the natural botanical ingredients and clean packaging. The vanilla flavor is subtle and not sickeningly sweet.",
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });
  }

  // 6. Seed Discounts
  await prisma.discount.create({
    data: {
      code: "KRAG10",
      description: "10% off your entire order",
      discountType: "PERCENTAGE",
      value: 10,
      minimumOrderAmount: 2000,
      isActive: true,
    },
  });

  await prisma.discount.create({
    data: {
      code: "WELCOME500",
      description: "Rs. 500 flat discount for new wellness members",
      discountType: "FIXED_AMOUNT",
      value: 500,
      minimumOrderAmount: 4000,
      isActive: true,
    },
  });

  // 7. Seed Sample Orders for Dashboard Demonstration
  const sampleVariant = await prisma.productVariant.findFirst({
    where: { sku: "WHEY-VAN-1KG" },
  });

  const sampleVariant2 = await prisma.productVariant.findFirst({
    where: { sku: "CREATINE-300G" },
  });

  if (sampleVariant && sampleVariant2) {
    // Delivered order
    const order1 = await prisma.order.create({
      data: {
        orderNumber: "KRAG-2026-8192",
        userId: sampleCustomer.id,
        guestEmail: sampleCustomer.email,
        guestName: sampleCustomer.name,
        guestPhone: sampleCustomer.phone,
        shippingFullName: "Siddhartha Thapa",
        shippingAddress1: "House 42, Shanti Marga",
        shippingAddress2: "Baluwatar",
        shippingCity: "Kathmandu",
        shippingState: "Bagmati Province",
        shippingPostalCode: "44600",
        shippingCountry: "Nepal",
        shippingPhone: "+977 9841234567",
        status: "DELIVERED",
        paymentStatus: "PAID",
        fulfillmentStatus: "FULFILLED",
        subtotal: 8600,
        discountTotal: 860,
        shippingTotal: 0,
        taxTotal: 0,
        total: 7740,
        currency: "NPR",
        paymentMethod: "ESEWA",
        items: {
          create: [
            {
              productId: sampleVariant.productId,
              productVariantId: sampleVariant.id,
              productName: "Krag Grass-Fed Whey Isolate",
              variantName: sampleVariant.name,
              sku: sampleVariant.sku,
              price: 5800,
              quantity: 1,
              subtotal: 5800,
            },
            {
              productId: sampleVariant2.productId,
              productVariantId: sampleVariant2.id,
              productName: "Micronized 200 Mesh Creatine Monohydrate",
              variantName: sampleVariant2.name,
              sku: sampleVariant2.sku,
              price: 2800,
              quantity: 1,
              subtotal: 2800,
            },
          ],
        },
        payments: {
          create: {
            paymentMethod: "ESEWA",
            transactionId: "ESEWA-TXN-9481023",
            amount: 7740,
            status: "SUCCESS",
            providerData: JSON.stringify({ verified: true, method: "ESEWA_EPAY" }),
          },
        },
        shipments: {
          create: {
            carrier: "Sundar Express",
            trackingNumber: "SNDR-KTM-4410",
            status: "DELIVERED",
            deliveredAt: new Date(),
          },
        },
      },
    });

    // Processing order (COD)
    await prisma.order.create({
      data: {
        orderNumber: "KRAG-2026-9204",
        guestEmail: "prashant.karki@gmail.com",
        guestName: "Prashant Karki",
        guestPhone: "+977 9851098765",
        shippingFullName: "Prashant Karki",
        shippingAddress1: "Jawalakhel Chowk, Ward 4",
        shippingCity: "Lalitpur",
        shippingState: "Bagmati Province",
        shippingPostalCode: "44700",
        shippingCountry: "Nepal",
        shippingPhone: "+977 9851098765",
        status: "PROCESSING",
        paymentStatus: "PENDING",
        fulfillmentStatus: "UNFULFILLED",
        subtotal: 5800,
        discountTotal: 0,
        shippingTotal: 150,
        taxTotal: 0,
        total: 5950,
        currency: "NPR",
        paymentMethod: "COD",
        items: {
          create: [
            {
              productId: sampleVariant.productId,
              productVariantId: sampleVariant.id,
              productName: "Krag Grass-Fed Whey Isolate",
              variantName: sampleVariant.name,
              sku: sampleVariant.sku,
              price: 5800,
              quantity: 1,
              subtotal: 5800,
            },
          ],
        },
        payments: {
          create: {
            paymentMethod: "COD",
            transactionId: "COD-PENDING-9204",
            amount: 5950,
            status: "PENDING",
            providerData: JSON.stringify({ notes: "Cash on delivery registered" }),
          },
        },
      },
    });

    console.log(`✅ Sample orders created: ${order1.orderNumber}`);
  }

  // 8. Log initial admin audit log
  await prisma.auditLog.create({
    data: {
      adminId: adminUser.id,
      action: "DATABASE_INITIAL_SEED",
      entityType: "SYSTEM",
      details: JSON.stringify({
        categoriesSeeded: categoriesData.length,
        productsSeeded: productsData.length,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  console.log("🎉 Database seeding completed successfully!");
  console.log("--------------------------------------------------");
  console.log("Admin credentials: admin@kragorganic.com / KragAdmin2026!");
  console.log("Customer credentials: customer@example.com / Customer2026!");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
