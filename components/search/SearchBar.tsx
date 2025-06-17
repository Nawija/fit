"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { SearchItem } from "@/types";
import { Search, X } from "lucide-react";
import SpinerLoading from "../loading/SpinerLoading";

const SearchParams = dynamic(() => import("@/components/search/SearchParams"));

export default function SearchBar() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("query") || "");

  const [isSearching, setIsSearching] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<SearchItem[]>([]);
  const [allRecipe, setAllRecipes] = useState<SearchItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRecipes() {
      const res = await fetch("/api/search-bar");
      if (res.ok) {
        const data: SearchItem[] = await res.json();
        setAllRecipes(data);
        console.log("All recipe items:", allRecipe);
      }
    }
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (search.length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = allRecipe.filter((product) =>
          product.title.toLowerCase().includes(search.toLowerCase()),
        );
        setFilteredProducts(filtered);
        setIsSearching(false);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setFilteredProducts([]);
      setIsSearching(false);
    }
  }, [search, allRecipe]);

  function modelOp() {
    setIsModalOpen(true);
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      setFilteredProducts([]);
    }
  };

  const clearFilterProducts = () => {
    setFilteredProducts([]);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const handleSearchIconClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="relative w-full" ref={inputRef}>
      <form className="relative w-full h-full">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          onFocus={modelOp}
          placeholder="Szukaj przepisów"
          className="w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-[16px] outline-0 placeholder:text-zinc-400 lg:flex"
        />
        {search.length > 0 ? (
          <X
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-lg text-zinc-400"
            size={20}
            onClick={() => {
              setSearch("");
              setFilteredProducts([]);
            }}
          />
        ) : (
          <Search
            size={20}
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-lg text-zinc-400"
            onClick={handleSearchIconClick}
          />
        )}
      </form>
      <Suspense fallback={null}>
        {isModalOpen && search.length >= 2 && (
          <div className="absolute top-full left-1/2 z-10 mt-2 w-full overflow-y-scroll h-32 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-2">
            <div className="anim-opacity w-full lg:p-3">
              {isSearching ? (
                <SpinerLoading />
              ) : filteredProducts.length > 0 ? (
                <div className="flex w-full flex-col items-center justify-center space-y-4">
                  {filteredProducts.slice(0, 4).map((item, index) => (
                    <SearchParams
                      item={item}
                      key={index}
                      closeModal={clearFilterProducts}
                      clearFilterProducts={clearFilterProducts}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-zinc-500">
                  Brak wyników dla{" "}
                  <span className="text-zinc-400">”{search}”</span>
                </p>
              )}
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
}
