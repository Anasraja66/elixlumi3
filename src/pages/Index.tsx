import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StorySection from "@/components/StorySection";
import FragranceNotes from "@/components/FragranceNotes";
import ProductCatalog from "@/components/ProductCatalog";
import OlfactoryJourney from "@/components/OlfactoryJourney";
import PhilosophySection from "@/components/PhilosophySection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import WhatsAppButton from "@/components/WhatsAppButton";
import StickyOrderButton from "@/components/StickyOrderButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Grain overlay for texture */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <Navigation />
      <main className="relative z-10">
        <HeroSection />
        <section id="collection">
          <ProductCatalog />
        </section>
        <StorySection />
        <section id="notes">
          <FragranceNotes />
        </section>
        <OlfactoryJourney />
        <section id="philosophy">
          <PhilosophySection />
        </section>
        <CTASection />
      </main>
      <Footer />
      
      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
      
      {/* Sticky Order Button */}
      <StickyOrderButton />
    </div>
  );
};

export default Index;
