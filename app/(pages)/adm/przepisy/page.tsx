"use client";

import { MainBtn } from "@/components/buttons/MainBtn";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RecipeMeta {
  title: string;
  slug: string;
  heroSrc: string;
  category: string;
  date: string;
}

export default function RecipeListPage() {
  const [recipes, setRecipes] = useState<RecipeMeta[]>([]);

  useEffect(() => {
    fetch("/api/recipes/list")
      .then((res) => res.json())
      .then((data) => setRecipes(data))
      .catch(console.error);
  }, []);

  const handleDelete = async (slug: string, category: string) => {
    const confirmed = confirm("Czy na pewno chcesz usunąć ten przepis?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/recipes/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, category }),
      });

      if (res.ok) {
        setRecipes((prev) => prev.filter((recipe) => recipe.slug !== slug));
      } else {
        alert("Błąd podczas usuwania przepisu.");
      }
    } catch (err) {
      console.error(err);
      alert("Wystąpił błąd.");
    }
  };

  // Sort
  const sortedrecipes = recipes.sort((b, a) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <div className="p-6">
      <div className="mx-auto mb-6 flex max-w-screen-2xl items-center justify-between">
        <h1 className="text-2xl font-bold">Lista Przepisów</h1>
        <Link href="/adm/przepisy/dodaj">
          <MainBtn>Dodaj przepis</MainBtn>
        </Link>
      </div>

      {sortedrecipes.length === 0 ? (
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-blue-500" />
        </div>
      ) : (
        <ul className="grid grid-cols-4 gap-3 max-w-screen-2xl mx-auto">
          {sortedrecipes.map((recipe) => (
            <li
              key={recipe.slug}
              className="flex flex-col items-center justify-between rounded border border-gray-200 p-2 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start">
                <Image
                  height={100}
                  width={100}
                  src={recipe.heroSrc}
                  alt={recipe.title}
                />
                <div className="ml-4 text-start">
                  <h2 className="text-lg font-semibold">{recipe.title}</h2>
                  <p className="text-sm text-gray-600">
                    {recipe.category} • {recipe.date.slice(0, 10)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-4 mt-3">
                <Link
                  href={`/przepis/${recipe.category}/${recipe.slug}`}
                  className="text-gray-600 hover:underline cursor-pointer"
                >
                  Podgląd
                </Link>
                <Link
                  href={`/adm/przepisy/edytuj/${recipe.slug}`}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Edytuj
                </Link>
                <button
                  onClick={() => handleDelete(recipe.slug, recipe.category)}
                  className="text-red-600 hover:underline cursor-pointer"
                >
                  Usuń
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
