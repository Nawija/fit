
import { getAllSearchItems } from "@/lib/searchItems";
import { NextResponse } from "next/server";

export async function GET() {
  const recipes = await getAllSearchItems();
  return NextResponse.json(recipes);
}
