import Link from 'next/link';
import { Rocket } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-surface border-t border-border py-16">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="text-text-main">Stellar</span>
          </Link>
          <p className="text-text-dim max-w-sm">Platforma napędzająca nową generację cyfrowych doświadczeń.</p>
        </div>
        <div>
          <h4 className="font-bold text-text-main mb-4">Produkt</h4>
          <ul className="space-y-2">
            <li><Link href="#features" className="text-text-dim hover:text-primary">Funkcje</Link></li>
            <li><Link href="#" className="text-text-dim hover:text-primary">Integracje</Link></li>
            <li><Link href="#" className="text-text-dim hover:text-primary">Cennik</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-text-main mb-4">Firma</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="text-text-dim hover:text-primary">O nas</Link></li>
            <li><Link href="#" className="text-text-dim hover:text-primary">Kariera</Link></li>
            <li><Link href="#" className="text-text-dim hover:text-primary">Kontakt</Link></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-text-dim mt-12 border-t border-border pt-8">
        <p>&copy; {new Date().getFullYear()} Stellar. Wszystkie prawa zastrzeżone.</p>
      </div>
    </footer>
  );
};

export default Footer;