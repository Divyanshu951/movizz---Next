"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MovizzLogo from "@/components/svgs/MovizzLogo";
import { authClient } from "@/lib/auth-client";
import { Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name,
        });

        if (error) {
          setErrorMsg(error.message || "Failed to create account. Check your Neon DB configuration.");
        } else {
          setSuccessMsg("Account created successfully! Redirecting...");
          setTimeout(() => router.push("/account"), 1000);
        }
      } else {
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message || "Invalid email or password.");
        } else {
          setSuccessMsg("Signed in successfully! Redirecting...");
          setTimeout(() => router.push("/account"), 1000);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(
        err?.message ||
          "Authentication server error. Make sure DATABASE_URL is set in .env with your Neon DB connection string."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 pb-32">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#F5C518]/10 blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8">
        <Link href="/home">
          <MovizzLogo />
        </Link>
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/90 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {/* Toggle Sign In / Sign Up */}
        <div className="flex rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
              !isSignUp
                ? "bg-[#F5C518] text-black shadow-md font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition cursor-pointer ${
              isSignUp
                ? "bg-[#F5C518] text-black shadow-md font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isSignUp ? "Join Movizz Cinema" : "Welcome Back"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isSignUp
              ? "Create your account with Better Auth & Neon DB"
              : "Sign in to access your custom lists & reviews"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-900/50 bg-red-950/30 p-3.5 text-xs text-red-300">
            <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-3.5 text-xs text-emerald-300">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            <p>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#F5C518] py-3 text-sm font-bold text-black transition-all hover:bg-[#e0b414] hover:shadow-[0_0_20px_rgba(245,197,24,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <>
                <span>{isSignUp ? "Create Movizz Account" : "Sign In to Movizz"}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Guest or Direct Account Link */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 text-center">
          <Link
            href="/account"
            className="text-xs text-zinc-400 hover:text-[#F5C518] transition inline-flex items-center gap-1"
          >
            <span>Preview Account Page (Guest Profile)</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
