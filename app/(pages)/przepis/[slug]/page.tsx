import { getAllRecipeSlugs, getRecipeBySlug } from "@/lib/searchItems";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const slugs = getAllRecipeSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const awaitedParams = await Promise.resolve(params);
  const { slug } = awaitedParams;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return (
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
        <ol className="list-inside list-decimal space-y-2">
          {recipe.steps?.map((step: string, idx: number) => (
            <li key={idx}>{step.title}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
