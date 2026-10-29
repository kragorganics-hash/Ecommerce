"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Invalid credentials. Please verify and try again.");
        setIsLoading(false);
        return;
      }

      login("", data.user);

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/account/orders");
      }
    } catch {
      setErrorMessage("Network error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#e6dfd3] rounded-2xl p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#e8f0eb] text-[#1b3b2c] flex items-center justify-center font-bold text-base mx-auto mb-3">
            KO
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#141716]">Welcome Back</h1>
          <p className="text-xs text-[#5c6b64] mt-1">
            Sign in to track orders and manage your saved delivery details.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#141716] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85958d]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#141716] mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85958d]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1b3b2c] hover:bg-[#25513d] text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? <span>Signing In...</span> : <span>Sign In</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 p-3 bg-[#f8f5ee] rounded-xl text-[11px] text-[#5c6b64] space-y-1 border border-[#e6dfd3]">
          <p className="font-semibold text-[#141716]">Sample Accounts for Testing:</p>
          <p>Admin: <strong className="text-[#1b3b2c]">admin@kragorganic.com</strong> / <strong className="text-[#1b3b2c]">KragAdmin2026!</strong></p>
          <p>Customer: <strong className="text-[#1b3b2c]">customer@example.com</strong> / <strong className="text-[#1b3b2c]">Customer2026!</strong></p>
        </div>

        <div className="mt-6 text-center text-xs text-[#5c6b64] pt-4 border-t border-[#f3eee3]">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-[#1b3b2c] font-semibold hover:underline">
            Register free
          </Link>
        </div>
      </div>
    </div>
  );
}
