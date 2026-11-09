"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type HomeCategory = {
  id: number;
  nombre: string;
  slug: string;
  emoji: string;
};

export default function HomeCategories({ categories }: { categories: HomeCategory[] }) {
  if (!categories.length) return null;

  return (
    <section className="ly-categories-section" aria-label="Explora todas las categorías">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-[#292521] sm:text-xl">Explora por categoría</h2>
          <p className="mt-1 text-xs text-[#858078]">Encuentra lo que necesitas en Linares</p>
        </div>
        <Link href="/categorias" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#d94a35]">Ver todas <ArrowRight size={14}/></Link>
      </div>
      <div className="ly-category-icons">
        {categories.map((category, index) => (
          <Link key={category.id} href={`/${category.slug}`} className="ly-category-icon-card">
            <span className={`ly-category-icon ly-category-tone-${index % 6}`} aria-hidden="true">{category.emoji || "🏪"}</span>
            <span className="ly-category-name">{category.nombre}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
