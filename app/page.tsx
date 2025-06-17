import AllRecipesPaginated from "@/components/cards/AllRecipesPaginated";
import FlexCardRecipe from "@/components/cards/FlexCardRecipe";
import RecommendedRecipes from "@/components/cards/RecommendedRecipes";
import Hero from "@/components/Hero";
import {
  getNonRecommendedRecipes,
  getRecommendedRecipes,
} from "@/lib/searchItems";
import { Suspense } from "react";

export default function Home() {
  const recipesRecomend = getRecommendedRecipes();
  const recipesAll = getNonRecommendedRecipes();
  return (
    <>
      <Hero />
      <RecommendedRecipes recipes={recipesRecomend.slice(0, 8)} />
      <section className="mx-auto max-w-7xl px-4">
        <h2 className="mx-auto mb-6 text-start text-2xl font-semibold">
          Nowe przepisy
        </h2>
        <FlexCardRecipe recipesAll={recipesAll.slice(0, 4)} />
      </section>
      <section className="mx-auto px-4 py-12 lg:max-w-7xl lg:py-24">
        <h2 className="mx-auto mb-6 text-start text-2xl font-semibold">
          Fit przepisy
        </h2>
        <Suspense fallback={<div>Ładowanie przepisów...</div>}>
          <AllRecipesPaginated recipesAll={recipesAll} />
        </Suspense>
      </section>
    </>
  );
}
