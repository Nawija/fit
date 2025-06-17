import { RecipeFormData } from "@/types/recipe"; // Używamy naszych typów
import fs from "fs/promises";
import yaml from "js-yaml"; // Importujemy js-yaml
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";

// Typ dla danych po przetworzeniu, które zapiszemy w YAML
// Tutaj ścieżki do obrazów są już stringami
type FinalRecipeData = Omit<
  RecipeFormData,
  "image" | "steps" | "imagePreview" | "ingredients"
> & {
  date: string;
  image: string | null;
  ingredients: string[];
  steps: {
    title: string;
    description: string[];
    image: string | null;
  }[];
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // 1. Odbieramy nowe dane z formularza
    const dataString = formData.get("data") as string;
    if (!dataString) {
      return NextResponse.json(
        { message: "Brak danych przepisu." },
        { status: 400 },
      );
    }
    const recipeData: RecipeFormData = JSON.parse(dataString);
    console.log(
      "[DEBUG - ODCZYT] Struktura danych `recipeData` do wyszukiwania obrazków:",
    );
    console.log(JSON.stringify(recipeData, null, 2));

    const images = formData.getAll("images") as File[];
    const slug = formData.get("slug") as string;
    const category = formData.get("category") as string;

    if (!slug || !category) {
      return NextResponse.json(
        { message: "Brak sluga lub kategorii w danych formularza." },
        { status: 400 },
      );
    }

    // 2. Tworzymy foldery (logika bez zmian)
    const recipesDir = path.join(process.cwd(), "content/recipes", category);
    const imagesPublicDir = path.join(
      process.cwd(),
      "public/images/recipes",
      category,
      slug,
    );

    await fs.mkdir(recipesDir, { recursive: true });
    await fs.mkdir(imagesPublicDir, { recursive: true });

    // 3. Przetwarzamy obrazy i mapujemy je
    const imagePathMap = new Map<string, string>();

    for (const image of images) {
      // Frontend nadał unikalną nazwę plikowi (np. "hero_slug_nazwa.jpg"),
      // która posłuży nam jako klucz.
      const originalFilename = image.name;
      console.log(
        `[DEBUG - ZAPIS] Klucz dodawany do mapy: "${originalFilename}"`,
      );

      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const baseName = path.parse(originalFilename).name;
      const webpFileName = `${baseName}.webp`;
      const webpPath = path.join(imagesPublicDir, webpFileName);

      await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpPath);

      const publicSrc = `/images/recipes/${category}/${slug}/${webpFileName}`;
      imagePathMap.set(originalFilename, publicSrc);
    }

    // 4. Przygotowujemy finalny obiekt do serializacji
    // Zastępujemy obiekty File w recipeData finalnymi ścieżkami publicznymi

    const finalData: FinalRecipeData = {
      title: recipeData.title,
      level: recipeData.level,
      slug: recipeData.slug,
      recomended: recipeData.recomended,
      category: recipeData.category,
      date: new Date().toISOString(),
      calories: recipeData.calories,
      protein: recipeData.protein,
      fat: recipeData.fat,
      carbs: recipeData.carbs,
      fiber: recipeData.fiber,
      time: recipeData.time,
      description: recipeData.description,

      // POPRAWKA: Wyciągamy nazwę pliku (basename) ze ścieżki i używamy jej jako klucza.
      image:
        recipeData.image && typeof recipeData.image === "string"
          ? (imagePathMap.get(path.basename(recipeData.image)) ?? null)
          : null,

      ingredients: recipeData.ingredients
        .map((ing) => ing.value)
        .filter(Boolean),

      steps: recipeData.steps.map((step) => ({
        title: step.title,
        description: step.description[0]
          .split("\n")
          .filter((line) => line.trim() !== ""),
        // POPRAWKA: To samo dla obrazków w krokach.
        image:
          step.image && typeof step.image === "string"
            ? (imagePathMap.get(path.basename(step.image)) ?? null)
            : null,
      })),
    };

    // 5. Generujemy zawartość pliku .md przy użyciu js-yaml
    // Opcja `skipInvalid: true` zignoruje ewentualne wartości `undefined`
    const yamlString = yaml.dump(finalData, { skipInvalid: true });
    const markdownContent = `---
${yamlString}---
`;
    // W tej strukturze nie mamy treści po YAML, więc to wszystko.

    // 6. Zapisujemy plik .md
    const mdPath = path.join(recipesDir, `${slug}.md`);
    await fs.writeFile(mdPath, markdownContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: `Przepis zapisany w ${mdPath}`,
    });
  } catch (error) {
    console.error("Błąd zapisu przepisu:", error);
    // Zwracamy bardziej szczegółowy błąd, jeśli to możliwe
    const errorMessage =
      error instanceof Error ? error.message : "Wewnętrzny błąd serwera";
    return NextResponse.json(
      { message: "Wewnętrzny błąd serwera", error: errorMessage },
      { status: 500 },
    );
  }
}
