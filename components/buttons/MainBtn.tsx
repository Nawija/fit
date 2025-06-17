import clsx from "clsx";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function MainBtn({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        "relative cursor-pointer rounded-lg bg-zinc-200 px-5 py-2 text-sm font-semibold text-black/80 transition-colors hover:bg-zinc-300 hover:text-black",
        className,
      )}
    >
      {children}
    </button>
  );
}
