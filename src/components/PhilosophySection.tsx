import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const PhilosophySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="luxury-section relative py-32 md:py-48 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div ref={ref} className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="space-y-4"
          >
            <span className="font-body text-xs tracking-luxury text-accent uppercase">
              Our Philosophy
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-tight">
              A House of
              <br />
              <span className="text-gradient-gold">Light, Scent & Emotion</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="w-16 h-px bg-accent/30" />
            <div className="w-2 h-2 bg-primary rotate-45" />
            <div className="w-16 h-px bg-accent/30" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.4 }}
            className="space-y-6 font-body text-lg text-muted-foreground leading-relaxed"
          >
            <p>
              ELIX LUMI was born from a singular vision: to create fragrances that 
              illuminate the soul. We believe that scent is the most intimate form of 
              self-expression—a silent language spoken only by those who dare to be 
              remembered.
            </p>
            <p>
              Our master perfumers work in the tradition of the great houses, yet 
              unbound by convention. Each creation is a meditation on beauty, a 
              pursuit of the extraordinary hidden within the everyday.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.7 }}
            className="grid grid-cols-3 gap-8 pt-8"
          >
            {[
              { value: "Est. 2024", label: "Founded" },
              { value: "Artisanal", label: "Craftsmanship" },
              { value: "Exclusive", label: "Collections" },
            ].map((item, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="font-display text-xl md:text-2xl text-accent">
                  {item.value}
                </div>
                <div className="font-body text-xs tracking-luxury text-muted-foreground uppercase">
                  {item.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
