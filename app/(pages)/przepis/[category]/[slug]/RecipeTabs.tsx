// /app/przepis/[category]/[slug]/RecipeTabs.tsx

"use client"; // Ten komponent jest interaktywny, więc potrzebuje 'use client'

import { RecipeSteps } from "@/lib/searchItems";
import { Flame, List } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface RecipeTabsProps {
  ingredients: string[];
  steps: RecipeSteps[];
}

export default function RecipeTabs({ ingredients, steps }: RecipeTabsProps) {
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">(
    "ingredients",
  );

  const tabButtonStyle =
    "flex-1 rounded-t-lg py-3 px-4 text-center font-bold transition-colors duration-300";
  const activeTabStyle = "bg-zinc-800 text-white";
  const inactiveTabStyle = "bg-zinc-900 text-zinc-400 hover:bg-zinc-800/60";

  return (
    <div>
      {/* Przełączniki zakładek */}
      <div className="sticky top-0 z-10 flex bg-zinc-900/80 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab("ingredients")}
          className={`${tabButtonStyle} ${activeTab === "ingredients" ? activeTabStyle : inactiveTabStyle}`}
        >
          <div className="flex items-center justify-center gap-2">
            <List size={20} />
            <span>Składniki</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("steps")}
          className={`${tabButtonStyle} ${activeTab === "steps" ? activeTabStyle : inactiveTabStyle}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Flame size={20} />
            <span>Przygotowanie</span>
          </div>
        </button>
      </div>

      <div className="rounded-b-xl bg-zinc-800 p-6 sm:p-10">
        {/* Zawartość zakładki Składniki */}
        {activeTab === "ingredients" && (
          <div className="animate-fade-in">
            <ul className="space-y-4">
              {ingredients.map((ingredient, i) => (
                <li key={i}>
                  <label className="group flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-zinc-700/50">
                    <input
                      type="checkbox"
                      className="h-5 w-5 flex-shrink-0 rounded-sm border-2 border-zinc-500 bg-zinc-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-zinc-800"
                    />
                    <span className="text-lg text-zinc-200 group-has-[:checked]:text-zinc-500 group-has-[:checked]:line-through">
                      {ingredient}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Zawartość zakładki Przygotowanie */}
        {activeTab === "steps" && (
          <div className="animate-fade-in">
            <ol className="space-y-10">
              {steps.map((step, idx) => (
                <li key={idx} className="flex gap-4 sm:gap-6">
                  <div className="flex-shrink-0 pt-1 text-2xl font-black text-orange-500">
                    {idx + 1}
                  </div>
                  <div className="space-y-3">
                    {step.title && (
                      <h3 className="text-xl font-bold text-white">
                        {step.title}
                      </h3>
                    )}
                    {step.description.map((desc, i) => (
                      <p
                        key={i}
                        className="text-lg leading-relaxed text-zinc-300"
                      >
                        {desc}
                      </p>
                    ))}
                    {step.image && (
                      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg shadow-lg">
                        <Image
                          src={step.image}
                          alt={step.title || ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
