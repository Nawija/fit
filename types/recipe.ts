// /types/recipe.ts
export interface Step {
  id: string; // Unikalne ID dla klucza w React
  title: string;
  description: string[];
  image: File | null;
  imagePreview?: string; // Do podglądu w UI
}

export interface RecipeFormData {
  title: string;
  level: "Łatwy" | "Średni" | "Trudny";
  slug: string;
  recomended: boolean;
  category: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  fiber: string;
  time: string;
  image: File | null; // Główne zdjęcie
  imagePreview?: string; // Podgląd
  description: string;
  ingredients: { id: string; value: string }[];
  steps: Step[];
}
