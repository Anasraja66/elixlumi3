import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";


interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders: any[];
}

const AdminDashboard = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("elixlumi_admin_token");
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      label: "Total Revenue",
      value: `PKR ${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-scarlet",
      bgColor: "bg-scarlet/10",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent/20 text-accent";
      case "pending":
        return "bg-gold/20 text-gold";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin panel</p>
        </div>
        <button 
          onClick={() => onNavigate("products")}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Package className="w-5 h-5" />
          <span className="font-medium">Manage Products</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-accent/10 rounded-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-display text-2xl text-foreground">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-accent/10 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-accent/10">
          <h2 className="font-display text-xl text-foreground">Recent Orders</h2>
        </div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/10">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/10">
                    <td className="p-4 text-sm text-foreground">{order.order_number}</td>
                    <td className="p-4 text-sm text-muted-foreground">{order.customer_name}</td>
                    <td className="p-4 text-sm text-foreground">
                      PKR {order.total_amount?.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
