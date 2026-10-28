"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Tv, ExternalLink, Globe } from "lucide-react";
import type {
  TMDBWatchProvider,
  TMDBWatchProviderCountry,
} from "@/types/tmdb";

type Props = {
  title: string;
  providersByCountry?: Record<string, TMDBWatchProviderCountry>;
  onClose: () => void;
};

const REGION_NAMES: Record<string, string> = {
  IN: "India (IN)",
  US: "United States (US)",
  GB: "United Kingdom (GB)",
  CA: "Canada (CA)",
  AU: "Australia (AU)",
  DE: "Germany (DE)",
  FR: "France (FR)",
  JP: "Japan (JP)",
  BR: "Brazil (BR)",
  ES: "Spain (ES)",
  IT: "Italy (IT)",
  KR: "South Korea (KR)",
};

function ProviderGroup({
  label,
  items,
}: {
  label: string;
  items?: TMDBWatchProvider[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </h3>
      <div className="flex flex-wrap gap-3">
        {items.map((provider) => (
          <div
            key={provider.provider_id}
            className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2"
          >
            {provider.logo_path && (
              <img
                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                alt={provider.provider_name}
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10"
              />
            )}
            <span className="text-xs font-semibold text-zinc-100">
              {provider.provider_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WatchProvidersModal({
  title,
  providersByCountry = {},
  onClose,
}: Props) {
  const availableCountries = useMemo(
    () => Object.keys(providersByCountry).sort(),
    [providersByCountry],
  );

  const defaultCountry = useMemo(() => {
    if (providersByCountry["IN"]) return "IN";
    if (providersByCountry["US"]) return "US";
    if (providersByCountry["GB"]) return "GB";
    return availableCountries[0] || "US";
  }, [providersByCountry, availableCountries]);

  const [country, setCountry] = useState<string>(defaultCountry);

  useEffect(() => {
    setCountry(defaultCountry);
  }, [defaultCountry]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const currentData = providersByCountry[country];
  const freeOrAds = [
    ...(currentData?.free || []),
    ...(currentData?.ads || []),
  ].filter(
    (p, idx, arr) =>
      arr.findIndex((other) => other.provider_id === p.provider_id) === idx,
  );

  return (
    <div
      className="fixed inset-0 z-1002 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[82vh] w-[92vw] max-w-2xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-[0_0_50px_rgba(245,197,24,0.15)] text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-5 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5C518]/10 text-[#F5C518] ring-1 ring-[#F5C518]/30">
              <Tv size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Where to Watch
              </h2>
              <p className="text-xs text-zinc-400 truncate max-w-sm">
                Streaming availability for{" "}
                <span className="text-zinc-200 font-medium">{title}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {availableCountries.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5">
                <Globe size={13} className="text-[#F5C518]" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  aria-label="Select region"
                  className="bg-zinc-900 text-xs font-semibold text-zinc-200 focus:outline-none cursor-pointer"
                >
                  {availableCountries.map((code) => (
                    <option key={code} value={code} className="bg-zinc-900">
                      {REGION_NAMES[code] || code}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-400 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!currentData ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                <Tv size={28} />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">
                No streaming providers listed
              </h3>
              <p className="mt-1 max-w-sm text-sm text-zinc-400">
                TMDB does not currently list streaming, rental, or purchase
                providers for this title.
              </p>
            </div>
          ) : (
            <>
              <ProviderGroup
                label="Stream (Subscription)"
                items={currentData.flatrate}
              />
              <ProviderGroup label="Free / Ad-Supported" items={freeOrAds} />
              <ProviderGroup label="Rent" items={currentData.rent} />
              <ProviderGroup label="Buy" items={currentData.buy} />

              {currentData.link && (
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                  <span>Powered by JustWatch & TMDB</span>
                  <a
                    href={currentData.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#F5C518] hover:underline"
                  >
                    <span>View direct links on TMDB</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

