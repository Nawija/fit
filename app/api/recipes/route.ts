// /app/api/recipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveRecipe } from "./helpers/saveRecipe";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const dataString = formData.get("data") as string;
    if (!dataString) {
      return NextResponse.json(
        { message: "Brak danych przepisu." },
        { status: 400 },
      );
    }

    const recipeData = JSON.parse(dataString);

    // ZMIANA: Przechwytujemy zwrócone slugi
    const { newSlug, newCategorySlug } = await saveRecipe({
      recipeData,
      images: formData.getAll("images") as File[],
    });

    // ZMIANA: Zwracamy slugi w odpowiedzi
    return NextResponse.json({
      success: true,
      message: "Przepis został pomyślnie zapisany.",
      slug: newSlug,
      categorySlug: newCategorySlug,
    });
  } catch (error) {
    console.error("Błąd podczas tworzenia przepisu:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Wewnętrzny błąd serwera";
    return NextResponse.json(
      { message: "Wewnętrzny błąd serwera", error: errorMessage },
      { status: 500 },
    );
  }
}
