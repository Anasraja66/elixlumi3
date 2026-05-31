import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, Loader2, ArrowRight } from "lucide-react";
import OrderFormModal from "./OrderFormModal";
import { Link } from "react-router-dom";

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  size: string;
  image_url: string;
  category: string;
  available: boolean;
  is_featured: boolean;
}

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL PERFUMES");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = ["ALL PERFUMES", "WOMEN'S", "UNISEX", "BATH & BODY"];

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
        price: p.price,
        originalPrice: p.original_price,
        discount: p.discount_label,
        size: p.size || "50ml",
        image_url: p.image_url,
        category: p.category || (p.subtitle?.toUpperCase().includes("WOMEN") ? "WOMEN'S" : "UNISEX"),
        available: Boolean(p.available),
        is_featured: Boolean(p.is_featured),
      }));

      setProducts(mapped);
      // Initial state: Only show Featured products (max 4)
      const featured = mapped.filter((p: Product) => p.available && p.is_featured);
      setFilteredProducts(featured.length > 0 ? featured.slice(0, 4) : mapped.filter((p: Product) => p.available).slice(0, 4));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    let result = products.filter(p => p.available);
    
    if (activeCategory !== "ALL PERFUMES") {
      result = result.filter(p => p.category.toUpperCase() === activeCategory);
    }
    
    // For Home page, we only show first 4 or featured
    if (activeCategory === "ALL PERFUMES") {
        const featured = result.filter(p => p.is_featured);
        setFilteredProducts(featured.length > 0 ? featured.slice(0, 4) : result.slice(0, 4));
    } else {
        setFilteredProducts(result.slice(0, 4));
    }
  }, [activeCategory, products]);

  const handleOrder = (product: Product) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="py-32 flex justify-center items-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section id="collection" className="py-24 bg-background transition-colors duration-500">
      <div className="container mx-auto px-8 lg:px-16">
        
        {/* Category Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 border-b border-foreground/5 pb-6 gap-8">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 lg:gap-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative font-ui text-[10px] tracking-[0.3em] uppercase font-bold transition-all duration-300 ${
                  activeCategory === cat ? "text-foreground" : "text-foreground/30 hover:text-foreground/60"
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute -bottom-[26px] left-0 right-0 h-0.5 bg-foreground"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <Link 
            to="/shop"
            className="flex items-center gap-3 font-ui text-[10px] tracking-[0.3em] uppercase font-bold text-foreground/40 hover:text-foreground transition-colors group"
          >
            <span>Explore All</span>
            <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
          </Link>
        </div>

        {/* Product Grid - Limited to 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group flex flex-col"
              >
                {/* Product Image Card */}
                <Link to={`/product/${product.id}`} className="relative aspect-[4/5] bg-[#F5F5F3] overflow-hidden mb-6 flex items-center justify-center p-8 transition-all duration-700 group-hover:bg-[#EBEBE9]">
                  <motion.img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110"
                  />
                  
                  {/* Badge for Featured */}
                  {product.is_featured && (
                    <div className="absolute top-4 left-4 font-ui text-[7px] tracking-widest font-black bg-primary text-white px-3 py-1 rounded-full shadow-lg">
                      FEATURED
                    </div>
                  )}
                  
                  {/* Quick Order Hover Overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <button 
                      onClick={(e) => { e.preventDefault(); handleOrder(product); }}
                      className="bg-white text-black font-ui text-[10px] tracking-widest font-bold px-8 py-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-black hover:text-white"
                    >
                      ORDER NOW
                    </button>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="text-center space-y-2">
                  <h3 className="font-display text-2xl lg:text-3xl text-foreground font-light tracking-tight group-hover:text-primary transition-colors">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h3>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-ui text-sm text-foreground/40 font-bold">
                      PKR {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="font-ui text-xs text-foreground/20 line-through font-medium">
                        PKR {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <p className="font-display text-2xl text-foreground/20 italic">No products found in this category.</p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <OrderFormModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          selectedProduct={{
            name: selectedProduct.name,
            price: `PKR ${selectedProduct.price.toLocaleString()}`,
            size: selectedProduct.size,
          }}
        />
      )}
    </section>
  );
};

export default ProductCatalog;
