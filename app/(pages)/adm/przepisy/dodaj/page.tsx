// /app/admin/add-recipe/page.tsx (lub gdziekolwiek znajduje się Twój plik)
"use client";

import { CATEGORIES } from "@/constants";
import { RecipeFormData, Step } from "@/types/recipe"; // Zaimportuj typy
import { AnimatePresence, motion } from "framer-motion";
import { ImageUp, Plus, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import slugify from "slugify";

const initialRecipeState: RecipeFormData = {
  title: "",
  level: "Łatwy",
  slug: "",
  recomended: false,
  category: "",
  calories: "",
  protein: "",
  fat: "",
  carbs: "",
  fiber: "",
  time: "",
  image: null,
  description: "",
  ingredients: [{ id: crypto.randomUUID(), value: "" }],
  steps: [
    { id: crypto.randomUUID(), title: "", description: [""], image: null },
  ],
};

export default function AddRecipePage() {
  const router = useRouter();
  const [recipe, setRecipe] = useState<RecipeFormData>(initialRecipeState);
  const [isSaving, setIsSaving] = useState(false);

  // Efekt do automatycznego generowania sluga
  useEffect(() => {
    if (recipe.title) {
      const newSlug = slugify(recipe.title, {
        lower: true,
        strict: true,
        locale: "pl",
      });
      setRecipe((prev) => ({ ...prev, slug: newSlug }));
    }
  }, [recipe.title]);

  // Efekt do czyszczenia URLi podglądu obrazków, aby uniknąć wycieków pamięci
  useEffect(() => {
    return () => {
      recipe.imagePreview && URL.revokeObjectURL(recipe.imagePreview);
      recipe.steps.forEach((step) => {
        step.imagePreview && URL.revokeObjectURL(step.imagePreview);
      });
    };
  }, [recipe]);

  // --- OGÓLNE HANDLERY ---
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

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setRecipe((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // --- HANDLERY SKŁADNIKÓW ---
  const addIngredient = () => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { id: crypto.randomUUID(), value: "" },
      ],
    }));
  };
  const removeIngredient = (id: string) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((ing) => ing.id !== id),
    }));
  };
  const updateIngredient = (id: string, value: string) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing) =>
        ing.id === id ? { ...ing, value } : ing,
      ),
    }));
  };

  // --- HANDLERY KROKÓW ---
  const addStep = () => {
    setRecipe((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { id: crypto.randomUUID(), title: "", description: [""], image: null },
      ],
    }));
  };
  const removeStep = (id: string) => {
    setRecipe((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== id),
    }));
  };
  const updateStep = (id: string, field: keyof Step, value: any) => {
    setRecipe((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === id ? { ...step, [field]: value } : step,
      ),
    }));
  };
  const handleStepImageChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const imagePreview = URL.createObjectURL(file);
      setRecipe((prev) => ({
        ...prev,
        steps: prev.steps.map((step) =>
          step.id === id ? { ...step, image: file, imagePreview } : step,
        ),
      }));
    }
  };

  // --- ZAPIS ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe.category || !recipe.title) {
      alert("Tytuł i kategoria są wymagane.");
      return;
    }
    setIsSaving(true);

    const formData = new FormData();

    // Dołącz pliki i zbuduj mapę ścieżek
    const imagePaths: { hero?: string; steps: Record<string, string> } = {
      steps: {},
    };
    if (recipe.image) {
      const heroImageName = `hero_${recipe.slug}_${recipe.image.name}`;
      formData.append("images", recipe.image, heroImageName);
      imagePaths.hero = `/images/recipes/${recipe.category}/${recipe.slug}/${heroImageName}`;
    }
    recipe.steps.forEach((step, index) => {
      if (step.image) {
        const stepImageName = `step_${index}_${recipe.slug}_${step.image.name}`;
        formData.append("images", step.image, stepImageName);
        imagePaths.steps[step.id] =
          `/images/recipes/${recipe.category}/${recipe.slug}/${stepImageName}`;
      }
    });

    // Przygotuj obiekt danych do wysłania jako JSON
    const dataToSend = {
      ...recipe,
      image: imagePaths.hero || null,
      steps: recipe.steps.map((step) => ({
        title: step.title,
        description: step.description[0]
          .split("\n")
          .filter((line) => line.trim() !== ""), // Z textarea do tablicy
        image: imagePaths.steps[step.id] || null,
      })),
      ingredients: recipe.ingredients
        .map((ing) => ing.value)
        .filter((val) => val.trim() !== ""), // Tylko wartości
    };

    formData.append("data", JSON.stringify(dataToSend));

    // Potrzebujesz tego w API, aby wiedzieć gdzie zapisać zdjęcia
    formData.append("slug", recipe.slug);
    formData.append("category", recipe.category);

    // Wysyłka do API
    const res = await fetch("/api/recipes", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Zapisano przepis!");
      setRecipe(initialRecipeState);
      router.push("/adm/przepisy"); // lub gdziekolwiek chcesz
    } else {
      const error = await res.json();
      alert(`Błąd zapisu: ${error.message}`);
    }

    setIsSaving(false);
  };

  return (
    <form
      onSubmit={handleSave}
      className="mx-auto max-w-5xl space-y-8 divide-y divide-gray-200 p-4 sm:p-6 lg:p-8"
    >
      {/* --- SEKCJA GŁÓWNA --- */}
      <div>
        <h1 className="mb-2 text-3xl font-bold">Dodaj nowy przepis</h1>
        <p className="mb-6 text-gray-500">
          Wypełnij poniższe pola, aby stworzyć plik `.md` z przepisem.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <input
            type="text"
            name="title"
            placeholder="Tytuł przepisu"
            value={recipe.title}
            onChange={handleInputChange}
            className="w-full rounded-md border p-3 md:col-span-2"
            required
          />
          <p className="-mt-4 text-sm text-gray-500 md:col-span-2">
            Slug: {recipe.slug}
          </p>

          <select
            name="category"
            value={recipe.category}
            onChange={handleInputChange}
            className="w-full rounded-md border p-3"
            required
          >
            <option value="">Wybierz kategorię...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            name="level"
            value={recipe.level}
            onChange={handleInputChange}
            className="w-full rounded-md border p-3"
          >
            <option value="Łatwy">Łatwy</option>
            <option value="Średni">Średni</option>
            <option value="Trudny">Trudny</option>
          </select>
        </div>
        <textarea
          name="description"
          value={recipe.description}
          onChange={handleInputChange}
          placeholder="Krótki opis przepisu (widoczny na kartach)"
          className="mt-6 w-full rounded-md border p-3"
          rows={3}
        />
      </div>

      {/* --- SEKCJA METADANYCH --- */}
      <div className="pt-8">
        <h2 className="mb-4 text-xl font-semibold">
          Metadane i Makroskładniki
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <input
            type="text"
            name="time"
            value={recipe.time}
            onChange={handleInputChange}
            placeholder="Czas (np. 30 minut)"
            className="rounded-md border p-2"
          />
          <input
            type="number"
            name="calories"
            value={recipe.calories}
            onChange={handleInputChange}
            placeholder="Kalorie"
            className="rounded-md border p-2"
          />
          <input
            type="number"
            name="protein"
            value={recipe.protein}
            onChange={handleInputChange}
            placeholder="Białko (g)"
            className="rounded-md border p-2"
          />
          <input
            type="number"
            name="fat"
            value={recipe.fat}
            onChange={handleInputChange}
            placeholder="Tłuszcz (g)"
            className="rounded-md border p-2"
          />
          <input
            type="number"
            name="carbs"
            value={recipe.carbs}
            onChange={handleInputChange}
            placeholder="Węgle (g)"
            className="rounded-md border p-2"
          />
          <input
            type="number"
            name="fiber"
            value={recipe.fiber}
            onChange={handleInputChange}
            placeholder="Błonnik (g)"
            className="rounded-md border p-2"
          />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            name="recomended"
            id="recomended"
            checked={recipe.recomended}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded"
          />
          <label htmlFor="recomended" className="font-medium">
            Polecany przepis{" "}
            <Sparkles className="inline-block h-4 w-4 text-yellow-500" />
          </label>
        </div>
      </div>

      {/* --- ZDJĘCIE GŁÓWNE --- */}
      <div className="pt-8">
        <h2 className="mb-4 text-xl font-semibold">Zdjęcie główne (Hero)</h2>
        <div className="flex items-center gap-4">
          <label
            htmlFor="hero-image-upload"
            className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white p-3 hover:bg-gray-50"
          >
            <ImageUp size={20} />{" "}
            <span>{recipe.image ? "Zmień zdjęcie" : "Wybierz zdjęcie"}</span>
          </label>
          <input
            type="file"
            id="hero-image-upload"
            accept="image/*"
            onChange={handleHeroImageChange}
            className="hidden"
          />
          {recipe.imagePreview && (
            <img
              src={recipe.imagePreview}
              alt="Podgląd"
              className="h-24 w-24 rounded-md border object-cover"
            />
          )}
        </div>
      </div>

      {/* --- SKŁADNIKI --- */}
      <div className="pt-8">
        <h2 className="mb-4 text-xl font-semibold">Składniki</h2>
        <div className="space-y-3">
          <AnimatePresence>
            {recipe.ingredients.map((ing, index) => (
              <motion.div
                key={ing.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Składnik ${index + 1}`}
                  value={ing.value}
                  onChange={(e) => updateIngredient(ing.id, e.target.value)}
                  className="w-full rounded-md border p-2"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(ing.id)}
                  className="rounded-full p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-4 flex items-center gap-2 font-medium text-blue-600 hover:text-blue-800"
        >
          <Plus size={18} />
          Dodaj składnik
        </button>
      </div>

      {/* --- KROKI --- */}
      <div className="pt-8">
        <h2 className="mb-4 text-xl font-semibold">Kroki przygotowania</h2>
        <div className="space-y-6">
          <AnimatePresence>
            {recipe.steps.map((step, index) => (
              <motion.div
                key={step.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative space-y-3 rounded-lg border bg-gray-50/50 p-4"
              >
                <button
                  type="button"
                  onClick={() => removeStep(step.id)}
                  className="absolute -top-3 -right-3 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
                <h3 className="font-semibold">Krok {index + 1}</h3>
                <input
                  type="text"
                  placeholder="Tytuł kroku (opcjonalny)"
                  value={step.title}
                  onChange={(e) => updateStep(step.id, "title", e.target.value)}
                  className="w-full rounded-md border p-2"
                />
                <textarea
                  placeholder="Opis kroku... Każda nowa linia będzie osobnym punktem w opisie."
                  value={step.description}
                  onChange={(e) =>
                    updateStep(step.id, "description", [e.target.value])
                  }
                  className="w-full rounded-md border p-2"
                  rows={4}
                />
                <div className="flex items-center gap-4">
                  <label
                    htmlFor={`step-image-${step.id}`}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white p-2 text-sm hover:bg-gray-50"
                  >
                    <ImageUp size={16} />{" "}
                    <span>
                      {step.image ? "Zmień zdjęcie" : "Dodaj zdjęcie do kroku"}
                    </span>
                  </label>
                  <input
                    type="file"
                    id={`step-image-${step.id}`}
                    accept="image/*"
                    onChange={(e) => handleStepImageChange(step.id, e)}
                    className="hidden"
                  />
                  {step.imagePreview && (
                    <img
                      src={step.imagePreview}
                      alt="Podgląd kroku"
                      className="h-20 w-20 rounded-md border object-cover"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-4 flex items-center gap-2 font-medium text-green-600 hover:text-green-800"
        >
          <Plus size={18} />
          Dodaj krok
        </button>
      </div>

      {/* --- ZAPIS --- */}
      <div className="flex justify-end pt-8">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-black px-8 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
        >
          {isSaving ? "Zapisywanie..." : "Zapisz przepis"}
        </button>
      </div>
    </form>
  );
}
