"use client";

import RecipeForm from "@/components/admin/RecipeForm";
import { Recipe, RecipeFormState } from "@/types/recipe";
import { useEffect, useState } from "react";

// Ten komponent przyjmuje `slug` jako prop, a nie z `params`
type EditRecipeViewProps = {
  slug: string;
};

// Funkcja nie jest już `async`!
export default function EditRecipeView({ slug }: EditRecipeViewProps) {
  const [initialData, setInitialData] = useState<RecipeFormState | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ta funkcja jest wywoływana po stronie klienta
    const fetchRecipe = async () => {
      // Jeśli slug nie jest dostępny, nie wykonuj zapytania
      if (!slug) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/recipes/${slug}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Nie udało się pobrać danych przepisu.",
          );
        }
        const data: Recipe = await res.json();

        // Transformacja danych pozostaje bez zmian
        const transformedData: RecipeFormState = {
          ...data,
          originalSlug: data.slug,
          originalCategory: data.category,
          image: null,
          existingImageUrl: data.image || undefined,
          ingredients: data.ingredients.map((value) => ({
            id: crypto.randomUUID(),
            value,
          })),
          steps: data.steps.map((step) => ({
            id: crypto.randomUUID(),
            title: step.title,
            description: Array.isArray(step.description)
              ? step.description.join("\n")
              : step.description,
            image: null,
            existingImageUrl:
              typeof step.image === "string" ? step.image : undefined,
          })),
        };
        setInitialData(transformedData);
      } catch (error) {
        console.error("Błąd podczas pobierania przepisu:", error);
        setInitialData(undefined); // Wyczyść dane w razie błędu
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [slug]); // Używamy `slug` z propsów jako zależności

  // Funkcja handleUpdate pozostaje bez zmian
  const handleUpdate = async (formData: FormData) => {
    try {
      const res = await fetch(`/api/recipes/${slug}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const errorResult = await res.json();
        return {
          success: false,
          message: errorResult.message || "Wystąpił nieznany błąd serwera.",
        };
      }

      const successResult = await res.json();
      return {
        success: true,
        ...successResult,
      };
    } catch (e) {
      console.error("Błąd podczas wysyłania formularza:", e);
      let errorMessage = "Nie udało się połączyć z serwerem.";
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  // Logika renderowania pozostaje bez zmian
  if (loading) return <div className="p-8 text-center">Ładowanie...</div>;
  if (!initialData)
    return (
      <div className="p-8 text-center">
        Nie znaleziono przepisu lub wystąpił błąd.
      </div>
    );

  return (
    <RecipeForm mode="edit" initialData={initialData} onSave={handleUpdate} />
  );
}
