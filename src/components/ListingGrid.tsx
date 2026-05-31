import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import OrderFormModal from "./OrderFormModal";

interface Product {
  id: number;
  name: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  discount_label: string | null;
  size: string | null;
  image_url: string | null;
  images: string[] | null;
  longevity: string | null;
  available: boolean;
}

const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

const ProductCard = ({ product, onOrder }: { product: Product; onOrder: (p: Product) => void }) => {
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
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {allImages.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImageIndex}
                src={allImages[selectedImageIndex]}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            {allImages.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.preventDefault(); setSelectedImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1); }} className="p-1.5 bg-white/90 rounded-full shadow-sm"><ChevronLeft size={16}/></button>
                <button onClick={(e) => { e.preventDefault(); setSelectedImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0); }} className="p-1.5 bg-white/90 rounded-full shadow-sm"><ChevronRight size={16}/></button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">No Image</div>
        )}
        {product.discount_label && <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">{product.discount_label}</div>}
      </div>

      <Link to={`/product/${product.id}`} className="p-5 flex-1 flex flex-col">
        <h3 className="font-sans font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{product.name}</h3>
        <div className="mt-auto pt-2 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
            {product.original_price && <span className="text-sm text-slate-400 line-through">{formatPrice(product.original_price)}</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{product.size || "50ml"}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>{product.longevity || "10-12 hrs"} lasting</span>
          </div>
        </div>
      </Link>
      <div className="px-5 pb-5 pt-0">
        <button onClick={() => onOrder(product)} className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors">Order Now</button>
      </div>
    </motion.div>
  );
};

const ListingGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data.filter((p: any) => p.available).sort((a: any, b: any) => a.sort_order - b.sort_order));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (products.length === 0) return null;

  return (
    <section className="py-32 bg-[#0a0a0a] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.4em] block"
            >
              Curated Selection
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-display text-white"
            >
              Latest <span className="italic text-slate-400 font-light">Listings</span>
            </motion.h2>
          </div>
          <Link to="/shop" className="group flex items-center gap-4 text-white/50 hover:text-white transition-all font-body text-xs uppercase tracking-widest pb-2">
            Explore All Fragrances <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} onOrder={(prod) => { setSelectedProduct(prod); setIsOrderModalOpen(true); }} />)}
        </div>
      </div>
      {selectedProduct && <OrderFormModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} selectedProduct={{ name: selectedProduct.name, price: formatPrice(selectedProduct.price), size: selectedProduct.size || "50ml" }} />}
    </section>
  );
};

export default ListingGrid;
