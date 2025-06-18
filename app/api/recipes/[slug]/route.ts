// /app/api/recipes/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { findRecipePath } from "../helpers/saveRecipe"; // Załóżmy, że ta funkcja jest dostępna
import fs from "fs/promises";
import matter from "gray-matter";
import { Recipe } from "@/types/recipe";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  try {
    const recipeInfo = await findRecipePath(slug);

    if (!recipeInfo) {
      return NextResponse.json(
        { message: `Przepis o slugu "${slug}" nie został znaleziony.` },
        { status: 404 }
      );
    }

    const fileContent = await fs.readFile(recipeInfo.filePath, "utf-8");
    const { data, content } = matter(fileContent);

    // Zakładając, że `content` to opis kroków w markdown, który musisz przetworzyć
    // Poniżej uproszczony przykład - dostosuj do swojej struktury
    const recipeData: Recipe = {
      ...(data as Omit<Recipe, "slug">), // Rzutujemy dane z frontmatter
      slug: slug,
      // description: content, // Jeśli używasz `content`
    };

    return NextResponse.json(recipeData);

  } catch (error) {
    console.error(`Błąd podczas pobierania przepisu ${slug}:`, error);
    return NextResponse.json(
      { message: "Wewnętrzny błąd serwera podczas pobierania przepisu." },
      { status: 500 }
    );
  }
}

// ... Twoja funkcja PUT pozostaje bez zmian ...