"use client";

import Link from "next/link";

export type HomeCategory = {
  id: number;
  nombre: string;
  slug: string;
  emoji: string;
};

export default function HomeCategories({ categories }: { categories: HomeCategory[] }) {
  if (!categories.length) return null;

  return (
    <section className="ly-home-categories" aria-label="Explora todas las categorías">
      <div className="mb-2 flex items-center justify-between px-4">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-[#17232B] sm:text-base">Explora por categoría</h2>
          <p className="mt-0.5 text-[10px] text-[#78838A] sm:text-xs">Encuentra justo lo que necesitas en Linares</p>
        </div>
        <span className="shrink-0 text-[10px] font-semibold text-[#78838A]">{categories.length} categorías</span>
      </div>
      <div className="ly-home-categories-viewport">
        <div className="ly-home-categories-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="ly-home-categories-group" aria-hidden={copy === 1}>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  tabIndex={copy === 1 ? -1 : 0}
                  className="ly-home-category-chip"
                >
                  <span aria-hidden="true" className="ly-home-category-emoji">{category.emoji || "🏪"}</span>
                  <span>{category.nombre}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
