// /app/adm/przepisy/dodaj/page.tsx
"use client";

import RecipeForm from "@/components/admin/RecipeForm";

export default function AddRecipePage() {
  const handleSave = async (formData: FormData) => {
    const res = await fetch("/api/recipes", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    return {
      success: res.ok,
      message: result.message,
    };
  };

  return <RecipeForm mode="add" onSave={handleSave} />;
}
