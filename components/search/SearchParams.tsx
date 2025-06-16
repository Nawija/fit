"use client";

import { SearchItem } from "@/types";
import Image from "next/image";
import Link from "next/link";

export default function SearchParams({
  item,
  clearFilterProducts,
  closeModal,
}: {
  item: SearchItem;
  clearFilterProducts: () => void;
  closeModal: () => void;
}) {
  const { slug, image, title } = item;
  return (
    <Link
      onClick={() => {
        clearFilterProducts();
        closeModal();
      }}
      href={`/przepis/${slug}`}
      className="bg-main/30 hover:bg-main flex w-full items-start justify-between rounded-lg border border-gray-200 p-2 backdrop-blur-lg transition-colors"
    >
      <Image
        alt={title}
        src={image}
        className="h-8 w-max object-contain object-top pr-1 sm:h-16"
        height={40}
        width={90}
      />

      <p className="text-end">{title}</p>
    </Link>
  );
}
