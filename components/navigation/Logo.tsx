import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex w-full items-center justify-center text-xl font-semibold"
    >
      Przepisy
    </Link>
  );
}
