"use client";

import Image from "next/image";
import { Suspense } from "react";
import SearchBar from "./search/SearchBar";
import TypingText from "./TypingText";

//  <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//         ></motion.div>

const Hero = () => {
  return (
    <section className="relative flex h-[50vh] w-full items-center justify-center">
      <Image
        src="/images/hero/widok-z-gory-na-stol-pelen-jedzenia1.webp"
        className="-z-10 object-cover brightness-75"
        fill
        alt="widok-z-gory-na-stol-pelen-jedzenia"
      />
      <div className="mx-auto w-full max-w-2xl space-y-6 px-8">
        <div>
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
          <TypingText />
        </div>

        <p className="text-zinc-300">
          There are many variations of passages of Lorem Ipsum available, but
          the majority have suffered
        </p>
      </div>
    </section>
  );
};

export default Hero;
