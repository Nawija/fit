"use client";

type MenuBurgerProps = {
  handleShowMenu: () => void;
  showMenu: boolean;
};

export default function MenuBurger({
  handleShowMenu,
  showMenu,
}: MenuBurgerProps) {
  const burgerClass = "h-[2px] duration-300 rounded-lg bg-zinc-600";

  return (
    <button
      onClick={handleShowMenu}
      aria-label={showMenu ? "Zamknij menu" : "Otwórz menu"}
      aria-expanded={showMenu}
      className="z-[999] ml-auto flex flex-col items-end justify-center space-y-1.5 cursor-pointer p-2"
    >
      <div
        className={`${burgerClass} transform transition-all w-5 ${
          showMenu ? "translate-y-2 rotate-[405deg]" : ""
        }`}
      />
      <div
        className={`${burgerClass} transition-all w-4 ${
          showMenu ? "opacity-0" : "w-4"
        }`}
      />
      <div
        className={`${burgerClass} transform transition-all w-5 ${
          showMenu ? "-translate-y-2 -rotate-45" : ""
        }`}
      />
    </button>
  );
}
