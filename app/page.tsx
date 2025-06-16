import RecommendedRecipes from "@/components/cards/RecommendedRecipes";
import Hero from "@/components/Hero";
import { getRecommendedRecipes } from "@/lib/searchItems";

export default function Home() {
  const recipes = getRecommendedRecipes();
  return (
    <>
      <Hero />
      <RecommendedRecipes recipes={recipes} />
    </>
  );
}
