import { SearchItem } from "@/types";
import fs from "fs";
import matter from "gray-matter";
import path from "path";

const recipesDir = path.join(process.cwd(), "content/recipes");

export type RecipeSteps = {
  title: string;
  image: string;
  description: string[];
};

export type Recipe = {
  title: string;
  slug: string;
  level: string;
  category: string;
  calories: string;
  protein: string;
  fat: string;
  date: string;
  carbs: string;
  time: string;
  image: string;
  steps: RecipeSteps[];
  content: string;
};

function getAllMarkdownFilesRecursively(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return getAllMarkdownFilesRecursively(fullPath);
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      return fullPath;
    }

    return [];
  });
}

export async function getRecipeBySlugAndCategory(
  category: string,
  slug: string,
): Promise<Recipe | null> {
  const filePath = path.join(recipesDir, category, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);

  return {
    slug: data.slug || slug,
    title: data.title || "Brak tytułu",
    level: data.level,
    calories: data.calories,
    protein: data.protein,
    fat: data.fat,
    carbs: data.carbs,
    time: data.time,
    steps: data.steps,
    category,
    date: data.date || "",
    image: data.image || [],
    content,
  };
}

export async function getAllSearchItems(): Promise<SearchItem[]> {
  const markdownFiles = getAllMarkdownFilesRecursively(recipesDir);

  const items: SearchItem[] = markdownFiles.map((filePath) => {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    const slug = data.slug || path.basename(filePath).replace(/\.md$/, "");
    const category = path.basename(path.dirname(filePath)); // folder = kategoria

    return {
      title: data.title,
      image: data.image,
      slug,
      category,
      content,
    };
  });

  return items;
}

export type RecommendedRecipe = {
  title: string;
  category: string;
  slug: string;
  image: string;
};

export function getRecommendedRecipes(): RecommendedRecipe[] {
  const markdownFiles = getAllMarkdownFilesRecursively(recipesDir);

  const recommended = markdownFiles
    .map((filePath) => {
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      if (data.recomended) {
        const slug = data.slug || path.basename(filePath).replace(/\.md$/, "");
        return {
          title: data.title,
          category: data.category,
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
  const markdownFiles = getAllMarkdownFilesRecursively(recipesDir);

  const nonRecommended = markdownFiles
    .map((filePath) => {
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      if (!data.recomended) {
        const slug = data.slug || path.basename(filePath).replace(/\.md$/, "");
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
          image: data.image,
        };
      }

      return null;
    })
    .filter(Boolean) as FlexCardRecipeType[];

  return nonRecommended;
}
