// Skeleton primitives. Server-renderable. Animacion via CSS.

export function SkeletonBox({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-secondary/60 rounded-2xl ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// Card de negocio en formato lista (para destacados, busqueda, categoria)
export function SkeletonNegocioCard() {
  return (
    <li className="flex items-center gap-3 p-2 rounded-2xl bg-secondary/40">
      <SkeletonBox className="h-20 w-20 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <SkeletonBox className="h-4 w-2/3" />
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="h-3 w-1/2" />
      </div>
    </li>
  );
}

// Lista entera de skeleton cards
export function SkeletonNegociosList({ count = 5 }: { count?: number }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonNegocioCard key={i} />
      ))}
    </ul>
  );
}
