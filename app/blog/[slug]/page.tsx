import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getRecentPosts, posts } from "@/lib/blog-posts";

interface Props {
  params: Promise<{ slug: string }>;
}

// Genera rutas estáticas para todos los posts
export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

  return {
    title: post.titulo,
    description: post.descripcion,
    keywords: post.keywords,
    openGraph: {
      title: post.titulo,
      description: post.descripcion,
      type: "article",
      publishedTime: post.fecha,
      url: `${siteUrl}/blog/${post.slug}`,
    },
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const relacionados = getRecentPosts(4).filter((p) => p.slug !== slug).slice(0, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://linaresya.cl";

  // JSON-LD Article
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.titulo,
    description: post.descripcion,
    datePublished: post.fecha,
    author: { "@type": "Organization", name: "LinaresYa" },
    publisher: {
      "@type": "Organization",
      name: "LinaresYa",
      url: siteUrl,
    },
    url: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 bg-[#F9F8F6] pb-24">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#2B6E80] to-[#1f5268] px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-white/60">
          <Link href="/" className="hover:text-white/90 transition">Inicio</Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-white/90 transition">Blog</Link>
          <span>›</span>
          <span className="text-white/90 truncate">{post.titulo}</span>
        </nav>

        <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
          {post.emoji} {post.categoria}
        </span>
        <h1 className="mt-2 text-xl font-black leading-tight text-white">
          {post.titulo}
        </h1>
        <time
          dateTime={post.fecha}
          className="mt-2 block text-xs text-white/60"
        >
          {new Date(post.fecha + "T00:00:00").toLocaleDateString("es-CL", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>

      {/* Contenido */}
      <article
        className="prose-linares px-4 py-6"
        dangerouslySetInnerHTML={{ __html: post.contenido }}
      />

      {/* CTA negocio */}
      <div className="mx-4 mt-2 rounded-2xl bg-[#C05A46] p-5">
        <p className="text-sm font-bold text-white">
          ¿Encontraste lo que buscabas?
        </p>
        <p className="mt-0.5 text-xs text-white/80">
          Todos los negocios de Linares, actualizados y con horarios reales.
        </p>
        <Link
          href="/buscar"
          className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-[#C05A46] hover:bg-[#F9F8F6] transition"
        >
          Ver negocios →
        </Link>
      </div>

      {/* Posts relacionados */}
      {relacionados.length > 0 && (
        <section className="px-4 pt-8">
          <h2 className="mb-4 text-base font-bold text-[#1A1410]">
            Más guías de Linares
          </h2>
          <div className="space-y-3">
            {relacionados.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-linares-sm hover:shadow-linares transition-shadow"
              >
                <span className="text-2xl">{rel.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1A1410] line-clamp-1">
                    {rel.titulo}
                  </p>
                  <p className="text-xs text-[#8E8279] line-clamp-1">
                    {rel.descripcion}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
