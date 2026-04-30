import { SkeletonBox } from "@/components/Skeleton";

export default function NegocioLoading() {
  return (
    <main className="flex-1 mx-auto w-full max-w-2xl">
      {/* Hero */}
      <SkeletonBox className="h-56 w-full rounded-none" />

      <section className="px-4 pt-4 space-y-3">
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-8 w-3/4" />
        <div className="flex gap-2">
          <SkeletonBox className="h-7 w-24 rounded-full" />
          <SkeletonBox className="h-7 w-20 rounded-full" />
        </div>
      </section>

      <section className="px-4 mt-5">
        <div className="grid grid-cols-3 gap-2">
          <SkeletonBox className="h-16" />
          <SkeletonBox className="h-16" />
          <SkeletonBox className="h-16" />
        </div>
      </section>

      <section className="px-4 mt-6 space-y-2">
        <SkeletonBox className="h-4 w-24" />
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="h-3 w-2/3" />
      </section>

      <section className="px-4 mt-6 space-y-2">
        <SkeletonBox className="h-4 w-20" />
        <SkeletonBox className="h-32 w-full" />
      </section>
    </main>
  );
}
