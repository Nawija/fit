// /app/adm/przepisy/edytuj/[slug]/page.tsx
"use client";

import RecipeForm from "@/components/admin/RecipeForm";
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
  useEffect(() => {
    // Upewniamy się, że slug na pewno istnieje, zanim wykonamy fetch
    if (!slug) {
      setLoading(false);
      setError("Brak identyfikatora przepisu w adresie URL.");
      return;
    }

    const fetchRecipe = async () => {
      try {
        // ZMIANA: Używamy stabilnej zmiennej `slug`
        const res = await fetch(`/api/recipes/${slug}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Nie udało się pobrać danych przepisu.",
          );
        }
        const data: Recipe = await res.json();

        // Transformacja danych z API na stan formularza
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
            description: step.description.join("\n"),
            image: null,
            existingImageUrl: step.image || undefined,
          })),
        };

        setInitialData(transformedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [slug]); // ZMIANA: Zależnością jest teraz stabilna zmienna `slug`

  const handleUpdate = async (formData: FormData) => {
    try {
      const res = await fetch(`/api/recipes/${slug}`, {
        method: "PUT",
        body: formData,
      });

      // Jeśli odpowiedź NIE jest pomyślna (np. status 400, 500)
      if (!res.ok) {
        // Spróbuj sparsować ciało błędu jako JSON, ponieważ nasz API route
        // powinien zwracać błędy w tym formacie.
        const errorResult = await res.json();
        return {
          success: false,
          message: errorResult.message || "Wystąpił nieznany błąd serwera.",
        };
      }

      // Jeśli odpowiedź JEST pomyślna (status 2xx)
      const successResult = await res.json();
      return {
        success: true,
        ...successResult, // Zawiera message, slug, categorySlug
      };
    } catch (error) {
      // Ten catch złapie błędy sieciowe lub błędy parsowania JSON,
      // jeśli serwer zwrócił coś zupełnie niepoprawnego (np. HTML).
      console.error("Błąd podczas wysyłania formularza:", error);
      let errorMessage = "Nie udało się połączyć z serwerem.";
      if (error instanceof Error && error.name !== "SyntaxError") {
        errorMessage = error.message;
      } else if (error instanceof Error && error.name === "SyntaxError") {
        errorMessage = "Otrzymano nieprawidłową odpowiedź z serwera.";
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center">Ładowanie danych formularza...</div>
    );
  if (error)
    return <div className="p-8 text-center text-red-600">Błąd: {error}</div>;
  if (!initialData)
    return <div className="p-8 text-center">Nie znaleziono przepisu.</div>;

  return (
    <RecipeForm mode="edit" initialData={initialData} onSave={handleUpdate} />
  );
}
