"use client";

import { CATEGORIES } from "@/constants";
import { RecipeFormData, Step } from "@/types/recipe";
import { AnimatePresence, motion } from "framer-motion";
import {
  ImageUp,
  LoaderCircle,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import slugify from "slugify";

// --- Style (takie same jak w AddRecipePage) ---
const inputClasses = "w-full rounded-md border-zinc-300 bg-white/50 text-zinc-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-indigo-600 dark:focus:ring-indigo-600";
const cardClasses = "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800/50";
const cardHeaderClasses = "mb-4 border-b border-zinc-200 pb-3 text-lg font-semibold text-zinc-800 dark:border-zinc-700 dark:text-zinc-200";
const buttonClasses = {
  primary: "inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900",
  secondary: "inline-flex items-center justify-center gap-2 rounded-md bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 dark:focus:ring-zinc-500 dark:focus:ring-offset-zinc-900",
  danger: "rounded-full p-2 text-zinc-500 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-500",
};

export default function EditRecipePage() {
  const router = useRouter();
  const { slug: currentSlug } = useParams<{ slug: string }>();

  const [recipe, setRecipe] = useState<RecipeFormData | null>(null);
  const [oldCategory, setOldCategory] = useState(""); // Do śledzenia oryginalnej kategorii
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Pobieranie danych przepisu ---
  useEffect(() => {
    if (!currentSlug) return;
    setIsLoading(true);
    fetch(`/api/recipes/${currentSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Nie udało się pobrać przepisu");
        return res.json();
      })
      .then((data) => {
        // Transformacja danych z pliku .md do stanu formularza
        const formData: RecipeFormData = {
          ...data,
          // Zapewniamy unikalne ID dla dynamicznych list
          ingredients: data.ingredients.map((value: string) => ({
            id: crypto.randomUUID(),
            value,
          })),
          steps: data.steps.map((step: any) => ({
            ...step,
            id: crypto.randomUUID(),
            description: [step.description.join("\n")],
            imagePreview: step.image, // Używamy istniejącej ścieżki jako podglądu
          })),
          imagePreview: data.image, // Używamy istniejącej ścieżki jako podglądu
        };
        setRecipe(formData);
        setOldCategory(data.category); // Zapisujemy oryginalną kategorię
      })
      .catch((err) => {
        console.error(err);
        alert("Błąd ładowania przepisu.");
        router.push("/adm/przepisy");
      })
      .finally(() => setIsLoading(false));
  }, [currentSlug, router]);

  // --- Automatyczne generowanie sluga (tak jak w AddRecipePage) ---
  useEffect(() => {
    if (recipe && recipe.title) {
      const newSlug = slugify(recipe.title, { lower: true, strict: true, locale: "pl" });
      setRecipe((prev) => (prev ? { ...prev, slug: newSlug } : null));
    }
  }, [recipe?.title]);
  
  // --- Wszystkie handlery (takie same jak w AddRecipePage) ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRecipe((prev) => (prev ? { ...prev, [name]: value } : null));
  };
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setRecipe((prev) => (prev ? { ...prev, [name]: checked } : null));
  };
  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setRecipe((prev) => prev ? { ...prev, image: file, imagePreview: URL.createObjectURL(file) } : null);
    }
  };
  const removeHeroImage = () => {
    setRecipe((prev) => prev ? { ...prev, image: null, imagePreview: undefined } : null);
  };
  const addIngredient = () => {
    setRecipe((prev) => prev ? { ...prev, ingredients: [...prev.ingredients, { id: crypto.randomUUID(), value: "" }] } : null);
  };
  const removeIngredient = (id: string) => {
    setRecipe((prev) => prev ? { ...prev, ingredients: prev.ingredients.filter((ing) => ing.id !== id) } : null);
  };
  const updateIngredient = (id: string, value: string) => {
    setRecipe((prev) => prev ? { ...prev, ingredients: prev.ingredients.map((ing) => (ing.id === id ? { ...ing, value } : ing)) } : null);
  };
  const addStep = () => {
    setRecipe((prev) => prev ? { ...prev, steps: [...prev.steps, { id: crypto.randomUUID(), title: "", description: [""], image: null }] } : null);
  };
  const removeStep = (id: string) => {
    setRecipe((prev) => prev ? { ...prev, steps: prev.steps.filter((step) => step.id !== id) } : null);
  };
  const updateStep = <K extends keyof Step>(id: string, field: K, value: Step[K]) => {
    setRecipe((prev) => prev ? { ...prev, steps: prev.steps.map((step) => (step.id === id ? { ...step, [field]: value } : step)) } : null);
  };
  const handleStepImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const imagePreview = URL.createObjectURL(file);
      setRecipe((prev) => prev ? { ...prev, steps: prev.steps.map((step) => (step.id === id ? { ...step, image: file, imagePreview } : step)) } : null);
    }
  };

  // --- Logika zapisu zmian ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe || !recipe.category || !recipe.title) {
      alert("Tytuł i kategoria są wymagane.");
      return;
    }
    setIsSaving(true);

    const formData = new FormData();
    const imagesToUpload: { file: File; name: string }[] = [];

    // Sprawdzamy, które obrazy są nowymi plikami (File), a które starymi (string)
    if (recipe.image instanceof File) {
        const heroImageName = `hero_${recipe.slug}_${recipe.image.name}`;
        imagesToUpload.push({ file: recipe.image, name: heroImageName });
    }
    recipe.steps.forEach((step, index) => {
      if (step.image instanceof File) {
        const stepImageName = `step_${index}_${recipe.slug}_${step.image.name}`;
        imagesToUpload.push({ file: step.image, name: stepImageName });
      }
    });

    imagesToUpload.forEach(img => formData.append("images", img.file, img.name));

    const dataToSend = {
      ...recipe,
      image: recipe.image ? (recipe.image instanceof File ? `/fake/path/${`hero_${recipe.slug}_${recipe.image.name}`}` : recipe.image) : null,
      steps: recipe.steps.map((step, index) => ({
        ...step,
        image: step.image ? (step.image instanceof File ? `/fake/path/${`step_${index}_${recipe.slug}_${step.image.name}`}` : step.image) : null,
      })),
    };
    
    formData.append("data", JSON.stringify(dataToSend));
    formData.append("oldCategory", oldCategory); // Wysyłamy starą kategorię do API

    const res = await fetch(`/api/recipes/${currentSlug}`, {
      method: "PUT",
      body: formData,
    });

    if (res.ok) {
      alert("Zapisano zmiany!");
      router.push("/adm/przepisy");
    } else {
      const error = await res.json();
      alert(`Błąd zapisu: ${error.message}`);
    }

    setIsSaving(false);
  };
  
  if (isLoading || !recipe) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <LoaderCircle className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  // --- JSX (identyczny jak w AddRecipePage) ---
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <form onSubmit={handleSave}>
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/70 px-4 py-3 backdrop-blur-lg sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Edytujesz: {recipe.title || "..."}
            </h1>
            <button type="submit" disabled={isSaving} className={buttonClasses.primary}>
              {isSaving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              <span>{isSaving ? "Zapisywanie..." : "Zapisz zmiany"}</span>
            </button>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 p-4 sm:p-6 lg:grid-cols-3 lg:p-8">
          <div className="space-y-8 lg:col-span-2">
            {/* Podstawowe informacje */}
            <section className={cardClasses}><div className="p-5">
                <h2 className={cardHeaderClasses}>Podstawowe informacje</h2>
                <div className="space-y-4">
                  <input type="text" name="title" placeholder="Tytuł przepisu" value={recipe.title} onChange={handleInputChange} className={`${inputClasses} text-lg font-medium`} required />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400"><span className="font-semibold">Slug:</span> {recipe.slug}</p>
                  <textarea name="description" value={recipe.description} onChange={handleInputChange} placeholder="Krótki, apetyczny opis przepisu..." className={inputClasses} rows={3} />
                </div>
            </div></section>

            {/* Składniki */}
            <section className={cardClasses}><div className="p-5">
              <h2 className={cardHeaderClasses}>Składniki</h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {recipe.ingredients.map((ing, index) => (
                    <motion.div key={ing.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
                      <span className="font-mono text-sm text-zinc-500">{index + 1}.</span>
                      <input type="text" placeholder="np. 200g mąki pszennej" value={ing.value} onChange={(e) => updateIngredient(ing.id, e.target.value)} className={inputClasses}/>
                      <button type="button" onClick={() => removeIngredient(ing.id)} className={buttonClasses.danger}><Trash2 size={18} /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <button type="button" onClick={addIngredient} className={`mt-4 ${buttonClasses.secondary}`}><Plus size={18} /> Dodaj składnik</button>
            </div></section>

            {/* Kroki */}
            <section className={cardClasses}><div className="p-5">
              <h2 className={cardHeaderClasses}>Kroki przygotowania</h2>
              <div className="space-y-6">
                  <AnimatePresence>
                    {recipe.steps.map((step, index) => (
                      <motion.div key={step.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/20">
                        <h3 className="mb-3 text-base font-semibold text-zinc-700 dark:text-zinc-300">Krok {index + 1}</h3>
                        {recipe.steps.length > 1 && (
                          <button type="button" onClick={() => removeStep(step.id)} className={`absolute -top-3 -right-3 ${buttonClasses.danger} bg-white dark:bg-zinc-700`}><Trash2 size={16} /></button>
                        )}
                        <div className="space-y-3">
                          <input type="text" placeholder="Tytuł kroku (opcjonalny)" value={step.title} onChange={(e) => updateStep(step.id, "title", e.target.value)} className={inputClasses} />
                          <textarea placeholder="Opis kroku... Każda nowa linia będzie osobnym punktem." value={step.description} onChange={(e) => updateStep(step.id, "description", [e.target.value])} className={inputClasses} rows={4} />
                          <div className="flex items-center gap-4">
                            <label htmlFor={`step-image-${step.id}`} className={`${buttonClasses.secondary} cursor-pointer`}>
                                <ImageUp size={16} />
                                <span>{step.image ? "Zmień zdjęcie" : "Dodaj zdjęcie"}</span>
                            </label>
                            <input type="file" id={`step-image-${step.id}`} accept="image/*" onChange={(e) => handleStepImageChange(step.id, e)} className="hidden"/>
                            {step.imagePreview && <img src={step.imagePreview} alt="Podgląd" className="h-16 w-16 rounded-md border object-cover" />}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
              </div>
              <button type="button" onClick={addStep} className={`mt-6 ${buttonClasses.secondary}`}><Plus size={18} /> Dodaj krok</button>
            </div></section>
          </div>

          {/* Prawa kolumna */}
          <aside className="lg:col-span-1"><div className="sticky top-24 space-y-8">
              {/* Status */}
              <section className={cardClasses}><div className="p-5">
                <h2 className={cardHeaderClasses}>Status</h2>
                <div className="space-y-4">
                  <select name="category" value={recipe.category} onChange={handleInputChange} className={inputClasses} required>
                    <option value="">Wybierz kategorię...</option>
                    {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                  <select name="level" value={recipe.level} onChange={handleInputChange} className={inputClasses}>
                    <option value="Łatwy">Łatwy</option><option value="Średni">Średni</option><option value="Trudny">Trudny</option>
                  </select>
                  <div className="flex items-center gap-3 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700/50">
                    <input type="checkbox" name="recomended" id="recomended" checked={recipe.recomended} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"/>
                    <label htmlFor="recomended" className="flex cursor-pointer items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">Polecany przepis <Sparkles className="h-4 w-4 text-amber-500" /></label>
                  </div>
                </div>
              </div></section>

              {/* Zdjęcie główne */}
              <section className={cardClasses}><div className="p-5">
                <h2 className={cardHeaderClasses}>Zdjęcie główne</h2>
                <div className="mt-2">
                  <label htmlFor="hero-image-upload" className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center transition hover:border-indigo-400 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800/50 dark:hover:border-indigo-500 dark:hover:bg-zinc-700/50">
                    {recipe.imagePreview ? (
                      <>
                        <img src={recipe.imagePreview} alt="Podgląd zdjęcia głównego" className="h-40 w-full rounded-md object-cover"/>
                        <button type="button" onClick={(e) => { e.preventDefault(); removeHeroImage(); }} className={`${buttonClasses.danger} absolute -top-2 -right-2 bg-white dark:bg-zinc-700`}><X size={16} /></button>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <ImageUp className="mx-auto h-12 w-12 text-zinc-400" />
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">Kliknij, aby przesłać</span>
                        <p className="text-xs text-zinc-500">PNG, JPG, WEBP</p>
                      </div>
                    )}
                  </label>
                  <input type="file" id="hero-image-upload" accept="image/*" onChange={handleHeroImageChange} className="hidden" />
                </div>
              </div></section>
              
              {/* Makroskładniki */}
              <section className={cardClasses}><div className="p-5">
                <h2 className={cardHeaderClasses}>Dane</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="time" value={recipe.time} onChange={handleInputChange} placeholder="Czas (np. 30m)" className={inputClasses} />
                  <input type="number" name="calories" value={recipe.calories} onChange={handleInputChange} placeholder="Kalorie" className={inputClasses} />
                  <input type="number" name="protein" value={recipe.protein} onChange={handleInputChange} placeholder="Białko (g)" className={inputClasses} />
                  <input type="number" name="fat" value={recipe.fat} onChange={handleInputChange} placeholder="Tłuszcz (g)" className={inputClasses} />
                  <input type="number" name="carbs" value={recipe.carbs} onChange={handleInputChange} placeholder="Węgle (g)" className={inputClasses} />
                  <input type="number" name="fiber" value={recipe.fiber} onChange={handleInputChange} placeholder="Błonnik (g)" className={inputClasses}/>
                </div>
              </div></section>
          </div></aside>
        </main>
      </form>
    </div>
  );
}