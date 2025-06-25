"use client";

import { Check, Minus, Plus } from "lucide-react";
import { useState } from "react";

type IngredientsProps = {
  ingredients: string[];
};

export default function IngredientsCard({ ingredients }: IngredientsProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [portions, setPortions] = useState<number>(1);

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handlePortionChange = (delta: number) => {
    setPortions((prev) => Math.max(1, prev + delta));
  };

  const scaleIngredient = (ingredient: string) => {
    // Szuka liczby z jednostką np. "200g", "150 ml", "3 szt."
    // Obsługuje liczby całkowite i dziesiętne
    return ingredient.replace(
      /(\d*\.?\d+)(\s?[a-zA-Ząćęłńóśźż]+)/g,
      (_, numStr, unit) => {
        const num = parseFloat(numStr);
        const result = num * portions;
        // Jeśli wynik jest liczbą całkowitą, wyświetl jako całkowitą
        if (result % 1 === 0) {
          return `${result}${unit}`;
        }
        // W przeciwnym razie, zaokrąglij do jednego miejsca po przecinku
        return `${result.toFixed(1)}${unit}`;
      },
    );
  };

  const getPortionLabel = (count: number) => {
    if (count === 1) return "Porcja";
    if (count > 1 && count < 5) return "Porcje";
    return "Porcji";
  };

  return (
    // Główny kontener - "karta"
    <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      {/* Sekcja nagłówka i porcji */}
      <div className="flex flex-col items-start justify-between border-b border-gray-200 pb-4 sm:flex-row">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl font-bold text-gray-800">Lista Zakupów</h2>
          <p className="mt-1 text-sm text-gray-500">
            Zaznacz posiadane składniki
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePortionChange(-1)}
            className="cursor-pointer rounded-full bg-yellow-100 p-2 text-yellow-500 transition-colors hover:bg-yellow-200"
            aria-label="Zmniejsz liczbę porcji"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-20 text-center text-lg font-bold text-gray-800">
            {portions} {getPortionLabel(portions)}
          </span>
          <button
            onClick={() => handlePortionChange(1)}
            className="cursor-pointer rounded-full bg-yellow-600 p-2 text-white shadow-sm transition-colors hover:bg-yellow-700"
            aria-label="Zwiększ liczbę porcji"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lista składników */}
      <ul className="mt-6 space-y-2">
        {ingredients?.map((ingredient, index) => {
          const isChecked = checkedIngredients.includes(index);
          return (
            <li key={index}>
              <button
                onClick={() => toggleIngredient(index)}
                className="flex w-full cursor-pointer items-center gap-4 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                role="checkbox"
                aria-checked={isChecked}
              >
                {/* Custom Checkbox */}
                <div
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all duration-200 ${
                    isChecked
                      ? "border-green-600 bg-green-600"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isChecked && <Check className="h-4 w-4 text-white" />}
                </div>

                {/* Nazwa składnika */}
                <span
                  className={`flex-grow text-base transition-all duration-200 ${
                    isChecked
                      ? "text-gray-400 line-through"
                      : "font-medium text-gray-700"
                  }`}
                >
                  {scaleIngredient(ingredient)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
