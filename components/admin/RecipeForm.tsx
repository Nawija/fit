// /components/admin/RecipeForm.tsx
"use client";

import { RecipeData } from "@/types/recipe";
import { useEffect, useState } from "react";
import slugify from "slugify"; // Będziesz potrzebować biblioteki: npm install slugify

import ImageUploader from "./ImageUploader";
import IngredientsManager from "./IngredientsManager";
import MetadataPanel from "./MetadataPanel";
import StepsManager from "./StepsManager";

const initialRecipeState: RecipeData = {
  title: "",
  level: "Łatwy",
  slug: "",
  recomended: false,
  category: "ciasteczka",
  date: new Date().toISOString(),
  calories: "",
  protein: "",
  fat: "",
  carbs: "",
  fiber: "",
  time: "",
  image: null,
  description: "",
  ingredients: [],
  steps: [],
};

export default function RecipeForm() {
  const [recipe, setRecipe] = useState<RecipeData>(initialRecipeState);
  const [isSaving, setIsSaving] = useState(false);

  // Automatyczne generowanie sluga z tytułu
  useEffect(() => {
    if (recipe.title) {
      const newSlug = slugify(recipe.title, { lower: true, strict: true });
      setRecipe((prev) => ({ ...prev, slug: newSlug }));
    }
  }, [recipe.title]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setRecipe((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/save-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        throw new Error("Błąd podczas zapisywania przepisu");
      }

      const result = await response.json();
      alert(`Przepis zapisany pomyślnie! Ścieżka: ${result.filePath}`);
      // Opcjonalnie: zresetuj formularz lub przekieruj
      // setRecipe(initialRecipeState);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // Tutaj będą funkcje do zarządzania składnikami, krokami itp.
  // ...

  return (
    <div className="flex gap-8 p-4 md:p-8">
      {/* Główna zawartość formularza */}
      <div className="flex-grow">
        <h1 className="mb-6 text-3xl font-bold">Dodaj nowy przepis</h1>

        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Tytuł
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={recipe.title}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Slug: {recipe.slug}</p>
        </div>

        {/* ... inne pola jak description ... */}

        <ImageUploader
          label="Zdjęcie główne (Hero)"
          onImageUpload={(path) =>
            setRecipe((prev) => ({ ...prev, image: path }))
          }
          onImageRemove={() => setRecipe((prev) => ({ ...prev, image: null }))}
        />

        <IngredientsManager
          ingredients={recipe.ingredients}
          setIngredients={(newIngredients) =>
            setRecipe((prev) => ({ ...prev, ingredients: newIngredients }))
          }
        />

        <StepsManager
          steps={recipe.steps}
          setSteps={(newSteps) =>
            setRecipe((prev) => ({ ...prev, steps: newSteps }))
          }
        />
      </div>

      {/* Panel Boczny */}
      <aside className="w-full max-w-sm">
        <MetadataPanel
          recipe={recipe}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </aside>
    </div>
  );
}
