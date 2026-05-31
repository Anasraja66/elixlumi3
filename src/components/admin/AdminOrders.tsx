import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "@/hooks/use-toast";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_city: string | null;
  customer_address: string | null;
  products: any;
  total_amount: number;
  status: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("elixlumi_admin_token");
      const response = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("elixlumi_admin_token");
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order");
      toast({ title: "Success", description: "Order status updated." });
      fetchOrders();

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-gold" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent/20 text-accent";
      case "pending":
        return "bg-gold/20 text-gold";
      case "processing":
        return "bg-primary/20 text-primary";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      case "inquiry":
        return "bg-muted/20 text-muted-foreground";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      (order.customer_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_city || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="font-display text-2xl md:text-3xl text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders and inquiries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order #, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/20 border-accent/20"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-muted/20 border-accent/20">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="inquiry">Inquiry</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-accent/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr>
                <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/10">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/10">
                  <td className="p-4 text-sm text-foreground font-medium">
                    {order.order_number}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm text-foreground">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                      {order.customer_email && (
                        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    PKR {order.total_amount?.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No orders found.
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-accent/20 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-accent/10">
              <h2 className="font-display text-xl text-foreground">
                Order {selectedOrder.order_number}
              </h2>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Update Status</label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                >
                  <SelectTrigger className="bg-muted/20 border-accent/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inquiry">Inquiry</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Customer</h3>
                <div className="bg-muted/10 p-4 rounded-lg space-y-1">
                  <p className="text-sm text-foreground">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                  )}
                  {selectedOrder.customer_city && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer_city}</p>
                  )}
                  {selectedOrder.customer_address && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer_address}</p>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Products</h3>
                <div className="bg-muted/10 p-4 rounded-lg">
                  {Array.isArray(selectedOrder.products) && selectedOrder.products.length > 0 ? (
                    selectedOrder.products.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          {item.name} x{item.quantity || 1}
                        </span>
                        <span className="text-muted-foreground">{item.price}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No products specified</p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4 border-t border-accent/10">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-display text-xl text-primary">
                  PKR {selectedOrder.total_amount?.toLocaleString()}
                </span>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">Notes</h3>
                  <p className="text-sm text-muted-foreground bg-muted/10 p-4 rounded-lg">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              <Button
                onClick={() => setSelectedOrder(null)}
                className="w-full"
                variant="outline"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
