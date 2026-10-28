"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Mail,
  Bookmark,
  MessageSquare,
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
  Home,
  CalendarDays,
} from "lucide-react";

// Same key the wishlist page uses, so these numbers are real until the DB is wired up.
// TODO: replace with a server query for the signed-in user (wishlist + reviews counts).
const WISHLIST_STORAGE_KEY = "movizz:wishlist:v2";

interface WishlistStats {
  total: number;
  watched: number;
  movies: number;
  series: number;
}

function readWishlistStats(): WishlistStats | null {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      items?: Array<{ type: string; watched: boolean }>;
    };
    if (!Array.isArray(parsed.items)) return null;
    return {
      total: parsed.items.length,
      watched: parsed.items.filter((i) => i.watched).length,
      movies: parsed.items.filter((i) => i.type === "movie").length,
      series: parsed.items.filter((i) => i.type === "tv").length,
    };
  } catch {
    return null;
  }
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

  useEffect(() => {
    setWishlist(readWishlistStats());
  }, []);

  useEffect(() => {
    if (editing) nameInput.current?.select();
  }, [editing]);

  const displayName = user?.name || "Cinema Enthusiast";
  const displayEmail = user?.email || "";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "M";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : null;

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    setSignOutError("");
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
      setSignOutError(
        "Couldn’t sign you out. Check your connection and try again.",
      );
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
    try {
      await navigator.clipboard.writeText(displayEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
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
        <div
          className="mx-auto max-w-4xl animate-pulse space-y-6"
          aria-busy="true"
        >
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

  /* ------------------------------ Signed out --------------------------- */
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-[#F5C518] ring-1 ring-zinc-800">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Sign in to Movizz
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Your wishlist, watch history and reviews follow you across every
            device once you’re signed in.
          </p>
          <Link
            href="/login"
            className={`mt-6 inline-flex items-center gap-2 rounded-xl bg-[#F5C518] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#e0b414] ${focusRing}`}
          >
            <span>Sign in or register</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------ Signed in ---------------------------- */
  return (
    <div className="min-h-screen bg-black px-4 pb-32 pt-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile */}
        <section
          aria-label="Profile"
          className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#F5C518]/10 blur-3xl"
          />

          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div
              aria-hidden
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#F5C518] text-2xl font-extrabold text-black"
            >
              {initials}
            </div>

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
                      onClick={saveName}
                      disabled={saving}
                      aria-label="Save name"
                      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5C518] text-black transition hover:bg-[#e0b414] disabled:opacity-60 cursor-pointer ${focusRing}`}
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                      aria-label="Cancel editing"
                      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 transition hover:text-white cursor-pointer ${focusRing}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {nameError && (
                    <p role="alert" className="mt-1.5 text-xs text-red-400">
                      {nameError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h1 className="truncate text-2xl font-black tracking-tight">
                    {displayName}
                  </h1>
                  <button
                    type="button"
                    onClick={startEditing}
                    aria-label="Edit display name"
                    title="Edit display name"
                    className={`rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-900 hover:text-white cursor-pointer ${focusRing}`}
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-zinc-400 sm:justify-start">
                <button
                  type="button"
                  onClick={copyEmail}
                  title="Copy email"
                  className={`flex items-center gap-1.5 rounded transition hover:text-white cursor-pointer ${focusRing}`}
                >
                  <Mail size={13} />
                  <span>{displayEmail}</span>
                  {copied ? (
                    <Check size={12} className="text-[#F5C518]" />
                  ) : (
                    <Copy size={12} className="text-zinc-600" />
                  )}
                  <span className="sr-only" aria-live="polite">
                    {copied ? "Email copied" : ""}
                  </span>
                </button>
                {memberSince && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    Member since {memberSince}
                  </span>
                )}
                {user.emailVerified && (
                  <span className="flex items-center gap-1.5 text-[#F5C518]">
                    <BadgeCheck size={13} />
                    Email verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Activity */}
        <section
          aria-label="Your activity"
          className="grid gap-3 sm:grid-cols-3"
        >
          <Link
            href="/wishlist"
            className={`group rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800 transition hover:ring-[#F5C518]/50 ${focusRing}`}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5C518]/10 text-[#F5C518]">
                <Bookmark size={19} className="fill-[#F5C518]" />
              </span>
              <ArrowRight
                size={16}
                className="text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-[#F5C518]"
              />
            </div>
            <p className="mt-3 text-2xl font-bold">
              {wishlist ? wishlist.total : 0}
            </p>
            <p className="text-xs text-zinc-400">Saved to wishlist</p>
          </Link>

          <div className="rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-300">
              <Film size={19} />
            </span>
            <p className="mt-3 text-2xl font-bold">
              {wishlist ? wishlist.watched : 0}
            </p>
            <p className="text-xs text-zinc-400">Watched from wishlist</p>
          </div>

          <div className="rounded-2xl bg-zinc-950 p-4 ring-1 ring-zinc-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-300">
              <MessageSquare size={19} />
            </span>
            {/* TODO: show the signed-in user's real review count */}
            <p className="mt-3 text-2xl font-bold">0</p>
            <p className="text-xs text-zinc-400">Reviews written</p>
          </div>
        </section>

        {/* Wishlist progress */}
        <section
          aria-label="Wishlist"
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold">Your wishlist</h2>
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
                  Nothing saved yet. Bookmark a title to plan what to watch
                  next.
                </p>
              )}
            </div>
            <Link
              href="/wishlist"
              className={`flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F5C518] px-4 py-2.5 text-xs font-bold text-black transition hover:bg-[#e0b414] ${focusRing}`}
            >
              <span>Open wishlist</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {wishlist && wishlist.total > 0 && (
            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-xs text-zinc-400">
                <span>Progress</span>
                <span className="font-semibold text-[#F5C518]">
                  {watchedPct}% watched
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-zinc-900"
                role="progressbar"
                aria-valuenow={watchedPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Wishlist watched progress"
              >
                <div
                  className="h-full rounded-full bg-[#F5C518] transition-[width] duration-500"
                  style={{ width: `${watchedPct}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Account actions */}
        <section
          aria-label="Account actions"
          className="flex flex-col gap-3 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            href="/home"
            className={`flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white ${focusRing}`}
          >
            <Home size={15} />
            <span>Back to home</span>
          </Link>

          {confirmingSignOut ? (
            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Confirm sign out"
            >
              <span className="text-sm text-zinc-300">Sign out of Movizz?</span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className={`flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-red-500 disabled:opacity-60 cursor-pointer ${focusRing}`}
              >
                <LogOut size={13} />
                <span>{isLoggingOut ? "Signing out…" : "Sign out"}</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmingSignOut(false)}
                disabled={isLoggingOut}
                className={`rounded-lg px-3 py-1.5 text-xs text-zinc-400 transition hover:text-white cursor-pointer ${focusRing}`}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingSignOut(true)}
              className={`flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-800 transition hover:bg-red-950/40 hover:text-red-400 hover:ring-red-900/40 cursor-pointer ${focusRing}`}
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          )}
        </section>
        {signOutError && (
          <p role="alert" className="text-center text-xs text-red-400">
            {signOutError}
          </p>
        )}
      </div>
    </div>
  );
}
