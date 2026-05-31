import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Search, Loader2, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { toast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";
import MultiImageUpload from "./MultiImageUpload";
import VideoUpload from "./VideoUpload";

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
  sort_order: number | null;
  is_featured: boolean | null;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultForm = {
    name: "",
    subtitle: "",
    description: "",
    long_description: "",
    price: "",
    original_price: "",
    discount_label: "",
    size: "50ml",
    image_url: "",
    images: [] as string[],
    video_url: "",
    notes_top: "",
    notes_heart: "",
    notes_base: "",
    longevity: "10-12 hours",
    sillage: "Strong",
    season: "",
    occasion: "",
    available: true,
    sort_order: 0,
    is_featured: false,
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ ...defaultForm, sort_order: products.length });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      subtitle: product.subtitle || "",
      description: product.description || "",
      long_description: product.long_description || "",
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      discount_label: product.discount_label || "",
      size: product.size || "50ml",
      image_url: product.image_url || "",
      images: product.images || [],
      video_url: product.video_url || "",
      notes_top: Array.isArray(product.notes_top) ? product.notes_top.join(", ") : "",
      notes_heart: Array.isArray(product.notes_heart) ? product.notes_heart.join(", ") : "",
      notes_base: Array.isArray(product.notes_base) ? product.notes_base.join(", ") : "",
      longevity: product.longevity || "10-12 hours",
      sillage: product.sillage || "Strong",
      season: product.season || "",
      occasion: product.occasion || "",
      available: product.available ?? true,
      sort_order: product.sort_order || 0,
      is_featured: !!product.is_featured,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const productData = {
        name: formData.name,
        subtitle: formData.subtitle || null,
        description: formData.description || null,
        long_description: formData.long_description || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        discount_label: formData.discount_label || null,
        size: formData.size,
        image_url: formData.image_url || null,
        images: formData.images,
        video_url: formData.video_url || null,
        notes_top: formData.notes_top
          ? formData.notes_top.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        notes_heart: formData.notes_heart
          ? formData.notes_heart.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        notes_base: formData.notes_base
          ? formData.notes_base.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        longevity: formData.longevity || null,
        sillage: formData.sillage || null,
        season: formData.season || null,
        occasion: formData.occasion || null,
        available: formData.available,
        sort_order: Number(formData.sort_order),
        is_featured: formData.is_featured,
      };

      const token = localStorage.getItem("elixlumi_admin_token");
      if (!token) throw new Error("Not authenticated");

      const endpoint = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error("Failed to save product");

      toast({ 
        title: "✅ Success", 
        description: editingProduct ? "Product updated successfully." : "Product added successfully." 
      });

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("elixlumi_admin_token");
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete product");
      toast({ title: "✅ Deleted", description: "Product deleted successfully." });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your fragrance collection — {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/20 border-accent/20"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-accent/10 rounded-lg overflow-hidden"
          >
            <div className="relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-muted/20 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No image uploaded</span>
                </div>
              )}
              {product.images && product.images.length > 0 && (
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs text-foreground flex items-center gap-1">
                  <Images className="w-3 h-3" />
                  +{product.images.length}
                </div>
              )}
              {product.discount_label && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded font-medium">
                  {product.discount_label}
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg text-foreground">{product.name}</h3>
                  {product.subtitle && (
                    <p className="text-sm text-muted-foreground">{product.subtitle}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    product.available
                      ? "bg-accent/20 text-accent"
                      : "bg-muted/20 text-muted-foreground"
                  }`}
                >
                  {product.available ? "Live" : "Hidden"}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-primary font-display text-xl">
                  PKR {product.price.toLocaleString()}
                </p>
                {product.original_price && (
                  <p className="text-muted-foreground text-sm line-through">
                    PKR {product.original_price.toLocaleString()}
                  </p>
                )}
              </div>
              {product.size && (
                <p className="text-xs text-muted-foreground mt-1">{product.size}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(product)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "No products match your search." : "No products yet. Click 'Add Product' to get started."}
          </p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-accent/20 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-accent/10 sticky top-0 bg-card z-10">
              <h2 className="font-display text-xl text-foreground">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {editingProduct
                  ? "Update product details below"
                  : "Fill in the details to add a new fragrance"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* ── BASIC INFO ── */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-accent/10">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Product Name *</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Signature"
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subtitle / Tagline</Label>
                      <Input
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleInputChange}
                        placeholder="e.g., The Original"
                        className="bg-muted/20 border-accent/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Input
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        placeholder="50ml"
                        className="bg-muted/20 border-accent/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Short Description</Label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Brief description shown on shop cards..."
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Full Description (Product Detail Page)</Label>
                    <Textarea
                      name="long_description"
                      value={formData.long_description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Detailed description shown on the product detail page..."
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>
                </div>
              </div>

              {/* ── PRICING ── */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-accent/10">
                  Pricing
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sale Price (PKR) *</Label>
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 2800"
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Original Price (PKR)</Label>
                    <Input
                      name="original_price"
                      type="number"
                      value={formData.original_price}
                      onChange={handleInputChange}
                      placeholder="e.g., 3500"
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>
                </div>
                {formData.original_price && formData.price && Number(formData.original_price) > Number(formData.price) && (
                  <div className="mt-2 p-2 bg-accent/10 border border-accent/20 rounded text-xs text-accent flex justify-between items-center">
                    <span>Client Savings:</span>
                    <span className="font-bold">PKR {(Number(formData.original_price) - Number(formData.price)).toLocaleString()} ({Math.round(((Number(formData.original_price) - Number(formData.price)) / Number(formData.original_price)) * 100)}% OFF)</span>
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  <Label>Discount Label</Label>
                  <Input
                    name="discount_label"
                    value={formData.discount_label}
                    onChange={handleInputChange}
                    placeholder="e.g., 20% OFF"
                    className="bg-muted/20 border-accent/20 max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown as a badge on the product card (leave empty to hide)
                  </p>
                </div>
              </div>

              {/* ── IMAGES ── */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-accent/10">
                  Images
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Main Product Image</Label>
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Product Video (Optional)</Label>
                    <VideoUpload
                      value={formData.video_url}
                      onChange={(url) => setFormData((prev) => ({ ...prev, video_url: url }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gallery Images / Carousel (up to 10 additional images)</Label>
                    <MultiImageUpload
                      values={formData.images}
                      onChange={(urls) => setFormData((prev) => ({ ...prev, images: urls }))}
                      maxImages={10}
                    />
                  </div>
                </div>
              </div>

              {/* ── FRAGRANCE NOTES ── */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-accent/10">
                  Fragrance Notes (comma separated)
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Top Notes</Label>
                    <Input
                      name="notes_top"
                      value={formData.notes_top}
                      onChange={handleInputChange}
                      placeholder="Bergamot, Pink Pepper, Saffron"
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heart Notes</Label>
                    <Input
                      name="notes_heart"
                      value={formData.notes_heart}
                      onChange={handleInputChange}
                      placeholder="Rose, Jasmine, Oud"
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Base Notes</Label>
                    <Input
                      name="notes_base"
                      value={formData.notes_base}
                      onChange={handleInputChange}
                      placeholder="Amber, Sandalwood, Musk"
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>
                </div>
              </div>

              {/* ── CHARACTERISTICS ── */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-accent/10">
                  Fragrance Characteristics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Longevity</Label>
                    <Input
                      name="longevity"
                      value={formData.longevity}
                      onChange={handleInputChange}
                      placeholder="10-12 hours"
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sillage (Strength)</Label>
                    <Input
                      name="sillage"
                      value={formData.sillage}
                      onChange={handleInputChange}
                      placeholder="Strong"
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Best Season</Label>
                    <Input
                      name="season"
                      value={formData.season}
                      onChange={handleInputChange}
                      placeholder="Fall / Winter"
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Best Occasion</Label>
                    <Input
                      name="occasion"
                      value={formData.occasion}
                      onChange={handleInputChange}
                      placeholder="Evening / Special Events"
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>
                </div>
              </div>

              {/* ── SETTINGS ── */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-accent/10">
                  Settings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input
                      name="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      className="bg-muted/20 border-accent/20"
                    />
                    <p className="text-xs text-muted-foreground">Lower number = shown first</p>
                  </div>
                  <div className="flex items-center gap-3 pt-8">
                    <Switch
                      checked={formData.available}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, available: checked }))
                      }
                    />
                    <div>
                      <Label>Show on website</Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.available ? "Product is visible" : "Product is hidden"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_featured: checked }))
                      }
                    />
                    <div>
                      <Label>Featured Product</Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.is_featured ? "Shown in main home grid" : "Regular listing"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── BUTTONS ── */}
              <div className="flex gap-3 pt-4 border-t border-accent/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                  ) : editingProduct ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
