import { NAVLINKS } from "@/constants";
import Link from "next/link";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-gray-200 py-24">
      <Logo />
      <ul className="mx-auto mt-12 flex w-max flex-col items-center justify-center gap-4 border-y border-gray-300 py-2 sm:flex-row">
        {NAVLINKS.map((link, i) => (
          <ol key={i}>
            <Link
              href={link.href}
              className="text-zinc-600 transition-colors hover:text-black"
            >
              {link.label}
            </Link>
          </ol>
        ))}
      </ul>
    </footer>
  );
};

export default Footer;
