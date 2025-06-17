import fs from "fs";
import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const RECIPES_IMAGES_PATH = path.join(
  process.cwd(),
  "public",
  "images",
  "recipes",
);
const CONTENT_RECIPES_PATH = path.join(process.cwd(), "content", "recipes");

export async function DELETE(req: NextRequest) {
  try {
    const { imageName, category, slug } = await req.json();

    if (!imageName || !category || !slug) {
      return NextResponse.json(
        { error: "Brak nazwy pliku, kategorii lub slug" },
        { status: 400 },
      );
    }

    const filePath = path.join(RECIPES_IMAGES_PATH, category, slug, imageName);
    console.log("Plik zdjęcia:", filePath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Plik zdjęcia nie istnieje" },
        { status: 404 },
      );
    }

    fs.unlinkSync(filePath);

    const mdPath = path.join(CONTENT_RECIPES_PATH, category, `${slug}.md`);
    console.log("Plik markdown:", mdPath);

    if (!fs.existsSync(mdPath)) {
      return NextResponse.json(
        { error: "Plik markdown nie istnieje" },
        { status: 404 },
      );
    }

    const mdFile = fs.readFileSync(mdPath, "utf-8");
    const parsed = matter(mdFile);

    // Tu zmieniamy let na const bo nie reasignujesz
    const { data, content } = parsed;

    const imagePath = `/images/recipes/${category}/${slug}/${imageName}`;

    if (data.image === imagePath) {
      data.image = null;
    }

    if (Array.isArray(data.images)) {
      // Typ img jako { src: string }
      data.images = data.images.filter(
        (img: { src: string }) => img.src !== imagePath,
      );
    }

    const newMarkdown = matter.stringify(content, data);

    fs.writeFileSync(mdPath, newMarkdown, "utf-8");

    return NextResponse.json({
      message: "Zdjęcie usunięte i wpis w markdown zaktualizowany",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "Błąd podczas usuwania zdjęcia i aktualizacji markdown:",
        error.message,
      );
    } else {
      console.error(
        "Błąd podczas usuwania zdjęcia i aktualizacji markdown:",
        error,
      );
    }
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 },
    );
  }
}
