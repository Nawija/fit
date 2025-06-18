// /app/przepis/[category]/[slug]/page.tsx

import { getRecipeBySlugAndCategory, RecipeSteps } from "@/lib/searchItems";
import {
  BarChart3,
  ChefHat,
  ChevronRight,
  Clock,
  Flame,
  Info,
  Leaf,
  Plus,
  Soup,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Można ustawić, aby strony były generowane statycznie podczas budowania aplikacji
export const dynamic = "force-static";

// Lepsza funkcja do formatowania, obsługuje wieloczłonowe nazwy
function formatCategory(str: string): string {
  return str
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default async function RecipeCategorySlugPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const awaitedParams = await Promise.resolve(params);
  const { category, slug } = awaitedParams;
  const recipe = await getRecipeBySlugAndCategory(category, slug);

  if (!recipe) {
    return notFound();
  }

  // Założenie: przepis ma pole `description` oraz `ingredients`
  // Jeśli ich nie ma, odpowiednie sekcje po prostu się nie wyświetlą
  const {
    title,
    image,
    level,
    time,
    calories,
    protein,
    fat,
    carbs,
    description,
    ingredients,
    steps,
  } = recipe;

  return (
    <div className="anim-opacity bg-slate-50 text-slate-800">
      <article>
        {/* === SEKCJA HERO === */}
        <div className="-mt-6 h-[70vh] w-full">
          <header className="fixed h-[70vh] w-full">
            {/* Obraz w tle */}
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              priority
            />
            {/* Gradient dla czytelności tekstu */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

            <div className="relative container mx-auto flex h-full flex-col justify-end p-4 pb-12 text-white md:p-8 md:pb-16">
              {/* Breadcrumbs (nawigacja) */}
              <div className="mb-4 flex items-center text-sm text-slate-200">
                <Link href="/" className="hover:text-white">
                  Strona główna
                </Link>
                <ChevronRight size={16} className="mx-1" />
                <Link href="/przepisy" className="hover:text-white">
                  Przepisy
                </Link>
                <ChevronRight size={16} className="mx-1" />
                <Link
                  href={`/przepisy/${category}`}
                  className="font-semibold text-white"
                >
                  {formatCategory(category)}
                </Link>
              </div>

              <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance md:text-6xl">
                {title}
              </h1>

              {/* Kluczowe informacje */}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-lg">
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  <span>{time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat size={20} />
                  <span>{level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame size={20} />
                  <span>{calories} kcal</span>
                </div>
              </div>
            </div>
          </header>
        </div>

        {/* === GŁÓWNA TREŚĆ (2 KOLUMNY) === */}
        <div className="relative h-full w-full bg-slate-50 p-2">
          <div className="relative z-20 mx-auto grid max-w-screen-2xl grid-cols-1 gap-8 px-4 pb-8 lg:grid-cols-3 lg:gap-12">
            {/* LEWA KOLUMNA: OPIS I KROKI */}
            <div className="order-1 -mt-12 lg:order-first lg:col-span-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
                {/* Krótki opis przepisu */}
                {description && (
                  <>
                    <h1 className="mb-4 text-2xl leading-tight font-bold tracking-tight text-balance md:text-3xl">
                      {title}
                    </h1>
                    <div className="prose prose-lg max-w-none text-slate-600">
                      <p>{description}</p>
                    </div>
                  </>
                )}

                {/* Kroki przygotowania */}
                <div className={description ? "mt-12" : ""}>
                  <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold">
                    <Soup size={32} className="text-indigo-500" />
                    Przygotowanie
                  </h2>
                  <div className="space-y-10">
                    {steps?.map((step: RecipeSteps, idx) => (
                      <div key={idx} className="flex gap-4 md:gap-6">
                        <div className="flex-shrink-0 text-3xl font-bold text-slate-300 md:text-4xl">
                          {idx + 1}.
                        </div>
                        <div className="flex-grow">
                          {step.title && (
                            <h3 className="text-xl font-semibold text-slate-800">
                              {step.title}
                            </h3>
                          )}
                          <ul className="mt-2 space-y-2 text-slate-600">
                            {step.description.map((desc: string, i: number) => (
                              <li key={i} className="flex items-start gap-3">
                                <Plus
                                  size={16}
                                  className="mt-1.5 flex-shrink-0 text-indigo-500"
                                />
                                <span>{desc}</span>
                              </li>
                            ))}
                          </ul>
                          {step.image && (
                            <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
                              <Image
                                src={step.image}
                                alt={step.title || `Krok ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 66vw"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PRAWA KOLUMNA: SKŁADNIKI I DANE */}
            <aside className="-mt-12 lg:col-span-1">
              <div className="sticky top-4 space-y-8">
                {/* Karta Składników */}
                {ingredients && ingredients.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
                    <h3 className="mb-4 flex items-center gap-3 text-2xl font-bold">
                      <Leaf size={24} className="text-green-500" />
                      Składniki
                    </h3>
                    <ul>
                      {ingredients.map((ing: string, i: number) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 rounded-md p-1.5 hover:bg-slate-100"
                        >
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-slate-700">{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Karta Danych */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
                  <h3 className="mb-4 flex items-center gap-3 text-2xl font-bold">
                    <Info size={24} className="text-blue-500" />
                    Szczegóły
                  </h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex justify-between">
                      <span>
                        <strong>Poziom:</strong>
                      </span>{" "}
                      <span>{level}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>
                        <strong>Czas:</strong>
                      </span>{" "}
                      <span>{time}</span>
                    </li>
                  </ul>
                  <hr className="my-4 border-slate-200" />
                  <h4 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                    <BarChart3 size={20} className="text-slate-500" />
                    Wartości odżywcze
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex justify-between">
                      <span>Kalorie:</span>{" "}
                      <span className="font-medium">{calories} kcal</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Białko:</span>{" "}
                      <span className="font-medium">{protein} g</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Tłuszcze:</span>{" "}
                      <span className="font-medium">{fat} g</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Węglowodany:</span>{" "}
                      <span className="font-medium">{carbs} g</span>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </div>
  );
}
