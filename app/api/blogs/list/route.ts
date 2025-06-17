import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { NextResponse } from "next/server";

export async function GET() {
    const recipeDir = path.join(process.cwd(), "content/blogs");
    const categories = await fs.readdir(recipeDir);
    const allRecipes = [];

    for (const cat of categories) {
        const catPath = path.join(recipeDir, cat);
        const files = await fs.readdir(catPath);
        for (const file of files) {
            const filePath = path.join(catPath, file);
            const content = await fs.readFile(filePath, "utf-8");
            const { data } = matter(content);

            allRecipes.push({
                title: data.title,
                slug: data.slug,
                heroSrc: data.image,
                category: data.category,
                date: data.date,
            });
        }
    }

    return NextResponse.json(allRecipes);
}
