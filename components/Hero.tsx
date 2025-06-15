"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-text-main to-secondary">
            Zbuduj Przyszłość, <br /> Już Dzisiaj.
          </h1>
          <p className="text-lg md:text-xl text-text-dim mb-10 max-w-2xl mx-auto">
            Nasza platforma to przełom w tworzeniu nowoczesnych aplikacji. Dołącz do liderów innowacji.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="#"
              className="group bg-primary text-background px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              Zacznij za darmo
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;