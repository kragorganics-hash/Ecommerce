"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, Sparkles, KeyRound } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const { login } = useAuth();

  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(urlError || "");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Google OAuth Login via Supabase
  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    if (!isSupabaseConfigured()) {
      setErrorMessage(
        "Supabase credentials are not fully configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file."
      );
      return;
    }

    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setErrorMessage("Could not connect to Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // Email Magic Link / Verification Send via Supabase
  const handleSendVerificationEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        "Supabase credentials are not configured. Please add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file."
      );
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setOtpSent(true);
      setIsLoading(false);
      setResendCooldown(60);

      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setErrorMessage("Failed to send verification email. Please check your connection.");
      setIsLoading(false);
    }
  };

  // Password Sign-In
  const handlePasswordSubmit = async (e: React.FormEvent) => {
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
            Sign in to track orders and manage your clean nutrition account.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-2.5 px-4 bg-white hover:bg-[#fbf9f5] text-[#141716] font-semibold text-xs border border-[#d8d0c2] rounded-lg transition-colors flex items-center justify-center space-x-2.5 shadow-2xs disabled:opacity-60 cursor-pointer"
        >
          {isGoogleLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-[#1b3b2c] border-t-transparent rounded-full animate-spin" />
          ) : (
            <GoogleIcon className="w-4 h-4" />
          )}
          <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
        </button>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e6dfd3]" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-medium text-[#85958d] uppercase tracking-wider">
            or continue with email
          </span>
        </div>

        {/* Verification Email Sent Card */}
        {otpSent ? (
          <div className="p-5 bg-[#f3f8f5] border border-[#c3dfce] rounded-xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#1b3b2c] text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-sm text-[#141716]">
                Verification Link Sent
              </h3>
              <p className="text-xs text-[#5c6b64] mt-1 leading-relaxed">
                We sent a secure login link to <strong className="text-[#1b3b2c]">{email}</strong>.
                Click the link in your email to sign in instantly.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleSendVerificationEmail}
                disabled={resendCooldown > 0 || isLoading}
                className="w-full sm:w-auto px-3 py-1.5 bg-[#1b3b2c] hover:bg-[#25513d] text-white text-[11px] font-semibold rounded-md transition-colors disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Link"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setEmail("");
                }}
                className="w-full sm:w-auto px-3 py-1.5 bg-white border border-[#d8d0c2] text-[#5c6b64] hover:text-[#141716] text-[11px] font-semibold rounded-md transition-colors"
              >
                Use Different Email
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex bg-[#f4efe6] p-1 rounded-lg mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("otp");
                  setErrorMessage("");
                }}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-1.5 transition-all ${
                  authMode === "otp"
                    ? "bg-white text-[#1b3b2c] shadow-2xs"
                    : "text-[#5c6b64] hover:text-[#141716]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verification Link</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("password");
                  setErrorMessage("");
                }}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-1.5 transition-all ${
                  authMode === "password"
                    ? "bg-white text-[#1b3b2c] shadow-2xs"
                    : "text-[#5c6b64] hover:text-[#141716]"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>
            </div>

            {/* Email Verification Link Form (Passwordless Magic Link) */}
            {authMode === "otp" ? (
              <form onSubmit={handleSendVerificationEmail} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#141716] mb-1">
                    Email Address
                  </label>
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
                  <p className="text-[11px] text-[#85958d] mt-1.5">
                    We will send a one-click verification login link to your inbox.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#1b3b2c] hover:bg-[#25513d] text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Sending Verification Email...</span>
                  ) : (
                    <span>Send Verification Link</span>
                  )}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Password Form */
              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#141716] mb-1">
                    Email Address
                  </label>
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
                  <label className="block font-semibold text-[#141716] mb-1">
                    Password
                  </label>
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
                  className="w-full py-3 bg-[#1b3b2c] hover:bg-[#25513d] text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? <span>Signing In...</span> : <span>Sign In</span>}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Demo credentials hint */}
        <div className="mt-6 p-3 bg-[#f8f5ee] rounded-xl text-[11px] text-[#5c6b64] space-y-1 border border-[#e6dfd3]">
          <p className="font-semibold text-[#141716]">Sample Accounts for Testing (Password):</p>
          <p>
            Admin: <strong className="text-[#1b3b2c]">admin@kragorganic.com</strong> /{" "}
            <strong className="text-[#1b3b2c]">KragAdmin2026!</strong>
          </p>
          <p>
            Customer: <strong className="text-[#1b3b2c]">customer@example.com</strong> /{" "}
            <strong className="text-[#1b3b2c]">Customer2026!</strong>
          </p>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#1b3b2c] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#5c6b64] mt-3">Loading login...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
