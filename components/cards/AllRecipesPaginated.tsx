"use client";

import { FlexCardRecipeType } from "@/lib/searchItems";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AllRecipes from "./AllRecipes";

export default function AllRecipesPaginated({
  recipesAll,
}: {
  recipesAll: FlexCardRecipeType[];
}) {
  const itemsPerPage = 12;
  const searchParams = useSearchParams();
  const router = useRouter();

  // Pobierz numer strony z URL (domyślnie 1)
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(
    isNaN(initialPage) || initialPage < 1 ? 1 : initialPage,
  );

  const totalPages = Math.ceil(recipesAll.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRecipes = recipesAll.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < totalPages) updatePage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) updatePage(currentPage - 1);
  };

  // Uaktualnij currentPage, gdy użytkownik ręcznie wpisze URL
  useEffect(() => {
    const pageFromURL = parseInt(searchParams.get("page") || "1", 10);
    if (!isNaN(pageFromURL) && pageFromURL !== currentPage) {
      setCurrentPage(Math.min(Math.max(1, pageFromURL), totalPages));
    }
  }, [searchParams, currentPage, totalPages]);

  return (
    <div className="space-y-8">
      <AllRecipes recipesAll={currentRecipes} />

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="cursor-pointer rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeftIcon />
        </button>

        <span className="text-sm font-medium">
          {currentPage} z {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="cursor-pointer rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}
