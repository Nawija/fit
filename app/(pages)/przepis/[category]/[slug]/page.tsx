// /app/przepis/[category]/[slug]/page.tsx

import { getRecipeBySlugAndCategory, RecipeSteps } from "@/lib/searchItems";
import {
  BarChart3,
  Check,
  ChefHat,
  ChevronRight,
  Clock,
  Flame,
  Home,
  Soup,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import IngredientsCard from "./IngredientsCard";
export const dynamic = "force-static";

function formatCategory(str: string): string {
  return str
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const MacroDonut = ({
  value,
  total,
  label,
  color,
  unit,
}: {
  value: number;
  total: number;
  label: string;
  color: string;
  unit: string;
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const circumference = 2 * Math.PI * 15.9155; // 2 * pi * r, gdzie r=15.9155, aby obwód był 100
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 36 36" className="h-full w-full">
          {/* Tło wykresu */}
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            className="stroke-current text-zinc-200"
            strokeWidth="3"
            fill="transparent"
          />
          {/* Pasek postępu */}
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            className={`stroke-current ${color}`}
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
        {/* Wartość w środku */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-zinc-800 lg:text-2xl">
            {value}
          </span>
          <span className="-mt-1 text-xs text-zinc-500 lg:text-base">
            {unit}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-zinc-600">{label}</p>
    </div>
  );
};

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

  const {
    title,
    image,
    level,
    time,
    calories,
    protein,
    fiber,
    fat,
    carbs,
    description,
    ingredients,
    steps,
  } = recipe;

  const totalMacros = protein + fat + carbs;

  return (
    <div className="anim-opacity bg-gray-50 text-zinc-800">
      {/* Breadcrumbs (nawigacja) */}
      <div className="flex items-center p-4 text-sm text-zinc-500 max-w-7xl mx-auto">
        <Link href="/" className="hover:text-zinc-900">
          <Home size={16} />
        </Link>
        <ChevronRight size={16} className="mx-1" />
        <Link href="/przepis" className="hover:text-zinc-900">
          Przepisy
        </Link>
        <ChevronRight size={16} className="mx-1" />
        <Link
          href={`/przepisy/${category}`}
          className="font-semibold text-blue-600"
        >
          {formatCategory(category)}
        </Link>
      </div>
      <article>
        {/* === SEKCJA HERO W STYLU FACEBOOK === */}
        <div className="w-full bg-white shadow-sm">
          {/* 1. Zdjęcie w tle (Cover Photo) */}
          <div className="relative h-[16vh] w-full md:h-[35vh]">
            <Image
              src={image}
              alt={`Tło dla ${title}`}
              quality={10}
              fill
              className="object-cover blur-md"
              priority
            />
            {/* Gradient dla czytelności */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* 2. Kontener na avatar, tytuł i kluczowe informacje */}
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center pb-12 text-center md:flex-row md:items-start md:text-left">
              {/* Avatar (zdjęcie dania) */}
              <div className="relative h-48 w-48 -translate-y-10 md:h-60 md:w-60">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="rounded-full border-4 border-white object-cover shadow-lg md:border-8"
                />
              </div>

              {/* Tytuł i opis */}
              <div className="mt-4 md:ml-6">
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 md:text-5xl">
                  {title}
                </h1>
                <p className="mt-2 max-w-2xl text-lg text-zinc-600">
                  {description}
                </p>
              </div>
            </div>

            {/* 3. Pasek z nawigacją i kluczowymi informacjami */}
            <div className="flex flex-col items-start justify-between border-t border-zinc-200 pt-3 pb-4 md:flex-row md:items-center">
              {/* Podstawowe info (Czas, Poziom, Porcje) */}
              <div className="mt-4 flex gap-x-6 text-center text-zinc-700 md:mt-0">
                <div className="flex flex-col items-center">
                  <Clock
                    size={36}
                    className="mb-1 rounded-full bg-blue-100 p-2 text-blue-500"
                  />
                  <span className="text-sm font-semibold">{time}</span>
                </div>
                <div className="flex flex-col items-center">
                  <ChefHat
                    size={36}
                    className="mb-1 rounded-full bg-blue-100 p-2 text-blue-500"
                  />
                  <span className="text-sm font-semibold">{level}</span>
                </div>
                <div className="flex flex-col items-center">
                  <ChefHat
                    size={36}
                    className="mb-1 rounded-full bg-blue-100 p-2 text-blue-500"
                  />
                  <span className="text-sm font-semibold">
                    {steps.length} Kroków{" "}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === NOWA, DEDYKOWANA SEKCJA WARTOŚCI ODŻYWCZYCH === */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <h2 className="mb-6 text-2xl font-bold text-zinc-800">
              Wartości odżywcze w 1 porcji
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* 1. Kolumna: Kalorie i Makroskładniki */}

              {/* Karta Kalorii */}
              <div className="flex flex-col items-center justify-start rounded-xl bg-gradient-to-bl from-red-50 to-teal-50 p-6 ring-1 ring-zinc-200">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-zinc-600">
                  <Flame size={20} className="text-red-500" />
                  Wartość energetyczna
                </h3>
                <p className="mt-6 text-6xl font-extrabold text-zinc-800">
                  {calories}
                </p>
                <p className="-mt-1 text-lg text-zinc-500">kcal</p>
              </div>

              {/* Karta Makroskładników */}
              <div className="rounded-xl bg-zinc-50 p-6 ring-1 ring-zinc-200 lg:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-600">
                  <BarChart3 size={20} className="text-zinc-500" />
                  Makroskładniki
                </h3>
                <div className="overflow-x-auto lg:overflow-visible">
                  <div className="flex w-max snap-x gap-4 px-1 lg:w-full lg:snap-none lg:justify-around">
                    <MacroDonut
                      label="Białko"
                      value={protein}
                      total={totalMacros}
                      color="text-blue-300"
                      unit="g"
                    />
                    <MacroDonut
                      label="Węglowodany"
                      value={carbs}
                      total={totalMacros}
                      color="text-violet-400"
                      unit="g"
                    />
                    <MacroDonut
                      label="Tłuszcz"
                      value={fat}
                      total={totalMacros}
                      color="text-yellow-400"
                      unit="g"
                    />
                    <MacroDonut
                      label="Błonnik"
                      value={fiber}
                      total={totalMacros}
                      color="text-green-500"
                      unit="g"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div className="relative mt-8 w-full">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 pb-16 lg:grid-cols-3">
          {/* LEWA KOLUMNA: OPIS I KROKI */}
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/50 md:p-8">
              {description && (
                <div className="text-zinc-600">
                  <p>{description}</p>
                </div>
              )}

              {/* Kroki przygotowania */}
              <div className={description ? "mt-16" : ""}>
                <h2 className="mb-10 flex items-center gap-4 text-3xl font-bold">
                  <Soup size={32} className="text-teal-500" />
                  Przygotowanie
                </h2>
                <div className="ml-4 space-y-12">
                  {steps?.map((step: RecipeSteps, idx) => (
                    <>
                      <div key={idx} className="relative flex">
                        {/* Nowy, wizualny licznik kroków */}
                        <div className="absolute top-1 -left-[16px] flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 font-bold text-white shadow">
                          {idx + 1}
                        </div>
                        <div className="flex-grow pt-2 pl-10">
                          {step.title && (
                            <h3 className="text-xl font-bold text-zinc-800">
                              {step.title}
                            </h3>
                          )}
                          <ul className="mt-3 space-y-3 text-zinc-600">
                            {step.description.map((desc: string, i: number) => (
                              <li key={i} className="flex items-start gap-3">
                                <Check
                                  size={18}
                                  className="mt-1 flex-shrink-0 text-teal-500"
                                />
                                <span>{desc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {step.image && (
                        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl">
                          <Image
                            src={step.image}
                            alt={step.title || `Krok ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 66vw"
                          />
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PRAWA KOLUMNA: SKŁADNIKI I WARTOŚCI ODŻYWCZE */}
          <aside className="order-1 lg:order-2 lg:col-span-1">
            <div className="sticky top-12 space-y-8">
              {/* Karta Składników */}
              {ingredients && ingredients.length > 0 && (
                <IngredientsCard ingredients={ingredients} />
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
