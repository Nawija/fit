import { RecipeFormData } from "@/types/recipe";
import fs from "fs/promises";
import matter from "gray-matter";
import yaml from "js-yaml";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";

const RECIPES_CONTENT_PATH = path.join(process.cwd(), "content/recipes");
const RECIPES_PUBLIC_PATH = path.join(process.cwd(), "public/images/recipes");

interface Step {
  title: string;
  description: string[];
  image: File | string | null;
}
// Typ danych, które zapisujemy w pliku .md
type FinalRecipeData = Omit<
  RecipeFormData,
  "image" | "steps" | "imagePreview" | "ingredients"
> & {
  date: string;
  image: File | string | null;
  ingredients: string[];
  steps: Step[];
};

async function findRecipePath(
  slug: string,
): Promise<{ filePath: string; category: string } | null> {
  try {
    const categories = await fs.readdir(RECIPES_CONTENT_PATH);
    for (const category of categories) {
      const categoryPath = path.join(RECIPES_CONTENT_PATH, category);
      const stats = await fs.stat(categoryPath);
      if (stats.isDirectory()) {
        const filePath = path.join(categoryPath, `${slug}.md`);
        try {
          await fs.access(filePath);
          return { filePath, category };
        } catch {
          // Plik nie istnieje w tej kategorii, kontynuuj
        }
      }
    }
  } catch (error) {
    console.error("Błąd podczas wyszukiwania przepisu:", error);
  }
  return null;
}

// --- POBIERANIE DANYCH DO FORMULARZA EDYCJI ---
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params;
  if (!slug) {
    return NextResponse.json({ message: "Brak sluga" }, { status: 400 });
  }

  const recipeInfo = await findRecipePath(slug);
  if (!recipeInfo) {
    return NextResponse.json(
      { message: "Nie znaleziono przepisu" },
      { status: 404 },
    );
  }

  try {
    const fileContent = await fs.readFile(recipeInfo.filePath, "utf-8");
    const { data } = matter(fileContent);

    // Zwracamy surowe dane z frontmatter, frontend je przetworzy
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Błąd odczytu pliku ${slug}.md:`, error);
    return NextResponse.json(
      { message: "Wewnętrzny błąd serwera" },
      { status: 500 },
    );
  }
}

// --- ZAPISYWANIE ZMIAN (EDYCJA) ---
export async function PUT(
  req: NextRequest,
  { params: { slug: oldSlug } }: { params: { slug: string } },
) {
  try {
    const formData = await req.formData();
    const dataString = formData.get("data") as string;
    if (!dataString) {
      return NextResponse.json(
        { message: "Brak danych przepisu." },
        { status: 400 },
      );
    }

    const recipeData: RecipeFormData = JSON.parse(dataString);
    const { slug: newSlug, category: newCategory } = recipeData;
    const oldCategory = formData.get("oldCategory") as string; // Pobieramy starą kategorię

    // --- 1. Obsługa zmiany ścieżek ---
    const oldRecipePath = path.join(
      RECIPES_CONTENT_PATH,
      oldCategory,
      `${oldSlug}.md`,
    );
    const newRecipePath = path.join(
      RECIPES_CONTENT_PATH,
      newCategory,
      `${newSlug}.md`,
    );
    const oldImagesDir = path.join(RECIPES_PUBLIC_PATH, oldCategory, oldSlug);
    const newImagesDir = path.join(RECIPES_PUBLIC_PATH, newCategory, newSlug);

    const slugChanged = oldSlug !== newSlug;
    const categoryChanged = oldCategory !== newCategory;
    const pathChanged = slugChanged || categoryChanged;

    if (pathChanged) {
      // Jeśli ścieżka się zmieniła, przenieś folder z obrazkami
      try {
        await fs.access(oldImagesDir);
        await fs.mkdir(path.dirname(newImagesDir), { recursive: true });
        await fs.rename(oldImagesDir, newImagesDir);
      } catch (e) {
        // Folder nie istniał, to OK, tworzymy nowy
        await fs.mkdir(newImagesDir, { recursive: true });
      }
    } else {
      await fs.mkdir(newImagesDir, { recursive: true });
    }

    // --- 2. Przetwarzanie i zapis nowych obrazów ---
    const images = formData.getAll("images") as File[];
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

      const publicSrc = `/images/recipes/${newCategory}/${newSlug}/${webpFileName}`;
      imagePathMap.set(originalFilename, publicSrc);
    }

    const finalData: FinalRecipeData = {
      ...recipeData,
      date: new Date().toISOString(),
      ingredients: recipeData.ingredients
        .map((ing) => ing.value)
        .filter(Boolean),
      image: recipeData.image
        ? (imagePathMap.get(path.basename(recipeData.image)) ??
          recipeData.image)
        : null,
      steps: recipeData.steps.map((step) => ({
        title: step.title,
        description: Array.isArray(step.description)
          ? step.description[0].split("\n").filter((line) => line.trim() !== "")
          : [],
        image: step.image
          ? (imagePathMap.get(path.basename(step.image)) ?? step.image)
          : null,
      })),
    };

    // --- 4. Zapis do pliku .md ---
    const yamlString = yaml.dump(finalData, { skipInvalid: true });
    const markdownContent = `---
${yamlString}---
`;
    await fs.mkdir(path.dirname(newRecipePath), { recursive: true });
    await fs.writeFile(newRecipePath, markdownContent, "utf-8");

    // Jeśli ścieżka się zmieniła, usuń stary plik .md
    if (pathChanged && oldRecipePath !== newRecipePath) {
      try {
        await fs.unlink(oldRecipePath);
      } catch (e) {
        console.warn(
          "Nie udało się usunąć starego pliku, możliwe, że już nie istniał:",
          oldRecipePath,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Przepis zaktualizowany.",
    });
  } catch (error) {
    console.error("Błąd zapisu przepisu:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Wewnętrzny błąd serwera";
    return NextResponse.json(
      { message: "Wewnętrzny błąd serwera", error: errorMessage },
      { status: 500 },
    );
  }
}
