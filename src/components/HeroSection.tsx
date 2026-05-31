import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroLight from "@/assets/hero-light.png";
import heroAbstract from "@/assets/hero-abstract.png";

const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full flex items-center overflow-hidden bg-background transition-colors duration-500"
    >
      {/* Background Image Parallax */}
      <motion.div 
        className="absolute inset-0 z-0 flex justify-end items-center"
        style={{ y, opacity }}
      >
        <img
          src={isDark ? heroAbstract : heroLight}
          alt="Luxury Fragrance"
          className={`h-full w-full object-cover transition-all duration-1000 ${
            isDark ? "opacity-25 scale-110" : "lg:w-[65%] lg:object-cover opacity-95 mix-blend-multiply"
          }`}
        />
        
        {/* Floating "Signature" Label */}
        {!isDark && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute right-12 bottom-24 z-20 hidden lg:flex flex-col items-center gap-6"
          >
            <div className="w-px h-24 bg-foreground/10" />
            <span className="font-ui text-[10px] tracking-[0.8em] uppercase vertical-text text-foreground/40 font-bold">
              Signature
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content Overlay */}
      <div className="container mx-auto px-8 lg:px-24 z-10">
        <div className="max-w-2xl lg:max-w-4xl">
          {/* Top tagline - Bold UI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex items-center gap-6 mb-12"
          >
            <span className="w-12 h-[2px] bg-primary" />
            <span className="font-ui text-[10px] tracking-[0.8em] text-foreground font-extrabold uppercase">
              THE ESSENCE OF LUXURY
            </span>
          </motion.div>

          {/* Elegant & Bold Headline */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
            className="mb-16"
          >
            <h1 className="font-display text-[12vw] md:text-8xl lg:text-[10rem] leading-[0.85] font-light text-foreground tracking-tighter">
              Your <span className={`italic font-normal ${isDark ? "text-accent" : "serif-detail"}`}>best</span> <br /> 
              scent secret
            </h1>
          </motion.div>

          {/* CTA Area - High Contrast Bold */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-16 lg:gap-24"
          >
            <button 
              onClick={() => navigate("/shop")}
              className="group flex items-center gap-8 transition-all"
            >
              <div className="relative w-20 h-20 rounded-full bg-foreground flex items-center justify-center transition-all duration-500 hover:scale-110">
                <div className="w-2 h-2 bg-background rounded-full transition-transform" />
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-[-10px] rounded-full border border-foreground/10"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-ui text-xs tracking-[0.4em] uppercase text-foreground font-extrabold">
                  Explore Now
                </span>
                <span className="font-ui text-[9px] tracking-[0.2em] text-foreground/40 uppercase mt-2 font-bold">
                  Signature Collection
                </span>
              </div>
            </button>

            <div className="flex flex-col gap-2">
              <p className="font-display text-3xl text-foreground/60 italic leading-tight">
                "Crafted for the Few."
              </p>
              <p className="font-display text-2xl text-foreground/30 italic leading-tight ml-10">
                Felt by All.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Large Watermark - Signature Style */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 hidden xl:block opacity-[0.03] pointer-events-none select-none">
        <span className="font-ui text-[28rem] leading-none text-foreground font-black tracking-tighter">
          ELIX
        </span>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6"
      >
        <span className="font-ui text-[9px] tracking-[0.8em] text-foreground/40 uppercase font-black">
          Scroll
        </span>
        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-[2px] h-20 bg-gradient-to-b from-foreground/30 to-transparent"
        />
      </motion.div>

      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        .serif-detail::after {
          content: '○';
          position: absolute;
          top: -0.4em;
          right: -0.2em;
          font-size: 0.3em;
          opacity: 0.3;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
