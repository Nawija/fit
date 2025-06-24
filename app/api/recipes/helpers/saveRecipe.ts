// /app/api/recipes/helpers/saveRecipe.ts

import { Recipe, Step } from "@/types/recipe";
import fs from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import sharp from "sharp";
import slugify from "slugify";

const RECIPES_CONTENT_PATH = path.join(process.cwd(), "content/recipes");
const RECIPES_PUBLIC_PATH = path.join(process.cwd(), "public/images/recipes");

type FormStep = Omit<Step, "image"> & {
  image?: string | null;
};

type RecipeFormData = Omit<
  Recipe,
  | "date"
  | "category"
  | "steps"
  | "protein"
  | "calories"
  | "carbs"
  | "fiber"
  | "fat"
> & {
  category: string;
  steps: FormStep[];
  protein?: number;
  calories?: number;
  carbs?: number;
  fiber?: number;
  fat?: number;
  originalSlug?: string;
  originalCategory?: string;
};

interface SaveRecipeParams {
  recipeData: RecipeFormData;
  images: File[];
  oldSlug?: string;
  oldCategory?: string;
}
// --- KONIEC DEFINICJI TYPÓW ---

export async function findRecipePath(
  slug: string,
): Promise<{ filePath: string; category: string } | null> {
  const categoriesRaw = await fs.readdir(RECIPES_CONTENT_PATH);
  for (const categorySlug of categoriesRaw) {
    const categoryPath = path.join(RECIPES_CONTENT_PATH, categorySlug);
    const stats = await fs.stat(categoryPath);
    if (stats.isDirectory()) {
      const filePath = path.join(categoryPath, `${slug}.md`);
      try {
        await fs.access(filePath);
        return { filePath, category: categorySlug };
      } catch {
        // Plik nie istnieje w tej kategorii, kontynuuj pętlę
      }
    }
  }
  return null;
}

export async function saveRecipe({
  recipeData,
  images,
  oldSlug,
  oldCategory,
}: SaveRecipeParams) {
  const { slug: newSlug, category: newCategoryName } = recipeData;
  const isEditing = !!oldSlug;

  const slugifyOptions = { lower: true, strict: true, locale: "pl" };
  const newCategorySlug = slugify(newCategoryName, slugifyOptions);

  const oldCategorySlug =
    isEditing && oldCategory ? slugify(oldCategory, slugifyOptions) : null;

  const oldImagesDir =
    isEditing && oldCategorySlug
      ? path.join(RECIPES_PUBLIC_PATH, oldCategorySlug, oldSlug)
      : null;
  const newImagesDir = path.join(RECIPES_PUBLIC_PATH, newCategorySlug, newSlug);
  const newRecipePath = path.join(
    RECIPES_CONTENT_PATH,
    newCategorySlug,
    `${newSlug}.md`,
  );

  const pathChanged =
    isEditing && (oldSlug !== newSlug || oldCategorySlug !== newCategorySlug);

  if (pathChanged && oldImagesDir) {
    try {
      await fs.access(oldImagesDir);
      await fs.mkdir(path.dirname(newImagesDir), { recursive: true });
      await fs.rename(oldImagesDir, newImagesDir);
    } catch {
      await fs.mkdir(newImagesDir, { recursive: true });
    }
  } else {
    await fs.mkdir(newImagesDir, { recursive: true });
  }

  const imagePathMap = new Map<string, string>();
  for (const image of images) {
    const originalFilename = image.name;
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const baseName = path.parse(originalFilename).name;
    const webpFileName = `${baseName}.webp`;
    const webpPath = path.join(newImagesDir, webpFileName);

    await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpPath);

    const publicSrc = `/images/recipes/${newCategorySlug}/${newSlug}/${webpFileName}`;
    imagePathMap.set(originalFilename, publicSrc);
  }

  // Użycie destrukturyzacji do usunięcia pól, których nie chcemy w finalnym obiekcie.
  // Jest to czystsze niż używanie `delete` z `as any`.
  const { ...data } = recipeData;

  // Tworzenie finalnego obiektu, który będzie zgodny z typem `Recipe`
  const finalData: Omit<Recipe, "date"> = {
    ...data,
    category: newCategorySlug, // Ustawiamy "slug" kategorii
    // Konwertujemy wartości odżywcze na liczby, upewniając się, że nie są puste
    protein: Number(data.protein),
    calories: Number(data.calories),
    carbs: Number(data.carbs),
    fiber: Number(data.fiber),
    fat: Number(data.fat),
    // Mapujemy główny obrazek i obrazki w krokach na nowe ścieżki URL
    image: data.image ? (imagePathMap.get(data.image) ?? data.image) : null,
    steps: data.steps.map((step) => ({
      // TypeScript sam wywnioskuje typ `step` jako `FormStep`
      ...step,
      image: step.image ? (imagePathMap.get(step.image) ?? step.image) : null,
    })),
  };

  const fullData: Recipe = {
    ...finalData,
    date: new Date().toISOString(),
  };

  const yamlString = yaml.dump(fullData, { skipInvalid: true });
  const markdownContent = `---\n${yamlString}---`;
  await fs.mkdir(path.dirname(newRecipePath), { recursive: true });
  await fs.writeFile(newRecipePath, markdownContent, "utf-8");

  if (pathChanged && oldCategorySlug) {
    const oldRecipePath = path.join(
      RECIPES_CONTENT_PATH,
      oldCategorySlug,
      `${oldSlug!}.md`,
    );
    if (oldRecipePath !== newRecipePath) {
      try {
        await fs.unlink(oldRecipePath);
      } catch {
        // Ignorujemy błąd, jeśli stary plik nie istnieje
      }
    }
  }

  return { newSlug, newCategorySlug };
}
