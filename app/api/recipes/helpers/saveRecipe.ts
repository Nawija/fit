// /app/api/recipes/helpers/saveRecipe.ts

import { Recipe } from "@/types/recipe";
import fs from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import sharp from "sharp";
import slugify from "slugify";

const RECIPES_CONTENT_PATH = path.join(process.cwd(), "content/recipes");
const RECIPES_PUBLIC_PATH = path.join(process.cwd(), "public/images/recipes");

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
      } catch {}
    }
  }
  return null;
}

interface SaveRecipeParams {
  recipeData: any;
  images: File[];
  oldSlug?: string;
  oldCategory?: string;
}

export async function saveRecipe({
  recipeData,
  images,
  oldSlug,
  oldCategory,
}: SaveRecipeParams) {
  const { slug: newSlug, category: newCategoryName } = recipeData;
  const isEditing = !!oldSlug;

  // Ta opcja tworzy "slug" z nazwy kategorii: małe litery, myślniki zamiast spacji i brak polskich znaków.
  // Jest idealna do tego, co chcesz osiągnąć.
  const slugifyOptions = { lower: true, strict: true, locale: "pl" };
  const newCategorySlug = slugify(newCategoryName, slugifyOptions);

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

  // KLUCZOWA ZMIANA JEST TUTAJ
  // W obiekcie, który zostanie zapisany do pliku, podmieniamy `newCategoryName`
  // na `newCategorySlug`, który ma już odpowiedni format (bez polskich znaków, z myślnikami).
  const finalData: Omit<Recipe, "date"> = {
    ...recipeData,
    // BYŁO: category: newCategoryName,
    category: newCategorySlug, // JEST: Używamy przetworzonej nazwy kategorii
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

  const yamlString = yaml.dump(fullData, { skipInvalid: true });
  const markdownContent = `---\n${yamlString}---`;
  await fs.mkdir(path.dirname(newRecipePath), { recursive: true });
  await fs.writeFile(newRecipePath, markdownContent, "utf-8");

  if (pathChanged) {
    const oldRecipePath = path.join(
      RECIPES_CONTENT_PATH,
      oldCategorySlug!,
      `${oldSlug!}.md`,
    );
    if (oldRecipePath !== newRecipePath) {
      try {
        await fs.unlink(oldRecipePath);
      } catch {}
    }
  }

  return { newSlug, newCategorySlug };
}
