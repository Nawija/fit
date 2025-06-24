"use client";

import { Minus, Plus, Check } from "lucide-react";
import { useState } from "react";

type IngredientsProps = {
    ingredients: string[];
};

export default function IngredientsCard({ ingredients }: IngredientsProps) {
    const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
    const [portions, setPortions] = useState<number>(1);

    const toggleIngredient = (index: number) => {
        setCheckedIngredients((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
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
            }
        );
    };

    const getPortionLabel = (count: number) => {
        if (count === 1) return "Porcja";
        if (count > 1 && count < 5) return "Porcje";
        return "Porcji";
    };

    return (
        // Główny kontener - "karta"
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 sticky top-4 max-w-md mx-auto">
            
            {/* Sekcja nagłówka i porcji */}
            <div className="flex flex-col sm:flex-row justify-between items-start pb-4 border-b border-gray-200">
                <div className="mb-4 sm:mb-0">
                    <h2 className="text-xl font-bold text-gray-800">
                        Lista Zakupów
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Zaznacz posiadane składniki
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handlePortionChange(-1)}
                        className="p-2 bg-teal-100 rounded-full text-teal-500 hover:bg-teal-200 transition-colors cursor-pointer"
                        aria-label="Zmniejsz liczbę porcji"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-gray-800 font-bold text-lg w-20 text-center">
                        {portions} {getPortionLabel(portions)}
                    </span>
                    <button
                        onClick={() => handlePortionChange(1)}
                        className="p-2 bg-teal-600 rounded-full text-white shadow-sm hover:bg-teal-700 transition-colors cursor-pointer"
                        aria-label="Zwiększ liczbę porcji"
                    >
                        <Plus className="w-4 h-4" />
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
                                className="w-full text-left flex items-center gap-4 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                role="checkbox"
                                aria-checked={isChecked}
                            >
                                {/* Custom Checkbox */}
                                <div
                                    className={`w-5 h-5 flex-shrink-0 border-2 rounded flex items-center justify-center transition-all duration-200 ${
                                        isChecked
                                            ? "bg-teal-600 border-teal-600"
                                            : "border-gray-300 bg-white"
                                    }`}
                                >
                                    {isChecked && (
                                        <Check className="w-4 h-4 text-white" />
                                    )}
                                </div>

                                {/* Nazwa składnika */}
                                <span
                                    className={`flex-grow text-base transition-all duration-200 ${
                                        isChecked
                                            ? "line-through text-gray-400"
                                            : "text-gray-700 font-medium"
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