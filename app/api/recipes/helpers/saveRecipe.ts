// /app/api/recipes/helpers/saveRecipe.ts

import { Recipe } from "@/types/recipe";
import fs from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import sharp from "sharp";
import slugify from "slugify"; // ZMIANA: Importujemy slugify

const RECIPES_CONTENT_PATH = path.join(process.cwd(), "content/recipes");
const RECIPES_PUBLIC_PATH = path.join(process.cwd(), "public/images/recipes");

// ... funkcja findRecipePath pozostaje bez zmian ...
export async function findRecipePath(
  slug: string,
): Promise<{ filePath: string; category: string } | null> {
  const categoriesRaw = await fs.readdir(RECIPES_CONTENT_PATH);
  for (const categorySlug of categoriesRaw) {
    // To już są slugi, więc nazwa jest ok
    const categoryPath = path.join(RECIPES_CONTENT_PATH, categorySlug);
    const stats = await fs.stat(categoryPath);
    if (stats.isDirectory()) {
      const filePath = path.join(categoryPath, `${slug}.md`);
      try {
        await fs.access(filePath);
        // Wyszukaliśmy po slugach, ale dla spójności możemy chcieć zwrócić oryginalną nazwę
        // Na razie to jest ok, bo funkcja służy tylko do znalezienia pliku.
        return { filePath, category: categorySlug };
      } catch {
        /* Kontynuuj */
      }
    }
  }
  return null;
}

interface SaveRecipeParams {
  recipeData: any;
  images: File[];
  oldSlug?: string;
  oldCategory?: string; // To jest oryginalna nazwa, np. "Ciasta i torty"
}

export async function saveRecipe({
  recipeData,
  images,
  oldSlug,
  oldCategory,
}: SaveRecipeParams) {
  const { slug: newSlug, category: newCategoryName } = recipeData; // Np. "Ciasta i torty"
  const isEditing = !!oldSlug;

  // ZMIANA: Tworzymy slug z nazwy kategorii
  const slugifyOptions = { lower: true, strict: true, locale: "pl" };
  const newCategorySlug = slugify(newCategoryName, slugifyOptions);

  // --- 1. Obsługa ścieżek i folderów z użyciem SLUGÓW KATEGORII ---
  const oldCategorySlug =
    isEditing && oldCategory ? slugify(oldCategory, slugifyOptions) : null;

  const oldImagesDir = isEditing
    ? path.join(RECIPES_PUBLIC_PATH, oldCategorySlug!, oldSlug!)
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
    } catch (e) {
      await fs.mkdir(newImagesDir, { recursive: true });
    }
  } else {
    await fs.mkdir(newImagesDir, { recursive: true });
  }

  // --- 2. Zapis nowych obrazów i mapowanie ścieżek ---
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

    // ZMIANA: Używamy newCategorySlug do budowania publicznej ścieżki
    const publicSrc = `/images/recipes/${newCategorySlug}/${newSlug}/${webpFileName}`;
    imagePathMap.set(originalFilename, publicSrc);
  }

  // --- 3. Finalizacja danych do zapisu ---
  // WAŻNE: W danych zapisywanych do pliku .md nadal przechowujemy PEŁNĄ NAZWĘ kategorii
  // dla celów wyświetlania. Slug kategorii jest tylko dla struktury plików/URLi.
  const finalData: Omit<Recipe, "date"> = {
    ...recipeData,
    category: newCategoryName, // Zapisujemy oryginalną, czytelną nazwę
    image: recipeData.image
      ? (imagePathMap.get(recipeData.image) ?? recipeData.image)
      : null,
    steps: recipeData.steps.map((step: any) => ({
      ...step,
      image: step.image ? (imagePathMap.get(step.image) ?? step.image) : null,
    })),
  };

  delete (finalData as any).originalSlug;
  delete (finalData as any).originalCategory;

  const fullData: Recipe = {
    ...finalData,
    date: new Date().toISOString(),
  };

  // --- 4. Zapis do pliku .md ---
  const yamlString = yaml.dump(fullData, { skipInvalid: true });
  const markdownContent = `---\n${yamlString}---`;
  await fs.mkdir(path.dirname(newRecipePath), { recursive: true });
  await fs.writeFile(newRecipePath, markdownContent, "utf-8");

  // --- 5. Usunięcie starego pliku .md, jeśli ścieżka się zmieniła ---
  if (pathChanged) {
    const oldRecipePath = path.join(
      RECIPES_CONTENT_PATH,
      oldCategorySlug!,
      `${oldSlug!}.md`,
    );
    if (oldRecipePath !== newRecipePath) {
      try {
        await fs.unlink(oldRecipePath);
      } catch (e) {
        /* Ignoruj błąd */
      }
    }
  }

  // Zwracamy poprawne slugi, aby frontend mógł zbudować poprawny URL do przekierowania
  return { newSlug, newCategorySlug };
}
