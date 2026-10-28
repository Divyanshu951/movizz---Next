"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MovizzLogo from "@/components/svgs/MovizzLogo";
import { authClient } from "@/lib/auth-client";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Film,
  AlertCircle,
  Bookmark,
  CheckCircle2,
  HardDrive,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/account",
      });

      if (res?.error) {
        setErrorMsg(
          res.error.message ||
            "Failed to initiate Google sign in. Please verify GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in .env"
        );
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setErrorMsg(
        err?.message ||
          "Could not connect to Google OAuth service. If you haven't set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env, you can use Guest Mode below!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    // Navigate straight to home or account in guest mode
    router.push("/home");
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 pb-32 overflow-hidden selection:bg-[#F5C518] selection:text-black">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#F5C518]/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 z-10 transition-transform duration-300 hover:scale-105">
        <Link href="/home" aria-label="Return to Movizz Home">
          <MovizzLogo />
        </Link>
      </div>

      {/* Main Auth Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl z-10">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-[#F5C518]/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-[#F5C518] uppercase mb-3">
            <Sparkles size={12} />
            <span>Cinematic Experience</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
            Welcome to Movizz
          </h1>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Sign in with Google to sync your personal watchlist, ratings, and
            reviews securely across all devices.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-amber-800/50 bg-amber-950/30 p-3.5 text-xs text-amber-200">
            <AlertCircle size={16} className="shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">Authentication Note</p>
              <p className="leading-relaxed opacity-90">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Google One-Click Login */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="group relative w-full flex items-center justify-center gap-3.5 rounded-2xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800/90 px-5 py-3.5 text-sm font-semibold text-white shadow-xl transition-all duration-300 hover:border-zinc-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#F5C518] border-t-transparent" />
            ) : (
              <>
                {/* Official Google 'G' SVG Logo */}
                <svg
                  className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Privacy & Safety Note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-1">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Fast, secure sign-in. No password required.</span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950 px-3 text-zinc-500 font-medium tracking-wider">
              Or Try Without Account
            </span>
          </div>
        </div>

        {/* Guest Mode Card */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[#F5C518]/10 p-2.5 text-[#F5C518]">
              <HardDrive size={18} />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-white">Guest Mode</h2>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Save your watchlist directly in your browser&apos;s local storage.
                Sync to Neon database anytime later with Google.
              </p>
              <button
                type="button"
                onClick={handleGuestContinue}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#F5C518] hover:text-amber-400 transition cursor-pointer"
              >
                <span>Continue as Guest</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 pt-5 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
          <Link
            href="/watchlist"
            className="hover:text-[#F5C518] transition inline-flex items-center gap-1"
          >
            <Bookmark size={12} />
            <span>View Watchlist</span>
          </Link>
          <Link
            href="/account"
            className="hover:text-[#F5C518] transition inline-flex items-center gap-1"
          >
            <span>Account Profile</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
