import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import MagneticButton from "./MagneticButton";
import OrderFormModal from "./OrderFormModal";

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  size: string;
  images: string[];
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  available: boolean;
}

const OlfactoryJourney = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`/api/products?t=${Date.now()}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      
      const mapped = data.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        subtitle: p.subtitle || "",
        description: p.description || "",
        price: typeof p.price === 'number' ? `PKR ${p.price.toLocaleString()}` : p.price,
        originalPrice: p.original_price ? `PKR ${p.original_price.toLocaleString()}` : undefined,
        discount: p.discount_label,
        size: p.size || "50ml",
        images: [p.image_url, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean),
        notes: {
          top: Array.isArray(p.notes_top) ? p.notes_top : [],
          heart: Array.isArray(p.notes_heart) ? p.notes_heart : [],
          base: Array.isArray(p.notes_base) ? p.notes_base : [],
        },
        available: Boolean(p.available),
      }));

      setProducts(mapped);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const availableProducts = products.filter((p) => p.available);
  const selectedProduct = availableProducts[currentIndex];

  const goToNextProduct = useCallback(() => {
    if (availableProducts.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev < availableProducts.length - 1 ? prev + 1 : 0));
    setSelectedImageIndex(0);
  }, [availableProducts.length]);

  const goToPrevProduct = () => {
    if (availableProducts.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : availableProducts.length - 1));
    setSelectedImageIndex(0);
  };

  useEffect(() => {
    if (isPaused || !isInView || isOrderModalOpen || availableProducts.length === 0) return;
    const interval = setInterval(goToNextProduct, 6000);
    return () => clearInterval(interval);
  }, [isPaused, isInView, isOrderModalOpen, goToNextProduct, availableProducts.length]);

  if (isLoading || availableProducts.length === 0) return null;

  return (
    <section className="py-24 bg-background overflow-hidden transition-colors duration-500">
      <div className="container mx-auto px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-ui text-[10px] tracking-[0.8em] text-primary font-black uppercase mb-6 block"
          >
            A Sensory Experience
          </motion.span>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground font-light tracking-tighter">
            Olfactory <span className="italic text-foreground/40">Journey</span>
          </h2>
        </div>

        <div className="relative" ref={ref}>
          {/* Main Carousel Card */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center"
            >
              {/* Product Image */}
              <div className="relative aspect-square lg:aspect-[4/5] bg-[#F5F5F3] overflow-hidden group">
                 <img
                  src={selectedProduct.images[selectedImageIndex]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain p-12 transition-transform duration-1000 group-hover:scale-105"
                />
                
                {/* Image Navigation */}
                {selectedProduct.images.length > 1 && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {selectedProduct.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          selectedImageIndex === i ? "bg-foreground w-6" : "bg-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-10">
                <div className="space-y-4">
                  <span className="font-ui text-xs tracking-[0.4em] text-primary font-bold uppercase">
                    {selectedProduct.subtitle || "The Signature Essence"}
                  </span>
                  <h3 className="font-display text-5xl lg:text-7xl text-foreground tracking-tight">
                    {selectedProduct.name}
                  </h3>
                  <p className="font-body text-lg text-foreground/60 leading-relaxed max-w-lg">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Fragrance Notes */}
                <div className="grid grid-cols-3 gap-8 pt-6 border-t border-foreground/5">
                  <div className="space-y-2">
                    <p className="font-ui text-[10px] tracking-widest text-foreground/30 uppercase font-black">Top</p>
                    <p className="font-display text-sm text-foreground/80">{selectedProduct.notes.top.slice(0, 3).join(", ") || "Floral"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-ui text-[10px] tracking-widest text-foreground/30 uppercase font-black">Heart</p>
                    <p className="font-display text-sm text-foreground/80">{selectedProduct.notes.heart.slice(0, 3).join(", ") || "Oud"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-ui text-[10px] tracking-widest text-foreground/30 uppercase font-black">Base</p>
                    <p className="font-display text-sm text-foreground/80">{selectedProduct.notes.base.slice(0, 3).join(", ") || "Amber"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <MagneticButton 
                    onClick={() => setIsOrderModalOpen(true)}
                    className="px-12 py-5 bg-foreground text-background rounded-full font-ui text-[10px] tracking-luxury font-black"
                  >
                    ORDER NOW — {selectedProduct.price}
                  </MagneticButton>
                  
                  <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className="p-4 border border-foreground/10 hover:border-foreground/30 rounded-full transition-all"
                  >
                    {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Controls */}
          <div className="flex justify-between items-center mt-16 pt-16 border-t border-foreground/5">
            <div className="flex gap-4">
              <button onClick={goToPrevProduct} className="p-4 border border-foreground/10 hover:border-foreground rounded-full transition-all"><ChevronLeft size={20} /></button>
              <button onClick={goToNextProduct} className="p-4 border border-foreground/10 hover:border-foreground rounded-full transition-all"><ChevronRight size={20} /></button>
            </div>
            <div className="font-ui text-[10px] tracking-widest text-foreground/30 uppercase font-black">
              EXPLORE {currentIndex + 1} / {availableProducts.length}
            </div>
          </div>
        </div>
      </div>

      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        selectedProduct={selectedProduct ? {
          name: selectedProduct.name,
          price: selectedProduct.price,
          size: selectedProduct.size,
        } : { name: "", price: "", size: "" }}
      />
    </section>
  );
};

export default OlfactoryJourney;
