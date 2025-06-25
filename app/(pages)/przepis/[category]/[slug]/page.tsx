// /app/przepis/[category]/[slug]/page.tsx

import { getRecipeBySlugAndCategory, RecipeSteps } from "@/lib/searchItems";
import {
  Bookmark,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  Clock,
  Feather,
  Flame,
  Home,
  Printer,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import IngredientsCard from "./IngredientsCard"; // Zakładamy, że ten komponent istnieje

// Funkcja pomocnicza do formatowania kategorii (bez zmian)
function formatCategory(str: string): string {
  return str
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// --- NOWE KOMPONENTY WIZUALNE ---

// Karta z kluczową informacją (Czas, Poziom, Porcje)
const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-zinc-100">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="text-lg font-bold text-zinc-800">{value}</p>
    </div>
  </div>
);

// Karta z wartością odżywczą
const NutrientCard = ({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) => (
  <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 text-center ring-1 ring-zinc-100 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
    <p className="text-sm font-medium text-zinc-600">{label}</p>
    <p className="text-xs text-zinc-400">{unit}</p>
  </div>
);

// --- GŁÓWNY KOMPONENT STRONY ---

export default async function RecipeCategorySlugPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const { category, slug } = await params;
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
    fat,
    carbs,
    description,
    ingredients,
    steps,
  } = recipe;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-zinc-800">
      {/* === NOWA SEKCJA HERO === */}
      <header className="relative h-[60vh] w-full">
        <Image
          src={image}
          alt={`Zdjęcie dania ${title}`}
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <div className="max-w-3xl p-4">
            <Link
              href={`/przepisy/${category}`}
              className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              {formatCategory(category)}
            </Link>
            <h1 className="mt-4 font-serif text-5xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-zinc-200 drop-shadow-md">
              {description}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Nawigacja okruszkowa (Breadcrumbs) */}
        <div className="mb-8 flex items-center text-sm text-zinc-500">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-amber-600"
          >
            <Home size={16} />
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <Link href="/przepis" className="hover:text-amber-600">
            Przepisy
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="font-semibold text-zinc-800">{title}</span>
        </div>

        {/* --- GŁÓWNA TREŚĆ - UKŁAD DWUKOLUMNOWY --- */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* LEWA, GŁÓWNA KOLUMNA */}
          <div className="lg:col-span-2">
            {/* KARTY Z KLUCZOWYMI INFORMACJAMI */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InfoCard icon={<Clock size={24} />} label="Czas" value={time} />
              <InfoCard
                icon={<Feather size={24} />}
                label="Poziom"
                value={level}
              />
              <InfoCard
                icon={<ChefHat size={24} />}
                label="Porcje"
                value="2-3"
              />{" "}
              {/* Przykładowa wartość */}
            </section>

            {/* SEKCJA PRZYGOTOWANIA */}
            <section className="mt-12">
              <h2 className="font-serif text-4xl font-bold text-zinc-900">
                Sposób przygotowania
              </h2>
              <div className="mt-8 space-y-10">
                {steps?.map((step: RecipeSteps, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex w-max items-center justify-center gap-2 bg-gray-200 px-4 py-2 rounded-2xl font-bold ">
                      <span className="text-xl font-bold text-green-600">
                        Krok {idx + 1}
                      </span>
                      {step.title && (
                        <h3 className="text-xl font-bold text-zinc-600">
                          {step.title}
                        </h3>
                      )}
                    </div>
                    <ul className="mt-3 space-y-3 text-lg text-zinc-600">
                      {step.description.map((desc: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2
                            size={20}
                            className="mt-1 flex-shrink-0 text-green-600"
                          />
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                    {step.image && (
                      <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl shadow-md">
                        <Image
                          src={step.image}
                          alt={step.title || `Krok ${idx + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 66vw"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* PRAWA KOLUMNA (PRZYKLEJONA) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* PRZYCISKI AKCJI */}
              <div className="flex gap-2">
                <button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 font-semibold text-white transition-colors hover:bg-amber-600">
                  <Bookmark size={18} /> Zapisz
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-300">
                  <Share2 size={18} />
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-300">
                  <Printer size={18} />
                </button>
              </div>

              {ingredients && ingredients.length > 0 && (
                <IngredientsCard ingredients={ingredients} />
              )}

              {/* WARTOŚCI ODŻYWCZE */}
              <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-zinc-100">
                <h3 className="flex items-center gap-3 font-serif text-2xl font-bold text-zinc-900">
                  <Flame size={24} className="text-orange-500" />
                  Wartości odżywcze
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  w przybliżeniu na porcję
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <NutrientCard
                    label="Kalorie"
                    value={calories}
                    unit="kcal"
                    color="text-orange-500"
                  />
                  <NutrientCard
                    label="Białko"
                    value={protein}
                    unit="g"
                    color="text-sky-500"
                  />
                  <NutrientCard
                    label="Węglowodany"
                    value={carbs}
                    unit="g"
                    color="text-violet-500"
                  />
                  <NutrientCard
                    label="Tłuszcz"
                    value={fat}
                    unit="g"
                    color="text-amber-500"
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
