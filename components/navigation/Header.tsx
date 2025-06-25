"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Logo from "./Logo";
import MenuBurger from "./MenuBurger";

import { NAVLINKS } from "@/constants";
import Link from "next/link";
import SearchBar from "../search/SearchBar";

export default function Nav() {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const menu = document.querySelector(".mobile-menu");
      const burger = document.querySelector(".menu-burger-button");

      if (
        showMenu &&
        menu &&
        burger &&
        !menu.contains(target) &&
        !burger.contains(target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

  return (
    <>
      {showMenu && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="anim-opacity fixed inset-0 z-[9998] bg-black/30 backdrop-blur-md lg:hidden"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
        </AnimatePresence>
      )}
      <header
        className={`top-0 z-[9999] w-full bg-white text-black transition-all duration-300`}
      >
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between p-4">
          <button
            onClick={() => setShowSearchModal(true)}
            aria-label="Szukaj"
            className="cursor-pointer flex items-center justify-center gap-1.5 border p-2 sm:py-1.5 sm:px-3 border-zinc-200 rounded-xl text-white bg-blue-600 text-sm font-bold"
          >
            <Search size={18} strokeWidth={3} />
            <span className="sm:block hidden">Szukaj</span>
          </button>
          <Logo />
          <div className="flex items-center gap-x-3">
            <button aria-label="Ulubione" className="cursor-pointer">
              <Heart />
            </button>
            <MenuBurger
              handleShowMenu={() => setShowMenu(!showMenu)}
              showMenu={showMenu}
            />
          </div>

          <AnimatePresence>
            {showSearchModal && (
              <motion.div
                className="fixed inset-0 z-[99999] flex h-screen items-start justify-center bg-white/60 px-4 pt-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowSearchModal(false)}
                aria-hidden="true"
              >
                <motion.div
                  className="w-full max-w-2xl rounded-lg bg-white p-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Suspense fallback={null}>
                    <SearchBar />
                  </Suspense>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`mobile-menu shadow-2xl bg-white fixed top-0 left-0 z-[50] h-screen w-[290px] transform pt-12 text-white transition-transform duration-300 ease-in-out ${
              showMenu ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex h-full flex-col px-6">
              <nav aria-label="Menu mobilne">
                <ul className="flex flex-col space-y-6">
                  {NAVLINKS.map((link, index) => (
                    <li
                      key={link.label}
                      className={`transition-all duration-300 ${
                        showMenu ? "opacity-100" : "opacity-0"
                      }`}
                      style={{
                        transitionDelay: `${index * 60}ms`,
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setShowMenu(false)}
                        className={`block py-1 text-lg font-medium uppercase transition-all ${
                          pathname === link.href
                            ? "font-bold text-blue-500"
                            : "text-black/80"
                        }`}
                        aria-current={
                          pathname === link.href ? "page" : undefined
                        }
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
