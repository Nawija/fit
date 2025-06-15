"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Rocket } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-surface/80 backdrop-blur-sm border-b border-border' : 'bg-transparent'}`}>
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-text-main">
          <Rocket className="h-6 w-6 text-primary" />
          <span>Stellar</span>
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#features" className="text-text-dim hover:text-primary transition-colors">
            Funkcje
          </Link>
          <Link href="#testimonials" className="text-text-dim hover:text-primary transition-colors">
            Opinie
          </Link>
          <Link href="#contact" className="text-text-dim hover:text-primary transition-colors">
            Kontakt
          </Link>
        </nav>
        <Link
          href="#"
          className="bg-primary text-background px-5 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all transform hover:scale-105"
        >
          Rozpocznij
        </Link>
      </div>
    </header>
  );
};

export default Header;