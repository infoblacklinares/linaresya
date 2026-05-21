import type { Metadata } from "next";
import Link from "next/link";
import { getRecentPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog — Guías y consejos para Linares",
  description:
    "Artículos, guías y consejos útiles sobre negocios, servicios y vida cotidiana en Linares, Chile. Dónde comer, gasfíteres, veterinarias y más.",
  openGraph: {
    title: "Blog LinaresYa — Guías para Linares",
    description: "Artículos útiles sobre servicios y negocios en Linares, Chile.",
  },
};

export default function BlogPage() {
  const posts = getRecentPosts(20);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 bg-[#F9F8F6] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2B6E80] to-[#1f5268] px-4 py-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
          📝 Blog
        </div>
        <h1 className="mt-2 text-2xl font-black leading-tight text-white">
          Guías y consejos<br />
          <span className="text-[#F4B860]">para Linares</span>
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Todo lo que necesitás saber sobre negocios, servicios y vida en Linares.
        </p>
      </div>

      {/* Posts */}
      <div className="px-4 pt-6 space-y-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex gap-4 rounded-2xl bg-white p-4 shadow-linares-sm hover:shadow-linares transition-shadow"
          >
            {/* Emoji */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#2B6E80]/8 text-3xl">
              {post.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-block rounded-full bg-[#2B6E80]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2B6E80]">
                {post.categoria}
              </span>
              <h2 className="mt-1 text-sm font-bold leading-snug text-[#1A1410] line-clamp-2">
                {post.titulo}
              </h2>
              <p className="mt-1 text-xs text-[#8E8279] line-clamp-2">
                {post.descripcion}
              </p>
              <time
                dateTime={post.fecha}
                className="mt-1.5 block text-[11px] text-[#8E8279]"
              >
                {new Date(post.fecha + "T00:00:00").toLocaleDateString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mx-4 mt-8 rounded-2xl bg-[#C05A46] p-5 text-center">
        <p className="text-sm font-bold text-white">
          ¿Tu negocio no aparece en LinaresYa?
        </p>
        <Link
          href="/publicar"
          className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-[#C05A46] hover:bg-[#F9F8F6] transition"
        >
          Publicar gratis →
        </Link>
      </div>
    </main>
  );
}
