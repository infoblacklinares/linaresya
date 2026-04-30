import { SkeletonBox, SkeletonNegociosList } from "@/components/Skeleton";

export default function BuscarLoading() {
  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3">
          <SkeletonBox className="h-12 w-full" />
        </div>
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBox key={i} className="h-8 w-20 shrink-0 rounded-full" />
          ))}
        </div>
      </header>
      <section className="px-4 pt-4">
        <SkeletonNegociosList count={6} />
      </section>
    </main>
  );
}
