import { getRecipeBySlugAndCategory, RecipeSteps } from "@/lib/searchItems";
import Image from "next/image";
import { notFound } from "next/navigation";
export const dynamic = "force-static";

function capitalizeWithSpaces(str: string): string {
  const withSpaces = str.replace(/-/g, " ");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
}

export default async function RecipeCategorySlugPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const awaitedParams = await Promise.resolve(params);
  const { category, slug } = awaitedParams;

  const recipe = await getRecipeBySlugAndCategory(category, slug);

  if (!recipe) return notFound();


  return (
    <>
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-3xl font-bold">{recipe.title}</h1>
        <Image
          src={recipe.image}
          alt={recipe.title}
          width={800}
          height={400}
          className="mb-4 rounded-lg"
        />
        <div className="mb-6 space-y-2 text-gray-700">
          <p>
            <strong>Poziom:</strong> {recipe.level}
          </p>
          <p>
            <strong>Kategoria:</strong> {recipe.category}
          </p>
          <p>
            <strong>Czas:</strong> {recipe.time}
          </p>
          <p>
            <strong>Kalorie:</strong> {recipe.calories}
          </p>
          <p>
            <strong>Białko:</strong> {recipe.protein}
          </p>
          <p>
            <strong>Tłuszcze:</strong> {recipe.fat}
          </p>
          <p>
            <strong>Węglowodany:</strong> {recipe.carbs}
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-2xl font-semibold">Kroki</h2>
          <ol className="list-inside list-decimal space-y-4">
            {recipe.steps?.map((step: RecipeSteps, idx) => (
              <li key={idx}>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <div className="mt-2">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={600}
                    height={300}
                    className="rounded-lg"
                  />
                </div>
                <ul className="ml-4 list-inside list-disc text-gray-700">
                  {step.description.map((desc: string, i: number) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
