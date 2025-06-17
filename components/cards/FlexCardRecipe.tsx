import { FlexCardRecipeType } from "@/lib/searchItems";
import Image from "next/image";
import Link from "next/link";

export default function FlexCardRecipe({
  recipesAll,
}: {
  recipesAll: FlexCardRecipeType[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {recipesAll.map((recipe, index) => (
        <Link
          href={`/przepis/${recipe.category}/${recipe.slug}`}
          key={index}
          className="flex items-start justify-start gap-4 rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <div className="min-w-[120px]">
            <Image
              src={recipe.image}
              alt={recipe.title}
              height={100}
              width={150}
              className="h-32 w-full rounded-md object-cover"
            />
          </div>
          <div className="space-y-1">
            <p className="inline-block rounded-full bg-blue-500 px-3 py-1 text-sm text-white">
              Nowość
            </p>
            <h2 className="text-xl font-semibold">{recipe.title}</h2>
            <p className="text-gray-600">Poziom: {recipe.level}</p>
            <p className="text-gray-600">Czas: {recipe.time}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
