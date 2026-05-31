import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import signatureLuxury from "@/assets/signature-luxury.jpg";

const StorySection = () => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <section
      id="experience"
      ref={containerRef}
      className="luxury-section py-32 md:py-48 relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="container mx-auto px-6 relative">
        <div ref={ref} className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            <motion.div
              style={{ y: imageY }}
              className="relative aspect-[3/4] overflow-hidden group"
            >
              <img
                src={signatureLuxury}
                alt="ELIX LUMI Signature bottle detail"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-700" />
            </motion.div>

            {/* Animated frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute -inset-4 border border-accent/20 pointer-events-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute -inset-8 border border-accent/10 pointer-events-none"
            />

            {/* Corner accents */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-primary/40" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-primary/40" />
          </motion.div>

          {/* Content */}
          <motion.div
            style={{ y: textY }}
            initial={{ opacity: 0, x: 80 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="inline-flex items-center gap-4 font-ui text-[10px] tracking-[0.8em] text-primary uppercase font-black"
              >
                <span className="w-12 h-px bg-primary" />
                The Essence
              </motion.span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-light text-foreground leading-none tracking-tighter">
                Where Desire
                <br />
                <span className="italic text-foreground/40">Takes Form</span>
              </h2>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.6 }}
              className="w-24 h-px bg-gradient-to-r from-primary via-accent to-transparent origin-left"
            />

            <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Born from the rarest tulip fields, ELIX LUMI Signature 
                captures a moment suspended between passion and grace. Each drop carries 
                the weight of centuries-old craftsmanship, distilled into an essence that 
                speaks without words.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                This is not merely a fragrance—it is an emotional signature, an invisible 
                garment worn by those who understand that true luxury lies in the 
                unforgettable. The tulip, ablaze with inner fire, becomes your 
                silent companion through every meaningful moment.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, delay: 0.9 }}
              className="pt-4 relative"
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
              <blockquote className="font-display text-xl md:text-2xl italic text-accent/90 pl-8">
                "For those who leave impressions,
                <br />
                <span className="text-primary">not just presence.</span>"
              </blockquote>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
