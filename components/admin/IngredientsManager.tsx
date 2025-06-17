// /components/admin/IngredientsManager.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface Props {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
}

export default function IngredientsManager({
  ingredients,
  setIngredients,
}: Props) {
  const [newIngredient, setNewIngredient] = useState("");

  const addIngredient = () => {
    if (newIngredient.trim() !== "") {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  return (
    <div className="my-6 rounded-lg border p-4">
      <h3 className="mb-2 text-lg font-semibold">Składniki</h3>
      <AnimatePresence>
        {ingredients.map((ingredient, index) => (
          <motion.div
            key={index}
            className="mb-2 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="text"
              value={ingredient}
              onChange={(e) => updateIngredient(index, e.target.value)}
              className="flex-grow rounded-md border-gray-300 shadow-sm"
            />
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
            >
              Usuń
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          placeholder="np. mąka pszenna 1 szklanka"
          className="flex-grow rounded-md border-gray-300 shadow-sm"
        />
        <button
          type="button"
          onClick={addIngredient}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Dodaj
        </button>
      </div>
    </div>
  );
}
