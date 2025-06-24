// /app/api/recipes/[slug]/route.ts
import { Recipe } from "@/types/recipe";
import fs from "fs/promises";
import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import { findRecipePath, saveRecipe } from "../helpers/saveRecipe";

// Funkcja GET pozostaje bez zmian...
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug;
  try {
    const recipeInfo = await findRecipePath(slug);

    if (!recipeInfo) {
      return NextResponse.json(
        { message: `Przepis o slugu "${slug}" nie został znaleziony.` },
        { status: 404 },
      );
    }

    const fileContent = await fs.readFile(recipeInfo.filePath, "utf-8");
    const { data } = matter(fileContent);

    const recipeData: Recipe = {
      ...(data as Omit<Recipe, "slug" | "date">),
      date: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      slug: slug,
    };

    return NextResponse.json(recipeData);
  } catch (error) {
    console.error(`Błąd podczas pobierania przepisu ${slug}:`, error);
    return NextResponse.json(
      { message: "Wewnętrzny błąd serwera podczas pobierania przepisu." },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params: { slug } }: { params: { slug: string } },
) {
  try {
    const formData = await req.formData();

    // Twój RecipeForm nie wysyła już `data` jako osobnego pola,
    // ale Twoja funkcja `handleSave` w RecipeForm.tsx robi to!
    // formData.append("data", JSON.stringify(dataToSend)); - to jest kluczowe.
    const dataString = formData.get("data") as string;

    if (!dataString) {
      return NextResponse.json(
        { message: "Brak danych przepisu." },
        { status: 400 },
      );
    }

    const recipeData = JSON.parse(dataString);
    const images = formData.getAll("images") as File[];

    // Używamy `slug` z URL jako `oldSlug` i pobieramy `oldCategory` z danych,
    // które RecipeForm sprytnie zachował w stanie `initialData`.
    const { newSlug, newCategorySlug } = await saveRecipe({
      recipeData,
      images,
      oldSlug: slug, // Poprawne użycie parametru z URL
      oldCategory: recipeData.originalCategory, // Pobieramy z danych
    });

    return NextResponse.json(
      {
        message: "Przepis został pomyślnie zaktualizowany.",
        slug: newSlug,
        categorySlug: newCategorySlug,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Błąd podczas aktualizacji przepisu (PUT):", error);
    return NextResponse.json(
      {
        message: "Wystąpił błąd serwera podczas aktualizacji przepisu.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
