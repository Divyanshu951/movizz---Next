export default function MovieDetailsFallback() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background Skeleton */}
      <div className="absolute inset-0 animate-pulse bg-zinc-900" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black via-black/70 to-black/30" />

      {/* Ambient Glow */}
      <div className="absolute top-0 left-0 h-125 w-125 rounded-full bg-yellow-500/5 blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-screen flex-col justify-between px-8 pt-28 pb-10 lg:flex-row lg:items-end">
        {/* Left Content */}
        <div className="max-w-3xl">
          {/* Genres */}
          <div className="absolute top-10 right-10 mb-6 flex flex-col gap-3">
            <div className="h-8 w-84 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-8 w-90 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-8 w-xl animate-pulse rounded-full bg-zinc-800" />
            {/* Rating */}
            <div className="mt-8 h-8 w-27 animate-pulse rounded-full bg-[#F5C518]/20" />
          </div>

          {/* Title */}
          <div className="absolute inset-0 space-y-4 p-10">
            <div className="h-16 w-[30%] animate-pulse rounded-xl bg-zinc-800" />
            <div className="h-16 w-[20%] animate-pulse rounded-xl bg-zinc-800" />
          </div>

          {/* Metadata */}
          <div className="mt-8 flex gap-4">
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
          <div className="relative aspect-2/3 h-85 overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
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
