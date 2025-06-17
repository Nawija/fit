// /types/recipe.ts
export interface Step {
  id: string;
  title: string;
  description: string[];
  image: File | string | null;
  imagePreview?: string;
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
  image: File | string | null;
  imagePreview?: string; // Podgląd
  description: string;
  ingredients: { id: string; value: string }[];
  steps: Step[];
}
