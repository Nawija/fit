// /types/recipe.ts

export interface Ingredient {
  id: string;
  value: string;
}

export interface Step {
  id: string;
  title: string;
  description: string; 
  image: File | string | null; 
  imagePreview?: string; 
  existingImageUrl?: string; 
}

export interface RecipeFormState {
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
  imagePreview?: string;
  existingImageUrl?: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  originalSlug?: string;
  originalCategory?: string;
}

export interface Recipe {
  title: string;
  level: "Łatwy" | "Średni" | "Trudny";
  slug: string;
  recomended: boolean;
  category: string;
  date: string; 
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  fiber: string;
  time: string;
  image: string | null; 
  description: string;
  ingredients: string[]; 
  steps: {
    title: string;
    description: string[]; 
    image: string | null;
  }[];
}