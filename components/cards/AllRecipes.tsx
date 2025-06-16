import { FlexCardRecipeType } from "@/lib/searchItems";
import Image from "next/image";
import Link from "next/link";

export default function AllRecipes({
  recipesAll,
}: {
  recipesAll: FlexCardRecipeType[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {recipesAll.map((recipe, i) => (
        <Link
          href={`/przepis/${recipe.slug}`}
          key={i}
          className="w-80 shrink-0 snap-none lg:w-auto"
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
  );
}
