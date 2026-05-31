import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import OrderFormModal from "./OrderFormModal";

const StickyOrderButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling past hero section (approximately 100vh)
      const heroHeight = window.innerHeight;
      setIsVisible(window.scrollY > heroHeight * 0.8);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => setIsFormOpen(true)}
            className="fixed bottom-6 left-6 md:bottom-24 md:right-6 md:left-auto z-40 group flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 bg-primary/95 backdrop-blur-sm rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
          >
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            <span className="font-body text-sm tracking-luxury uppercase text-primary-foreground">
              Order Now
            </span>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-scarlet to-primary bg-[length:200%_100%] opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity duration-500 -z-10 blur-xl" />
          </motion.button>
        )}
      </AnimatePresence>

      <OrderFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </>
  );
};

export default StickyOrderButton;
