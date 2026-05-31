import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import OrderFormModal from "@/components/OrderFormModal";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";


interface Product {
  id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  long_description: string | null;
  price: number;
  original_price: number | null;
  discount_label: string | null;
  size: string | null;
  image_url: string | null;
  images: string[] | null;
  video_url: string | null;
  notes_top: string[] | null;
  notes_heart: string[] | null;
  notes_base: string[] | null;
  longevity: string | null;
  sillage: string | null;
  season: string | null;
  occasion: string | null;
  available: boolean | null;
}

const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setSelectedImageIndex(0);

      try {
        // Fetch the specific product
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          if (response.status === 404) setNotFound(true);
          throw new Error("Failed to fetch product");
        }
        const productData = await response.json();
        setProduct(productData as Product);
        setNotFound(false);

        // Fetch other products for recommendations
        const othersResponse = await fetch("/api/products");
        if (othersResponse.ok) {
          const othersData = await othersResponse.json();
          setAllProducts((othersData as Product[]).filter(p => p.id !== productId).slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The fragrance you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/shop">
            <MagneticButton className="px-8 py-4 bg-primary">
              <span className="font-body text-sm tracking-luxury uppercase text-primary-foreground">
                Back to Shop
              </span>
            </MagneticButton>
          </Link>
        </div>
      </div>
    );
  }

  // Combine main image + gallery images
  // Combine video + main image + gallery images
  const galleryItems = [
    ...(product.video_url ? [{ type: 'video', url: product.video_url }] : []),
    ...(product.image_url ? [{ type: 'image', url: product.image_url }] : []),
    ...(product.images || []).map(img => ({ type: 'image', url: img })),
  ];

  const goToPrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : galleryItems.length - 1));
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev < galleryItems.length - 1 ? prev + 1 : 0));
  };

  const hasCharacteristics =
    product.longevity || product.sillage || product.season || product.occasion;
  const hasNotes =
    (product.notes_top && product.notes_top.length > 0) ||
    (product.notes_heart && product.notes_heart.length > 0) ||
    (product.notes_base && product.notes_base.length > 0);

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
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-body text-xs tracking-luxury uppercase">Back</span>
            </button>

            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <span className="font-display text-xl tracking-widest text-foreground">
                ELIX LUMI
              </span>
            </Link>

            <Link
              to="/shop"
              className="font-body text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              All Products
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-6">
          {/* Product Section */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Main Image */}
              <div ref={imageContainerRef} className="relative aspect-square overflow-hidden group">
                {/* Frame */}
                <div className="absolute inset-4 border border-accent/20 z-10 pointer-events-none" />

                {galleryItems.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                      >
                        {galleryItems[selectedImageIndex].type === 'video' ? (
                          <video
                            src={galleryItems[selectedImageIndex].url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={galleryItems[selectedImageIndex].url}
                            alt={`${product.name} - View ${selectedImageIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {galleryItems.length > 1 && (
                      <>
                        <motion.button
                          onClick={goToPrevImage}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-background/80 backdrop-blur-sm border border-accent/30 hover:border-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                          aria-label="Previous item"
                        >
                          <ChevronLeft className="w-5 h-5 text-muted-foreground hover:text-primary" />
                        </motion.button>
                        <motion.button
                          onClick={goToNextImage}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-background/80 backdrop-blur-sm border border-accent/30 hover:border-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                          aria-label="Next item"
                        >
                          <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-primary" />
                        </motion.button>

                        {/* Item Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full border border-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="font-body text-xs text-muted-foreground">
                            {selectedImageIndex + 1} / {galleryItems.length}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                    <span className="text-muted-foreground">No Media Available</span>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
              </div>

              {/* Thumbnail Gallery */}
              {galleryItems.length > 1 && (
                <div className="flex gap-3 justify-center flex-wrap">
                  {galleryItems.map((item, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative w-20 h-20 md:w-24 md:h-24 overflow-hidden transition-all duration-300 ${
                        selectedImageIndex === index
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "opacity-50 hover:opacity-100"
                      }`}
                    >
                      {item.type === 'video' ? (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8 lg:sticky lg:top-32 lg:self-start"
            >
              {/* Subtitle Badge */}
              {product.subtitle && (
                <div className="inline-flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="font-body text-xs tracking-luxury text-accent uppercase">
                    {product.subtitle}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground">
                {product.name}
              </h1>

              {/* Price & Size */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-4 flex-wrap">
                  <span className="font-display text-3xl md:text-4xl text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price && (
                    <span className="font-display text-xl text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                  {product.discount_label && (
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground font-body text-xs tracking-luxury uppercase">
                      {product.discount_label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {product.size && (
                    <span className="font-body text-sm text-muted-foreground tracking-wide uppercase">
                      {product.size} / Extrait de Parfum
                    </span>
                  )}
                  <span className="px-2 py-0.5 border border-accent/30 font-body text-xs tracking-luxury uppercase text-accent">
                    ⏱ {product.longevity || "10–12 hrs"} lasting
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-24 h-px bg-gradient-to-r from-primary to-transparent" />

              {/* Description */}
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                {product.long_description ||
                  product.description ||
                  "A luxury fragrance by Elix Lumi."}
              </p>

              {/* Fragrance Notes */}
              {hasNotes && (
                <div className="space-y-4 p-6 bg-card/50 border border-accent/10">
                  <h3 className="font-body text-xs tracking-luxury text-muted-foreground uppercase">
                    Fragrance Pyramid
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    {product.notes_top && product.notes_top.length > 0 && (
                      <div className="space-y-3">
                        <span className="font-display text-sm text-primary">Top Notes</span>
                        <ul className="space-y-1.5">
                          {product.notes_top.map((note) => (
                            <li key={note} className="font-body text-sm text-foreground">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product.notes_heart && product.notes_heart.length > 0 && (
                      <div className="space-y-3">
                        <span className="font-display text-sm text-accent">Heart Notes</span>
                        <ul className="space-y-1.5">
                          {product.notes_heart.map((note) => (
                            <li key={note} className="font-body text-sm text-foreground">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product.notes_base && product.notes_base.length > 0 && (
                      <div className="space-y-3">
                        <span className="font-display text-sm text-gold">Base Notes</span>
                        <ul className="space-y-1.5">
                          {product.notes_base.map((note) => (
                            <li key={note} className="font-body text-sm text-foreground">
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Characteristics */}
              {hasCharacteristics && (
                <div className="grid grid-cols-2 gap-4">
                  {product.longevity && (
                    <div className="p-4 bg-muted/20 border border-accent/10">
                      <span className="font-body text-[10px] tracking-luxury text-muted-foreground uppercase block mb-1">
                        Longevity
                      </span>
                      <span className="font-display text-lg text-foreground">
                        {product.longevity}
                      </span>
                    </div>
                  )}
                  {product.sillage && (
                    <div className="p-4 bg-muted/20 border border-accent/10">
                      <span className="font-body text-[10px] tracking-luxury text-muted-foreground uppercase block mb-1">
                        Sillage
                      </span>
                      <span className="font-display text-lg text-foreground">
                        {product.sillage}
                      </span>
                    </div>
                  )}
                  {product.season && (
                    <div className="p-4 bg-muted/20 border border-accent/10">
                      <span className="font-body text-[10px] tracking-luxury text-muted-foreground uppercase block mb-1">
                        Best Season
                      </span>
                      <span className="font-display text-lg text-foreground">
                        {product.season}
                      </span>
                    </div>
                  )}
                  {product.occasion && (
                    <div className="p-4 bg-muted/20 border border-accent/10">
                      <span className="font-body text-[10px] tracking-luxury text-muted-foreground uppercase block mb-1">
                        Occasion
                      </span>
                      <span className="font-display text-lg text-foreground">
                        {product.occasion}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <MagneticButton
                  className="group relative flex-1 px-8 py-5 bg-primary overflow-hidden"
                  onClick={() => setIsOrderModalOpen(true)}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-scarlet to-primary bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500" />
                  <span className="relative font-body text-sm tracking-luxury uppercase text-primary-foreground">
                    Order Now
                  </span>
                </MagneticButton>
                <MagneticButton
                  className="group relative px-8 py-5 overflow-hidden"
                  onClick={() => setIsOrderModalOpen(true)}
                >
                  <span className="absolute inset-0 border border-accent/50 group-hover:border-accent transition-colors duration-500" />
                  <span className="relative font-body text-sm tracking-luxury uppercase text-accent group-hover:text-foreground transition-colors duration-500">
                    Inquire
                  </span>
                </MagneticButton>
              </div>
            </motion.div>
          </div>

          {/* Other Products */}
          {allProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-4 font-body text-xs tracking-luxury text-accent uppercase mb-4">
                  <span className="w-8 h-px bg-accent/50" />
                  You May Also Like
                  <span className="w-8 h-px bg-accent/50" />
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-foreground">
                  Explore More
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allProducts.map((p) => {
                  const mainImg = p.image_url || (p.images && p.images[0]) || null;
                  return (
                    <Link key={p.id} to={`/product/${p.id}`} className="group">
                      <motion.div
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="bg-card/50 border border-accent/10 group-hover:border-accent/30 transition-all duration-500 overflow-hidden"
                      >
                        <div className="relative aspect-square overflow-hidden">
                          {mainImg ? (
                            <img
                              src={mainImg}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted/20" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            {p.subtitle && (
                              <span className="font-body text-[10px] tracking-luxury text-accent uppercase">
                                {p.subtitle}
                              </span>
                            )}
                            <h3 className="font-display text-2xl text-foreground">{p.name}</h3>
                            <span className="font-display text-lg text-primary">
                              {formatPrice(p.price)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
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
        selectedProduct={{
          name: product.name,
          price: formatPrice(product.price),
          size: product.size || "50ml",
        }}
      />
    </div>
  );
};

export default ProductDetail;
