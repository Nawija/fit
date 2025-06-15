import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureCard from "@/components/FeatureCard";
import TestimonialCard from "@/components/TestimonialCard";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Wrench, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <div className="py-24 bg-background">
          <AnimatedSection className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4">Dlaczego My?</h2>
            <p className="text-text-dim mb-16 max-w-2xl mx-auto">
              Koncentrujemy się na trzech filarach, które gwarantują sukces Twojego projektu.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="Niesamowita Wydajność"
                description="Nasza architektura zapewnia błyskawiczne ładowanie i płynne działanie."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-8 w-8 text-primary" />}
                title="Pancerne Bezpieczeństwo"
                description="Chronimy Twoje dane za pomocą najnowszych standardów szyfrowania i zabezpieczeń."
              />
              <FeatureCard
                icon={<Wrench className="h-8 w-8 text-primary" />}
                title="Intuicyjna Personalizacja"
                description="Dostosuj każdy element do swoich potrzeb bez pisania ani jednej linijki kodu."
              />
            </div>
          </AnimatedSection>
        </div>

        <div className="py-24 bg-surface">
          <AnimatedSection className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4">Zaufały nam tysiące</h2>
            <p className="text-text-dim mb-16 max-w-2xl mx-auto">
              Opinie naszych klientów mówią same za siebie.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <TestimonialCard
                quote="Ta platforma zmieniła zasady gry. Przyspieszyła nasz rozwój o 200%."
                author="Anna Kowalska"
                role="CEO, TechCorp"
              />
              <TestimonialCard
                quote="Nigdy nie pracowałem z tak intuicyjnym i potężnym narzędziem. Absolutny game-changer."
                author="Jan Nowak"
                role="Lead Developer, InnovateX"
              />
              <TestimonialCard
                quote="Wsparcie klienta jest fenomenalne. Zawsze gotowi do pomocy i rozwiązywania problemów."
                author="Ewa Wiśniewska"
                role="Project Manager, CreativeMinds"
              />
            </div>
          </AnimatedSection>
        </div>
      </main>
      <Footer />
    </>
  );
}