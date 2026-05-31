import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingCart, DollarSign, Users } from "lucide-react";


interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  ordersByStatus: { status: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    ordersByStatus: [],
    revenueByMonth: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("elixlumi_admin_token");
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const orders = await response.json();

      const totalRevenue = orders
        .filter((o: any) => o.status !== "cancelled")
        .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Count by status
      const statusCounts: Record<string, number> = {};
      orders.forEach((order: any) => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

      // Revenue by month
      const monthlyRevenue: Record<string, number> = {};
      orders
        .filter((o: any) => o.status !== "cancelled")
        .forEach((order: any) => {
          const month = new Date(order.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (order.total_amount || 0);
        });
      const revenueByMonth = Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })).slice(-6);

      // Unique customers by phone
      const uniquePhones = new Set(orders.map((o: any) => o.customer_phone));

      setAnalytics({ totalRevenue, totalOrders, averageOrderValue, totalCustomers: uniquePhones.size, ordersByStatus, revenueByMonth });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent";
      case "pending":
        return "bg-gold";
      case "processing":
        return "bg-primary";
      case "cancelled":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Revenue",
      value: `PKR ${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Total Orders",
      value: analytics.totalOrders,
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Avg. Order Value",
      value: `PKR ${Math.round(analytics.averageOrderValue).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      label: "Total Customers",
      value: analytics.totalCustomers,
      icon: Users,
      color: "text-scarlet",
      bgColor: "bg-scarlet/10",
    },
  ];

  const maxRevenue = Math.max(...analytics.revenueByMonth.map((r) => r.revenue), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Business performance overview</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-card border border-accent/10 rounded-lg p-6">
          <h2 className="font-display text-xl text-foreground mb-6">Orders by Status</h2>
          <div className="space-y-4">
            {analytics.ordersByStatus.map((item) => {
              const percentage = (item.count / analytics.totalOrders) * 100 || 0;
              return (
                <div key={item.status} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-foreground">{item.status}</span>
                    <span className="text-muted-foreground">{item.count} orders</span>
                  </div>
                  <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`h-full rounded-full ${getStatusColor(item.status)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-card border border-accent/10 rounded-lg p-6">
          <h2 className="font-display text-xl text-foreground mb-6">Monthly Revenue</h2>
          <div className="flex items-end gap-2 h-48">
            {analytics.revenueByMonth.length > 0 ? (
              analytics.revenueByMonth.map((item, index) => {
                const height = (item.revenue / maxRevenue) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="w-full bg-primary rounded-t-md min-h-[4px]"
                    />
                    <span className="text-xs text-muted-foreground mt-2 text-center">
                      {item.month}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">No data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
