import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { CartProvider } from "@/features/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Krag Organic | Pure Botanical Sports Nutrition & Clean Supplements",
  description:
    "Grass-fed whey protein isolates, micronized creatine, clean pre-workouts, and pure Himalayan botanicals. Zero synthetic dyes, zero fillers.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans antialiased text-[#141716] bg-[#fbf9f5]">
        <AuthProvider initialUser={user}>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
