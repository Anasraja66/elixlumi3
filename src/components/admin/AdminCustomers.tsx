import { useState, useEffect } from "react";
import { Search, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

import { toast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  city: string | null;
  address: string | null;
  total_orders: number | null;
  created_at: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("elixlumi_admin_token");
      // Derive unique customers from orders
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const orders = await response.json();
      // Deduplicate by phone
      const seen = new Set();
      const derived = orders
        .filter((o: any) => {
          if (seen.has(o.customer_phone)) return false;
          seen.add(o.customer_phone);
          return true;
        })
        .map((o: any) => ({
          id: o.id,
          name: o.customer_name,
          email: o.customer_email,
          phone: o.customer_phone,
          city: o.customer_city,
          address: o.customer_address,
          total_orders: orders.filter((x: any) => x.customer_phone === o.customer_phone).length,
          created_at: o.created_at,
        }));
      setCustomers(derived);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-foreground">Customers</h1>
        <p className="text-muted-foreground">View and manage customer information</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/20 border-accent/20"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-card border border-accent/10 rounded-lg p-6 space-y-4"
          >
            <div>
              <h3 className="font-display text-lg text-foreground">{customer.name}</h3>
              <p className="text-xs text-muted-foreground">
                Customer since {new Date(customer.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <a
                  href={`tel:${customer.phone}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {customer.phone}
                </a>
              </div>

              {customer.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-muted-foreground hover:text-foreground transition-colors truncate"
                  >
                    {customer.email}
                  </a>
                </div>
              )}

              {customer.city && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{customer.city}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-accent/10">
              <span className="text-xs text-muted-foreground">
                Total Orders: {customer.total_orders || 0}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No customers found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
