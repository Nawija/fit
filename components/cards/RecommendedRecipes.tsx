"use client";

import { RecommendedRecipe } from "@/lib/searchItems";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

export default function RecommendedRecipes({
  recipes,
}: {
  recipes: RecommendedRecipe[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  if (!recipes.length) {
    return null;
  }

  return (
    <section className="mx-auto py-12 lg:max-w-7xl lg:py-24">
      <h2 className="mx-auto mb-6 px-4 text-start text-2xl font-semibold">
        Polecane przepisy
      </h2>

      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        className="hide-scrollbar flex cursor-grab snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth select-none active:cursor-grabbing lg:grid lg:grid-cols-4 lg:px-4"
      >
        <div className="w-0 shrink-0 lg:hidden" aria-hidden />
        {recipes.map((recipe, i) => (
          <Link
            href={`/przepis/${recipe.slug}`}
            key={i}
            className="w-72 shrink-0 snap-none lg:w-auto"
          >
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={recipe.image}
                alt={recipe.title}
                height={200}
                width={300}
                className="h-48 w-full object-cover"
              />
              <p className="p-4 text-center font-medium">{recipe.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
