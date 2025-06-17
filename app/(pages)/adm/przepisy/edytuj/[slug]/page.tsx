"use client";

import { CATEGORIES } from "@/constants";
import { Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ImageData {
  src: string;
}

export default function EditBlogPage() {
  const [autoSlug, setAutoSlug] = useState(true);
  const { slug } = useParams();
  const [slugValue, setSlugValue] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [heroIndex, setHeroIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/recipes/${slug}`);
        const data = await res.json();

        if (data.error) return alert(data.error);

        setTitle(data.title);
        setSlugValue(data.slug);
        setDate(data.date);

        setCategory(data.category);
        setParagraphs(data.paragraphs);
        const imgs = data.images.map((img: ImageData) => img.src);
        setExistingImages(imgs);
        setHeroIndex(imgs.findIndex((src: string) => src === data.image));
      } catch {
        alert("Błąd podczas ładowania danych");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleRemoveExistingImage = async (index: number) => {
    const imgSrc = existingImages[index];
    const imageName = imgSrc.split("/").pop();
    if (!imageName) return;

    if (!confirm("Czy na pewno chcesz usunąć to zdjęcie?")) return;

    try {
      const res = await fetch("/api/recipes/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageName, category, slug }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Błąd serwera");

      const updated = existingImages.filter((_, i) => i !== index);
      setExistingImages(updated);

      setHeroIndex((prev) =>
        prev === index ? null : prev && prev > index ? prev - 1 : prev,
      );

      alert("Zdjęcie usunięte");
    } catch {
      alert("Cos poszlo nie tak zapytaj Programistę :)");
    }
  };

  const formatCategory = (cat: string) =>
    cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("slug", slugValue);
    formData.append("date", date);
    formData.append("paragraphs", JSON.stringify(paragraphs));
    formData.append("heroIndex", heroIndex?.toString() ?? "");

    try {
      const res = await fetch(`/api/recipes/${slug}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Błąd zapisu");

      alert("Zapisano zmiany!");
      window.location.href = "/adm/blog";
    } catch {
      alert("Wystąpił błąd");
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-blue-500" />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Edytuj blog</h1>

      <input
        type="text"
        value={title}
        onChange={(e) => {
          const newTitle = e.target.value;
          setTitle(newTitle);
          if (autoSlug) {
            const generated = newTitle
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9\-]/g, "");
            setSlugValue(generated);
          }
        }}
        placeholder="Tytuł wpisu"
        className="mb-4 w-full rounded border p-3"
      />

      <input
        type="text"
        value={slugValue}
        className="mb-4 w-full rounded border p-3"
        onChange={(e) => {
          setSlugValue(e.target.value);
          setAutoSlug(false);
        }}
        disabled={autoSlug}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mb-4 w-full rounded border p-3"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mb-4 w-full rounded border p-3"
      >
        <option value="">
          {category ? `${formatCategory(category)}` : "Wybierz kategorię"}
        </option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <div className="space-y-4">
        {paragraphs.map((para, index) => (
          <div key={index} className="flex gap-2">
            <textarea
              value={para}
              onChange={(e) => {
                const updated = [...paragraphs];
                updated[index] = e.target.value;
                setParagraphs(updated);
              }}
              placeholder={`Paragraf ${index + 1}`}
              className="w-full rounded border p-2"
              rows={3}
            />
            <button
              onClick={() =>
                setParagraphs(paragraphs.filter((_, i) => i !== index))
              }
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setParagraphs([...paragraphs, ""])}
        className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
      >
        <Plus /> Dodaj tekst
      </button>

      {existingImages.length > 0 && (
        <div className="mt-6 mb-24">
          <label className="mb-1 block font-medium">
            Wybierz zdjęcie główne (hero):
          </label>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {existingImages.map((src, i) => (
              <div
                key={i}
                className={`relative rounded border p-2 transition ${
                  heroIndex === i
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setHeroIndex(i)}
                  className="w-full text-left"
                >
                  <p className="truncate">{src.split("/").pop()}</p>
                  <img
                    src={src}
                    alt="Istniejące zdjęcie"
                    className="mt-1 max-h-32 object-contain"
                  />
                </button>
                <button
                  onClick={() => handleRemoveExistingImage(i)}
                  className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                  title="Usuń zdjęcie"
                  type="button"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-8 rounded bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isSaving ? "Zapisuję..." : "Zapisz zmiany"}
      </button>
    </div>
  );
}
