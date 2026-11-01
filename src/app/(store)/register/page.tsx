"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { Lock, Mail, User, Phone, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(urlError || "");
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Google OAuth Sign-Up
  const handleGoogleSignUp = async () => {
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
      setErrorMessage("Could not connect to Google sign-up. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // Email Sign-Up with Verification Send
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    // 1. If Supabase is configured, use Supabase Auth with email verification
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const origin = window.location.origin;

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              phone: phone.trim() || null,
            },
            emailRedirectTo: `${origin}/auth/callback`,
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        // If email confirmation is enabled (standard in Supabase)
        if (data.user && !data.session) {
          setVerificationSent(true);
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
          return;
        }

        // If auto-confirmed on Supabase project (session exists immediately)
        if (data.session) {
          const syncRes = await fetch("/api/auth/supabase-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: normalizedEmail,
              name: name.trim(),
              phone: phone.trim() || null,
            }),
          });

          const syncData = await syncRes.json();
          if (syncData.success) {
            login("", syncData.user);
            router.push("/account/orders");
            return;
          }
        }
      } catch {
        setErrorMessage("An unexpected error occurred during signup. Please try again.");
        setIsLoading(false);
        return;
      }
    }

    // 2. Direct fallback registration if Supabase is not configured
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: normalizedEmail, phone, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to create account. Please check your details.");
        setIsLoading(false);
        return;
      }

      login("", data.user);
      router.push("/account/orders");
    } catch {
      setErrorMessage("Network error occurred during registration. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isSupabaseConfigured() || resendCooldown > 0) return;
    setIsLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setResendCooldown(60);
      }
    } catch {
      setErrorMessage("Failed to resend verification email.");
    } finally {
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
          <h1 className="font-serif text-2xl font-bold text-[#141716]">Create Your Account</h1>
          <p className="text-xs text-[#5c6b64] mt-1">
            Join the Krag Organic athletic and wellness community.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {verificationSent ? (
          /* Verification Email Sent Confirmation */
          <div className="p-5 bg-[#f3f8f5] border border-[#c3dfce] rounded-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#1b3b2c] text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-base text-[#141716]">
                Verification Email Sent
              </h3>
              <p className="text-xs text-[#5c6b64] mt-1.5 leading-relaxed">
                We sent a confirmation link to <strong className="text-[#1b3b2c]">{email}</strong>.
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
                className="w-full sm:w-auto px-4 py-2 bg-[#1b3b2c] hover:bg-[#25513d] text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Verification Email"}
              </button>
              <Link
                href="/login"
                className="w-full sm:w-auto px-4 py-2 bg-white border border-[#d8d0c2] text-[#5c6b64] hover:text-[#141716] text-xs font-semibold rounded-md text-center transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Google Sign-Up Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#fbf9f5] text-[#141716] font-semibold text-xs border border-[#d8d0c2] rounded-lg transition-colors flex items-center justify-center space-x-2.5 shadow-2xs disabled:opacity-60 cursor-pointer"
            >
              {isGoogleLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-[#1b3b2c] border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-4 h-4" />
              )}
              <span>{isGoogleLoading ? "Connecting to Google..." : "Sign up with Google"}</span>
            </button>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e6dfd3]" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-medium text-[#85958d] uppercase tracking-wider">
                or register with email
              </span>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#141716] mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85958d]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Siddhartha Thapa"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                  />
                </div>
              </div>

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
                <p className="text-[11px] text-[#85958d] mt-1">
                  A verification confirmation email will be sent to this address.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#141716] mb-1">
                  Mobile Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85958d]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+977 9841234567"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#fbf9f5] border border-[#e6dfd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1b3b2c]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#141716] mb-1">
                  Password (Min. 6 Characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85958d]" />
                  <input
                    type="password"
                    required
                    minLength={6}
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
                {isLoading ? <span>Creating Account...</span> : <span>Create Account</span>}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center text-xs text-[#5c6b64] pt-4 border-t border-[#f3eee3]">
          Already registered?{" "}
          <Link href="/login" className="text-[#1b3b2c] font-semibold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#1b3b2c] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#5c6b64] mt-3">Loading registration...</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
