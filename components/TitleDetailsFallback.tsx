export default function TitleDetailsFallback() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background Skeleton */}
      <div className="absolute inset-0 animate-pulse bg-zinc-900" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black via-black/70 to-black/30" />

      {/* Ambient Glow */}
      <div className="absolute top-0 left-0 h-125 w-125 rounded-full bg-yellow-500/5 blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-screen flex-col justify-between px-5 pt-20 pb-24 md:px-8 md:pt-28 md:pb-10 lg:flex-row lg:items-end">
        {/* Left Content */}
        <div className="max-w-3xl">
          {/* Genres */}
          <div className="mb-6 flex flex-col gap-3 md:absolute md:top-10 md:right-10">
            <div className="h-8 w-56 md:w-84 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-8 w-64 md:w-90 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-8 w-full max-w-xl md:w-xl animate-pulse rounded-full bg-zinc-800" />
            {/* Rating */}
            <div className="mt-4 md:mt-8 h-8 w-27 animate-pulse rounded-full bg-[#F5C518]/20" />
          </div>

          {/* Title */}
          <div className="space-y-4 md:absolute md:inset-0 md:p-10">
            <div className="h-12 w-[70%] md:h-16 md:w-[30%] animate-pulse rounded-xl bg-zinc-800" />
            <div className="h-12 w-[50%] md:h-16 md:w-[20%] animate-pulse rounded-xl bg-zinc-800" />
          </div>

          {/* Metadata */}
          <div className="mt-8 flex flex-wrap gap-3 md:gap-4">
            <div className="h-10 w-24 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-10 w-32 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-10 w-28 animate-pulse rounded-full bg-zinc-800" />
          </div>

          {/* Overview */}
          <div className="mt-10 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-[95%] animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-[85%] animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-[70%] animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-[70%] animate-pulse rounded bg-zinc-800" />
          </div>
        </div>

        {/* Poster Skeleton */}
        <div className="mt-16 lg:mt-0">
          <div className="relative aspect-2/3 h-64 md:h-85 overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
            {/* Shine Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 left-[-120%] h-full w-[60%] rotate-12 animate-[shine_2s_linear_infinite] bg-white/10 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
