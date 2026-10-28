"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Mail,
  Bookmark,
  LogOut,
  ShieldCheck,
  BadgeCheck,
  Film,
  Tv,
  ArrowRight,
  Pencil,
  Check,
  X,
  Copy,
  CalendarDays,
  Cloud,
  HardDrive,
  Trash2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  getGuestWatchlist,
  clearGuestWatchlist,
} from "@/lib/watchlist-client";

interface WishlistStats {
  total: number;
  watched: number;
  movies: number;
  series: number;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load stats from DB (if user signed in) or from localStorage (if guest)
  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoadingStats(true);
      if (user) {
        try {
          const res = await fetch("/api/watchlist");
          if (res.ok) {
            const data = await res.json();
            const items = Array.isArray(data.items) ? data.items : [];
            if (active) {
              setWishlist({
                total: items.length,
                watched: items.filter((i: any) => i.watched).length,
                movies: items.filter((i: any) => i.type === "movie").length,
                series: items.filter((i: any) => i.type === "tv").length,
              });
            }
          }
        } catch (e) {
          console.error("Failed to load DB stats:", e);
        }
      } else {
        // Guest mode stats from localStorage
        const local = getGuestWatchlist();
        if (active) {
          setWishlist({
            total: local.length,
            watched: local.filter((i) => i.watched).length,
            movies: local.filter((i) => i.type === "movie").length,
            series: local.filter((i) => i.type === "tv").length,
          });
        }
      }
      if (active) setLoadingStats(false);
    }

    if (!isPending) {
      loadStats();
    }

    return () => {
      active = false;
    };
  }, [user, isPending]);

  useEffect(() => {
    if (editing) nameInput.current?.select();
  }, [editing]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    setSignOutError("");
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
      setSignOutError("Couldn’t sign you out. Check your connection.");
      setIsLoggingOut(false);
    }
  };

  const startEditing = () => {
    setDraftName(user?.name ?? "");
    setNameError("");
    setEditing(true);
  };

  const saveName = async () => {
    const next = draftName.trim();
    if (!next) {
      setNameError("Enter a name.");
      return;
    }
    if (next === user?.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setNameError("");
    try {
      const res = await authClient.updateUser({ name: next });
      if (res?.error) throw new Error(res.error.message);
      setEditing(false);
    } catch (err) {
      console.error("Update name error:", err);
      setNameError("Couldn’t save your name. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const copyEmail = async () => {
    if (!user?.email) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleClearGuestStorage = () => {
    if (confirm("Clear all items stored locally in your guest watchlist?")) {
      clearGuestWatchlist();
      setWishlist({ total: 0, watched: 0, movies: 0, series: 0 });
    }
  };

  const watchedPct =
    wishlist && wishlist.total
      ? Math.round((wishlist.watched / wishlist.total) * 100)
      : 0;

  /* ------------------------------ Loading ------------------------------ */
  if (isPending) {
    return (
      <div className="min-h-screen bg-black px-4 pb-32 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6" aria-busy="true">
          <div className="h-44 rounded-3xl bg-zinc-900" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-24 rounded-2xl bg-zinc-900" />
            <div className="h-24 rounded-2xl bg-zinc-900" />
            <div className="h-24 rounded-2xl bg-zinc-900" />
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------ GUEST MODE VIEW ---------------------------- */
  if (!user) {
    return (
      <div className="min-h-screen bg-black px-4 pb-32 pt-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Guest Profile Banner */}
          <section
            aria-label="Guest Profile"
            className="relative overflow-hidden rounded-3xl border border-amber-900/40 bg-zinc-950 p-6 md:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
            />

            <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Guest Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <HardDrive size={36} />
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Guest Cinephile
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                    <HardDrive size={11} /> Local Storage Mode
                  </span>
                </div>

                <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                  You are exploring Movizz as a guest. All titles you save, pin, or mark as watched are kept securely in this browser&apos;s local storage.
                </p>

                {/* Cloud Upgrade CTA */}
                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#F5C518] px-4 py-2 text-xs font-bold text-black transition hover:bg-[#e0b414] shadow-lg"
                  >
                    <span>Sign in with Google to Sync</span>
                    <ArrowRight size={13} />
                  </Link>
                  <Link
                    href="/watchlist"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-800 hover:text-white transition"
                  >
                    <Bookmark size={13} />
                    <span>Open Watchlist</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats Grid */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/watchlist"
              className="group relative overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950 p-5 transition hover:border-zinc-700"
            >
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Watchlist Items
                </span>
                <Bookmark size={16} className="text-[#F5C518]" />
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                {wishlist ? wishlist.total : 0}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">Saved in local storage</p>
            </Link>

            <Link
              href="/watchlist"
              className="group relative overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950 p-5 transition hover:border-zinc-700"
            >
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Watched Titles
                </span>
                <Check size={16} className="text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                {wishlist ? wishlist.watched : 0}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">Completed titles</p>
            </Link>

            <div className="relative overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950 p-5">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Completion Rate
                </span>
                <Sparkles size={16} className="text-[#F5C518]" />
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#F5C518]">
                {watchedPct}%
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">Progress overall</p>
            </div>
          </div>

          {/* Guest Settings & Management */}
          <section
            aria-label="Guest Settings"
            className="rounded-3xl border border-zinc-850 bg-zinc-950 p-6"
          >
            <h2 className="text-base font-bold text-white mb-2">Guest Session Control</h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Switching browsers or clearing website data removes local guest entries. To save permanently to our Neon PostgreSQL database via Drizzle ORM, sign in with your Google account anytime.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleClearGuestStorage}
                className="flex items-center gap-1.5 rounded-xl bg-red-950/40 px-3.5 py-2 text-xs font-semibold text-red-300 ring-1 ring-red-900/50 hover:bg-red-900/50 transition cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Clear Local Guest Data</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  /* ------------------------ SIGNED IN VIEW ----------------------------- */
  const displayName = user.name || "Cinema Enthusiast";
  const displayEmail = user.email || "";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "M";

  const memberSince = (user as any).createdAt
    ? new Date((user as any).createdAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "Recently joined";

  return (
    <div className="min-h-screen bg-black px-4 pb-32 pt-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile Card */}
        <section
          aria-label="Profile"
          className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#F5C518]/10 blur-3xl"
          />

          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* User Avatar (Google Image or Initials) */}
            {user.image ? (
              <img
                src={user.image}
                alt={displayName}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-[#F5C518]/50 shadow-xl"
              />
            ) : (
              <div
                aria-hidden
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#F5C518] text-2xl font-extrabold text-black shadow-xl"
              >
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1 text-center sm:text-left">
              {editing ? (
                <div>
                  <label htmlFor="display-name" className="sr-only">
                    Display name
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <input
                      id="display-name"
                      ref={nameInput}
                      value={draftName}
                      maxLength={50}
                      disabled={saving}
                      onChange={(e) => setDraftName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName();
                        if (e.key === "Escape") setEditing(false);
                      }}
                      className="w-full max-w-xs rounded-xl bg-zinc-900 px-3.5 py-2 text-lg font-bold text-white ring-1 ring-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={saveName}
                      title="Save name"
                      aria-label="Save name"
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5C518] text-black transition hover:bg-[#e0b414] ${focusRing} cursor-pointer`}
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setEditing(false)}
                      title="Cancel"
                      aria-label="Cancel editing name"
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 transition hover:text-white ${focusRing} cursor-pointer`}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {nameError && (
                    <p className="mt-1.5 text-xs text-red-400">{nameError}</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="truncate text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {displayName}
                  </h1>
                  <button
                    type="button"
                    onClick={startEditing}
                    title="Edit display name"
                    aria-label="Edit display name"
                    className={`rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-white ${focusRing} cursor-pointer`}
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              )}

              {/* Email & Google OAuth Badge */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400 sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} />
                  <span>{displayEmail}</span>
                </span>
                <button
                  type="button"
                  onClick={copyEmail}
                  title="Copy email address"
                  aria-label="Copy email address"
                  className={`rounded p-1 text-zinc-500 transition hover:text-white ${focusRing} cursor-pointer`}
                >
                  {copied ? (
                    <Check size={12} className="text-[#F5C518]" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-400">
                  <BadgeCheck size={12} /> Google Verified
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F5C518]/30 bg-[#F5C518]/10 px-2.5 py-0.5 font-semibold text-[#F5C518]">
                  <Cloud size={11} /> Neon DB · Drizzle
                </span>
              </div>

              {/* Member Since */}
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-zinc-500 sm:justify-start">
                <CalendarDays size={13} />
                <span>Member since {memberSince}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/watchlist"
            className="group relative overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950 p-5 transition hover:border-zinc-700"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Cloud Watchlist
              </span>
              <Bookmark size={16} className="text-[#F5C518]" />
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
              {wishlist ? wishlist.total : 0}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">Titles saved in Neon DB</p>
          </Link>

          <Link
            href="/watchlist"
            className="group relative overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950 p-5 transition hover:border-zinc-700"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Watched
              </span>
              <Check size={16} className="text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
              {wishlist ? wishlist.watched : 0}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">Completed from watchlist</p>
          </Link>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-950 p-5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Progress
              </span>
              <Sparkles size={16} className="text-[#F5C518]" />
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#F5C518]">
              {watchedPct}%
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">Watched percentage</p>
          </div>
        </div>

        {/* Watchlist Progress Card */}
        <section
          aria-label="Watchlist Progress"
          className="rounded-3xl border border-zinc-850 bg-zinc-950 p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold">Your Cloud Watchlist</h2>
              {wishlist && wishlist.total > 0 ? (
                <p className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Film size={12} /> {wishlist.movies}{" "}
                    {wishlist.movies === 1 ? "movie" : "movies"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tv size={12} /> {wishlist.series} series
                  </span>
                </p>
              ) : (
                <p className="mt-1 text-xs text-zinc-400">
                  You haven&apos;t saved any titles yet.
                </p>
              )}
            </div>

            <Link
              href="/watchlist"
              className="inline-flex items-center gap-1.5 self-start rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:text-white"
            >
              <span>Open watchlist</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {wishlist && wishlist.total > 0 && (
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>
                  {wishlist.watched} of {wishlist.total} watched
                </span>
                <span className="font-semibold text-[#F5C518]">
                  {watchedPct}%
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-zinc-900"
                role="progressbar"
                aria-valuenow={watchedPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Watchlist watched progress"
              >
                <div
                  className="h-full rounded-full bg-[#F5C518] transition-[width] duration-500"
                  style={{ width: `${watchedPct}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Database & Security Info */}
        <section
          aria-label="Database and Security"
          className="rounded-3xl border border-zinc-850 bg-zinc-950 p-6"
        >
          <h2 className="text-base font-bold text-white mb-2">
            Storage & Security
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 text-xs text-zinc-400">
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2 text-white font-semibold mb-1">
                <Cloud size={15} className="text-[#F5C518]" />
                <span>Drizzle ORM + Neon Database</span>
              </div>
              <p className="leading-relaxed">
                Your account and watchlist data are synced with your cloud Neon PostgreSQL serverless database.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2 text-white font-semibold mb-1">
                <ShieldCheck size={15} className="text-emerald-400" />
                <span>Passwordless Google Authentication</span>
              </div>
              <p className="leading-relaxed">
                Protected by Better Auth with secure Google OAuth2 tokens. No passwords are stored or required.
              </p>
            </div>
          </div>
        </section>

        {/* Sign Out Section */}
        <section
          aria-label="Sign Out"
          className="rounded-3xl border border-zinc-850 bg-zinc-950 p-6"
        >
          {confirmingSignOut ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-white">
                  Are you sure you want to sign out?
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  You can still use Movizz in guest mode anytime.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleSignOut}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-500 cursor-pointer"
                >
                  {isLoggingOut ? "Signing out..." : "Yes, sign out"}
                </button>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => setConfirmingSignOut(false)}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-800 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Sign Out</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Sign out of your Google account on this browser.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmingSignOut(true)}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-red-900 hover:bg-red-950/40 hover:text-red-300 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {signOutError && (
            <p className="mt-3 text-xs text-red-400">{signOutError}</p>
          )}
        </section>
      </div>
    </div>
  );
}
