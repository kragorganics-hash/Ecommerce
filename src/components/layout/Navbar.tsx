"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, User, Search, Menu, X, ShieldAlert } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/AuthContext";

export function Navbar() {
  const router = useRouter();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#12281e] text-[#f2f7f4] text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center space-x-2">
        <span>Sample Store Preview: Free Delivery across Nepal over Rs. 3,500</span>
        <span className="hidden md:inline text-[#dcb36d]">|</span>
        <span className="hidden md:inline text-[#fbf3e5]">Use code <strong className="text-[#dcb36d]">KRAG10</strong> for 10% off</span>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-[#e6dfd3] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#141716] hover:text-[#1b3b2c] focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white p-1 border border-[#e6dfd3] shadow-xs group-hover:scale-105 group-hover:shadow-md transition-all duration-300 flex items-center justify-center">
                  <Image
                    src="/images/krag-logo.jpeg"
                    alt="KRAG Logo"
                    width={44}
                    height={44}
                    priority
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-2xl font-bold tracking-tight text-[#141716] leading-none group-hover:text-[#1b3b2c] transition-colors">
                    KRAG
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#8c571e] font-bold mt-0.5">
                    ORGANIC &bull; NEPAL
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-[#1e2321]">
              <Link href="/products" className="hover:text-[#1b3b2c] transition-colors">
                All Supplements
              </Link>
              <Link href="/products?category=protein-powder" className="hover:text-[#1b3b2c] transition-colors">
                Protein
              </Link>
              <Link href="/products?category=creatine" className="hover:text-[#1b3b2c] transition-colors">
                Creatine
              </Link>
              <Link href="/products?category=pre-workout" className="hover:text-[#1b3b2c] transition-colors">
                Pre-Workout
              </Link>
              <Link href="/products?category=recovery" className="hover:text-[#1b3b2c] transition-colors">
                Recovery
              </Link>
              <Link href="/products?category=wellness" className="hover:text-[#1b3b2c] transition-colors">
                Wellness
              </Link>
              <Link href="/#our-standards" className="hover:text-[#1b3b2c] transition-colors text-[#5c6b64]">
                Our Standards
              </Link>
            </nav>

            {/* Right Action Icons: Search, Account, Cart */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#2b322f] hover:text-[#1b3b2c] hover:bg-[#f3eee3] rounded-full transition-colors"
                aria-label="Search Catalog"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="p-2 text-[#2b322f] hover:text-[#1b3b2c] hover:bg-[#f3eee3] rounded-full transition-colors flex items-center space-x-1"
                  aria-label="Account Settings"
                >
                  <User className="w-5 h-5" />
                  {user && (
                    <span className="hidden md:inline-block text-xs font-medium max-w-[80px] truncate text-[#1b3b2c]">
                      {user.name.split(" ")[0]}
                    </span>
                  )}
                </button>

                {accountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e6dfd3] rounded-xl shadow-lg py-2 z-50 text-sm">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-[#f3eee3]">
                          <p className="font-semibold text-[#141716] truncate">{user.name}</p>
                          <p className="text-xs text-[#5c6b64] truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-[#e8f0eb] text-[#1b3b2c] rounded-full">
                            {user.role}
                          </span>
                        </div>

                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2.5 text-[#1b3b2c] hover:bg-[#f2f7f4] font-medium"
                          >
                            <ShieldAlert className="w-4 h-4 text-[#1b3b2c]" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        <Link
                          href="/account/orders"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="block px-4 py-2 text-[#1e2321] hover:bg-[#f8f6f0]"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/account/profile"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="block px-4 py-2 text-[#1e2321] hover:bg-[#f8f6f0]"
                        >
                          Profile & Addresses
                        </Link>
                        <div className="border-t border-[#f3eee3] my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-rose-700 hover:bg-rose-50 font-medium"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 text-xs text-[#5c6b64] border-b border-[#f3eee3]">
                          Welcome to Krag Organic
                        </div>
                        <Link
                          href="/login"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="block px-4 py-2.5 text-[#141716] font-medium hover:bg-[#f8f6f0]"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="block px-4 py-2 text-[#1b3b2c] hover:bg-[#f8f6f0]"
                        >
                          Create Free Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Drawer Button */}
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2.5 bg-[#1b3b2c] text-[#fbf9f5] hover:bg-[#25513d] rounded-full transition-all shadow-sm"
                aria-label="Open Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#b87328] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-[#e6dfd3] bg-[#f8f5ee] px-4 py-3 sm:px-6">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85958d]" />
                <input
                  type="text"
                  placeholder="Search organic whey, micronized creatine, pre-workout, Shilajit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b3b2c]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1b3b2c] text-white text-sm font-medium rounded-lg hover:bg-[#25513d]"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-[#5c6b64] hover:text-[#141716]"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#e6dfd3] bg-[#fbf9f5] px-4 pt-3 pb-6 space-y-2">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#141716] hover:bg-[#f3eee3] rounded-lg"
            >
              All Supplements
            </Link>
            <Link
              href="/products?category=protein-powder"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#1e2321] hover:bg-[#f3eee3] rounded-lg"
            >
              Protein Powders
            </Link>
            <Link
              href="/products?category=creatine"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#1e2321] hover:bg-[#f3eee3] rounded-lg"
            >
              Creatine & Strength
            </Link>
            <Link
              href="/products?category=pre-workout"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#1e2321] hover:bg-[#f3eee3] rounded-lg"
            >
              Pre-Workout & Focus
            </Link>
            <Link
              href="/products?category=recovery"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#1e2321] hover:bg-[#f3eee3] rounded-lg"
            >
              Recovery & Hydration
            </Link>
            <Link
              href="/products?category=wellness"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#1e2321] hover:bg-[#f3eee3] rounded-lg"
            >
              Daily Wellness & Shilajit
            </Link>
            <Link
              href="/#our-standards"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-[#5c6b64] hover:bg-[#f3eee3] rounded-lg"
            >
              Our Quality Standards
            </Link>

            <div className="border-t border-[#e6dfd3] pt-4 mt-2">
              {user ? (
                <div className="space-y-2">
                  <div className="text-xs text-[#5c6b64] px-3">Signed in as {user.name}</div>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-[#1b3b2c] font-semibold bg-[#e8f0eb] rounded-lg"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-[#141716] hover:bg-[#f3eee3] rounded-lg"
                  >
                    My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-semibold text-[#1b3b2c] border border-[#1b3b2c] rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-semibold text-white bg-[#1b3b2c] rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
