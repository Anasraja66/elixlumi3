import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const ORDER_API_URL = import.meta.env.VITE_ORDER_API_URL || "/api/submit-order";

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: {
    name: string;
    price: string;
    size: string;
  };
}

const OrderFormModal = ({ isOpen, onClose, selectedProduct }: OrderFormModalProps) => {
  const [formType, setFormType] = useState<"inquiry" | "order">("inquiry");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    quantity: 1,
    notes: "",
  });

  // Reset form when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        address: "",
        quantity: 1,
        notes: "",
      });
      setFormType("inquiry");
      setIsSuccess(false);
    }
  }, [isOpen, selectedProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Please fill in your name and phone number.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone format
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        city: formData.city || undefined,
        address: formData.address || undefined,
        quantity: formData.quantity,
        notes: formData.notes || undefined,
        formType: formType,
        product: selectedProduct ? {
          name: selectedProduct.name,
          price: selectedProduct.price,
          size: selectedProduct.size,
        } : undefined,
      };

      const response = await fetch(ORDER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to submit order");
      }

      setIsSuccess(true);

      // Calculate total for WhatsApp message
      const priceValue = selectedProduct
        ? parseFloat(selectedProduct.price.replace(/[^0-9.]/g, ""))
        : 0;
      const totalAmount = priceValue * formData.quantity;

      // Send to WhatsApp as well
      const whatsappMessage = encodeURIComponent(
        `New ${formType === "inquiry" ? "Inquiry" : "Order"}!\n\n` +
        `Name: ${formData.name}\n` +
        `Phone: ${formData.phone}\n` +
        (formData.email ? `Email: ${formData.email}\n` : "") +
        (selectedProduct ? `Product: ${selectedProduct.name} (${selectedProduct.size})\n` : "") +
        (formType === "order" ? `Quantity: ${formData.quantity}\n` : "") +
        (formData.city ? `City: ${formData.city}\n` : "") +
        (formData.address ? `Address: ${formData.address}\n` : "") +
        (formData.notes ? `Notes: ${formData.notes}\n` : "") +
        (formType === "order" ? `Total: PKR ${totalAmount.toLocaleString()}` : "")
      );

      // Open WhatsApp in new tab
      window.open(`https://wa.me/923429003706?text=${whatsappMessage}`, "_blank");

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setFormData({
          name: "",
          email: "",
          phone: "",
          city: "",
          address: "",
          quantity: 1,
          notes: "",
        });
      }, 2000);

    } catch (error) {
      console.error("Order submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again or contact us on WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-accent/20 rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-card border-b border-accent/10">
              <div>
                <h2 className="font-display text-2xl text-foreground">
                  {formType === "inquiry" ? "Make an Inquiry" : "Place Your Order"}
                </h2>
                {selectedProduct && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProduct.name} - {selectedProduct.price}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="font-display text-xl text-foreground mb-2">
                  {formType === "inquiry" ? "Inquiry Sent!" : "Order Placed!"}
                </h3>
                <p className="text-muted-foreground">
                  We'll contact you shortly via WhatsApp.
                </p>
              </div>
            ) : (
              <>
                {/* Form Type Toggle */}
                <div className="flex gap-2 p-4 bg-muted/20">
                  <button
                    onClick={() => setFormType("inquiry")}
                    className={`flex-1 py-2 px-4 text-sm font-body tracking-wide uppercase rounded transition-all ${formType === "inquiry"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Quick Inquiry
                  </button>
                  <button
                    onClick={() => setFormType("order")}
                    className={`flex-1 py-2 px-4 text-sm font-body tracking-wide uppercase rounded transition-all ${formType === "order"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Full Order
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                        required
                        className="bg-muted/20 border-accent/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+92 300 1234567"
                        required
                        className="bg-muted/20 border-accent/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>

                  {formType === "order" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Your city"
                            className="bg-muted/20 border-accent/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            className="bg-muted/20 border-accent/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Delivery Address</Label>
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Full delivery address"
                          rows={2}
                          className="bg-muted/20 border-accent/20"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {formType === "inquiry" ? "Your Message" : "Order Notes"}
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder={
                        formType === "inquiry"
                          ? "What would you like to know?"
                          : "Any special instructions?"
                      }
                      rows={3}
                      className="bg-muted/20 border-accent/20"
                    />
                  </div>

                  {formType === "order" && selectedProduct && (
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Amount</span>
                        <span className="font-display text-xl text-primary">
                          PKR {(
                            parseFloat(selectedProduct.price.replace(/[^0-9.]/g, "")) *
                            formData.quantity
                          ).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cash on Delivery
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : formType === "inquiry" ? (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Inquiry
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    We'll confirm your {formType === "inquiry" ? "inquiry" : "order"} via WhatsApp
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderFormModal;
