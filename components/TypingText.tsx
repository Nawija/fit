"use client";
import { useEffect, useState } from "react";

const words = ["Szybki obiad", "Kurczak w sosie", "Szejk Proteinowy", "Fit Chleb"];

export default function TypingText() {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(150);

  useEffect(() => {
    const currentWord = words[wordIndex % words.length];

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setText((prev) => prev.slice(0, -1));
        setSpeed(70);
      } else {
        setText((prev) => currentWord.slice(0, prev.length + 1));
        setSpeed(70);
      }

      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), 700); // Delay before deleting
      }

      if (isDeleting && text === "") {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, speed]);

  return (
    <div className="text-start text-sm text-zinc-300 mt-2 ml-1">
      <span className="transition-all duration-200">{text}</span>
      <span className="animate-blink">|</span>{" "}
    </div>
  );
}
