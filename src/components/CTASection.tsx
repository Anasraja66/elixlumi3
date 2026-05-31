import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import MagneticButton from "./MagneticButton";
import signatureBottleBox from "@/assets/signature-bottle-box.jpg";

const CTASection = () => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      ref={containerRef}
      className="luxury-section py-32 md:py-48 relative overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 opacity-20"
      >
        <img
          src={signatureBottleBox}
          alt=""
          className="w-full h-[120%] object-cover"
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      {/* Ambient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]"
      />

      <div ref={ref} className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-14">
          {/* Decorative element */}
          <motion.div
            initial={{ scale: 0, rotate: 45 }}
            animate={isInView ? { scale: 1, rotate: 45 } : {}}
            transition={{ duration: 0.8 }}
            className="w-3 h-3 bg-primary mx-auto"
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <h2 className="font-display text-5xl md:text-6xl lg:text-8xl font-light text-foreground leading-tight">
              Own the
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 0.3 }}
                className="italic text-gradient-scarlet"
              >
                Signature
              </motion.span>
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.4 }}
              className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Begin your journey with ELIX LUMI. Let your presence be felt 
              before you arrive, and remembered long after you've gone.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <MagneticButton className="group relative px-14 py-6 bg-primary overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(var(--primary),0.4)]">
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-scarlet to-primary bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500" />
              <span className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]" />
              <span className="relative font-body text-sm tracking-luxury uppercase text-primary-foreground">
                Discover Collection
              </span>
            </MagneticButton>

            <MagneticButton className="group relative px-14 py-6 overflow-hidden">
              <span className="absolute inset-0 border border-accent/40 group-hover:border-accent transition-colors duration-500" />
              <span className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-700" />
              <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/0 group-hover:via-accent to-transparent transition-all duration-700" />
              <span className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/0 group-hover:via-accent to-transparent transition-all duration-700" />
              <span className="relative font-body text-sm tracking-luxury uppercase text-accent group-hover:text-foreground transition-colors duration-500">
                Contact Us
              </span>
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="pt-8 flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-accent/30" />
              <span className="text-accent text-lg">✦</span>
              <div className="w-12 h-px bg-accent/30" />
            </div>
            <p className="font-display text-xl md:text-2xl italic text-accent/80">
              "Begin the ELIX LUMI Experience"
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
