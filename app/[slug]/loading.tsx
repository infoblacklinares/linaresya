import { SkeletonBox, SkeletonNegociosList } from "@/components/Skeleton";

export default function CategoriaLoading() {
  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <SkeletonBox className="h-9 w-9 rounded-full" />
          <SkeletonBox className="h-5 w-40" />
        </div>
      </header>

      <section className="px-4 pt-4">
        <SkeletonBox className="h-32 w-full" />
      </section>

      <section className="px-4 pt-6">
        <SkeletonNegociosList count={5} />
      </section>
    </main>
  );
}
