import { SearchItem } from "@/types";
import fs from "fs";
import matter from "gray-matter";
import path from "path";

const recipesDir = path.join(process.cwd(), "content/recipes");

export async function getAllSearchItems(): Promise<SearchItem[]> {
  const files = fs.readdirSync(recipesDir);
  const items = files.map((filename) => {
    const filePath = path.join(recipesDir, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    return {
      ...(data as Omit<SearchItem, "content">),
      content,
    };
  });

  return items;
}

export type RecommendedRecipe = {
  title: string;
  slug: string;
  image: string;
};

export function getRecommendedRecipes(): RecommendedRecipe[] {
  const files = fs.readdirSync(recipesDir);

  const recommended = files
    .map((filename) => {
      const filePath = path.join(recipesDir, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      if (data.recomended) {
        const slug = data.slug || filename.replace(/\.md$/, "");
        return {
          title: data.title,
          slug,
          image: data.image,
        };
      }

      return null;
    })
    .filter(Boolean) as RecommendedRecipe[];

  return recommended;
}
