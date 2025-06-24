// /app/adm/przepisy/edytuj/[slug]/page.tsx
"use client";

import RecipeForm from "@/components/admin/RecipeForm"; // Zakładając, że to jest ścieżka
import { Recipe, RecipeFormState } from "@/types/recipe";
import { useEffect, useState } from "react";

export default function EditRecipePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const [initialData, setInitialData] = useState<RecipeFormState | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funkcja fetchRecipe pozostaje bez zmian...
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/recipes/${slug}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Nie udało się pobrać danych przepisu.",
          );
        }
        const data: Recipe = await res.json();

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
              : step.description, // Zabezpieczenie
            image: null,
            existingImageUrl:
              typeof step.image === "string" ? step.image : undefined,
          })),
        };
        setInitialData(transformedData);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [slug]);

  // === TUTAJ JEST KLUCZOWA ZMIANA ===
  // Ta funkcja jest teraz bardzo prosta. Przyjmuje FormData i wysyła je dalej.
  // Nazwa `handleUpdate` jest bardziej adekwatna niż `onSave`.
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
    } catch (error) {
      console.error("Błąd podczas wysyłania formularza:", error);
      let errorMessage = "Nie udało się połączyć z serwerem.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  if (loading) return <div className="p-8 text-center">Ładowanie...</div>;
  if (error)
    return <div className="p-8 text-center text-red-600">Błąd: {error}</div>;
  if (!initialData)
    return <div className="p-8 text-center">Nie znaleziono przepisu.</div>;

  return (
    // Teraz typy się zgadzają! onSave oczekuje funkcji, która przyjmuje FormData.
    // Dokładnie tym jest handleUpdate. Błąd TypeScript zniknie.
    <RecipeForm mode="edit" initialData={initialData} onSave={handleUpdate} />
  );
}
