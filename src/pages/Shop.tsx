import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import MagneticButton from "@/components/MagneticButton";
import OrderFormModal from "@/components/OrderFormModal";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";


interface Product {
  id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  discount_label: string | null;
  size: string | null;
  image_url: string | null;
  images: string[] | null;
  notes_top: string[] | null;
  notes_heart: string[] | null;
  notes_base: string[] | null;
  available: boolean | null;
  sort_order: number | null;
}

// Format price to string for display
const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

const ProductCard = ({
  product,
  onOrder,
}: {
  product: Product;
  onOrder: (product: Product) => void;
}) => {
  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.images || []),
  ];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="group bg-card/50 border border-accent/10 hover:border-accent/30 transition-all duration-500"
    >
      {/* Image Gallery */}
      <div className="relative aspect-square overflow-hidden">
        {/* Frame */}
        <div className="absolute inset-3 border border-accent/10 z-10 pointer-events-none group-hover:border-accent/20 transition-colors duration-500" />

        {allImages.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImageIndex}
                src={allImages[selectedImageIndex]}
                alt={`${product.name} - View ${selectedImageIndex + 1}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -5000) {
                    setSelectedImageIndex((prev) =>
                      prev < allImages.length - 1 ? prev + 1 : 0
                    );
                  } else if (swipe > 5000) {
                    setSelectedImageIndex((prev) =>
                      prev > 0 ? prev - 1 : allImages.length - 1
                    );
                  }
                }}
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <motion.button
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev > 0 ? prev - 1 : allImages.length - 1
                    )
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-background/80 backdrop-blur-sm border border-accent/30 hover:border-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </motion.button>
                <motion.button
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev < allImages.length - 1 ? prev + 1 : 0
                    )
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-background/80 backdrop-blur-sm border border-accent/30 hover:border-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </motion.button>

                {/* Image Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        selectedImageIndex === index
                          ? "bg-primary w-4"
                          : "bg-accent/40 hover:bg-accent/60 w-1.5"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-muted/20 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

        {/* Subtitle badge */}
        {product.subtitle && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 bg-background/80 backdrop-blur-sm border border-accent/20 font-body text-[10px] tracking-luxury uppercase text-accent">
              {product.subtitle}
            </span>
          </div>
        )}

        {/* Discount badge */}
        {product.discount_label && (
          <div className="absolute top-4 right-4 z-10">
            <span className="px-2 py-1 bg-primary text-primary-foreground font-body text-[10px] tracking-luxury uppercase">
              {product.discount_label}
            </span>
          </div>
        )}
      </div>

      {/* Product Info - Clickable to detail page */}
      <Link
        to={`/product/${product.id}`}
        className="block p-6 space-y-4 hover:bg-accent/5 transition-colors"
      >
        <div>
          <h3 className="font-display text-2xl text-foreground mb-1">{product.name}</h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {product.description || "A luxury fragrance by Elix Lumi."}
          </p>
        </div>

        {/* Price & Size */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-display text-xl text-accent">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="font-display text-sm text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {product.size && (
              <span className="font-body text-xs text-muted-foreground tracking-wide uppercase">
                {product.size}
              </span>
            )}
            <span className="px-2 py-0.5 border border-accent/30 font-body text-[10px] tracking-luxury uppercase text-accent">
              ⏱ 10–12 hrs lasting
            </span>
          </div>
        </div>

        {/* Fragrance Notes Preview */}
        {(product.notes_top || product.notes_heart || product.notes_base) && (
          <div className="pt-2 border-t border-accent/10">
            <div className="flex flex-wrap gap-1.5">
              {[
                ...(product.notes_top?.slice(0, 2) || []),
                ...(product.notes_heart?.slice(0, 1) || []),
              ].map((note) => (
                <span
                  key={note}
                  className="px-2 py-0.5 bg-muted/30 font-body text-[10px] text-muted-foreground"
                >
                  {note}
                </span>
              ))}
              {(() => {
                const total =
                  (product.notes_top?.length || 0) +
                  (product.notes_heart?.length || 0) +
                  (product.notes_base?.length || 0);
                const shown = Math.min(3, total);
                return total > shown ? (
                  <span className="px-2 py-0.5 font-body text-[10px] text-muted-foreground">
                    +{total - shown} more
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        )}
      </Link>

      {/* CTA Buttons */}
      <div className="flex gap-3 px-6 pb-6">
        <MagneticButton
          className="flex-1 group relative py-3 bg-primary overflow-hidden"
          onClick={() => onOrder(product)}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-primary via-scarlet to-primary bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500" />
          <span className="relative font-body text-xs tracking-luxury uppercase text-primary-foreground">
            Order Now
          </span>
        </MagneticButton>
        <MagneticButton
          className="group relative px-4 py-3 overflow-hidden"
          onClick={() => onOrder(product)}
        >
          <span className="absolute inset-0 border border-accent/50 group-hover:border-accent transition-colors duration-500" />
          <span className="relative font-body text-xs tracking-luxury uppercase text-accent group-hover:text-foreground transition-colors duration-500">
            Inquire
          </span>
        </MagneticButton>
      </div>
    </motion.div>
  );
};

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleOrder = (product: Product) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-accent/10"
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-body text-xs tracking-luxury uppercase">Back</span>
            </Link>

            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <span className="font-display text-xl tracking-widest text-foreground">
                ELIX LUMI
              </span>
            </Link>

            <div className="w-16" />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-4 font-body text-xs tracking-luxury text-accent uppercase mb-6"
            >
              <span className="w-8 h-px bg-accent/50" />
              Shop Collection
              <span className="w-8 h-px bg-accent/50" />
            </motion.span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-light text-foreground mb-4">
              Our <span className="italic text-gradient-scarlet">Fragrances</span>
            </h1>
            <p className="font-body text-muted-foreground max-w-lg mx-auto">
              Discover our curated collection of luxury perfumes, each crafted with the finest
              ingredients.
            </p>
          </motion.div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-body text-muted-foreground text-lg">
                No fragrances available at the moment.
              </p>
              <p className="font-body text-muted-foreground text-sm mt-2">
                Please check back soon or contact us on WhatsApp.
              </p>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onOrder={handleOrder} />
                ))}
              </div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mt-20 text-center"
              >
                <p className="font-body text-sm text-muted-foreground mb-6">
                  Need help choosing? Contact us for personalized recommendations.
                </p>
                <Link to="/#philosophy">
                  <MagneticButton className="group relative px-8 py-4 overflow-hidden">
                    <span className="absolute inset-0 border border-accent/40 group-hover:border-accent transition-colors duration-500" />
                    <span className="relative font-body text-sm tracking-luxury uppercase text-accent group-hover:text-foreground transition-colors duration-500">
                      Learn About Our Philosophy
                    </span>
                  </MagneticButton>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Order Modal */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        selectedProduct={
          selectedProduct
            ? {
                name: selectedProduct.name,
                price: formatPrice(selectedProduct.price),
                size: selectedProduct.size || "50ml",
              }
            : undefined
        }
      />
    </div>
  );
};

export default Shop;
