import { SearchItem } from "@/types";
import fs from "fs";
import matter from "gray-matter";
import path from "path";

const recipesDir = path.join(process.cwd(), "content/recipes");

export type Recipe = {
  title: string;
  slug: string;
  level: string;
  category: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  time: string;
  image: string;
  steps: {
    title: string;
    image: string;
    description: string;
  };
  content: string;
};

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const filePath = path.join(recipesDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    ...(data as Omit<Recipe, "content">),
    content,
  };
}
export function getAllRecipeSlugs(): string[] {
  const files = fs.readdirSync(recipesDir);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

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

export type FlexCardRecipeType = {
  title: string;
  level: string;
  slug: string;
  category: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  time: string;
  image: string;
};

export function getNonRecommendedRecipes(): FlexCardRecipeType[] {
  const files = fs.readdirSync(recipesDir);

  const nonRecommended = files
    .map((filename) => {
      const filePath = path.join(recipesDir, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      if (!data.recomended) {
        const slug = data.slug || filename.replace(/\.md$/, "");
        return {
          title: data.title,
          slug,
          level: data.level,
          category: data.category,
          calories: data.calories,
          protein: data.protein,
          fat: data.fat,
          carbs: data.carbs,
          time: data.time,
          steps: data.steps,
          image: data.image,
        };
      }

      return null;
    })
    .filter(Boolean) as FlexCardRecipeType[];

  return nonRecommended;
}
