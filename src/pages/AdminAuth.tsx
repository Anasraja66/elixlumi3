import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Sign Up for demo
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    adminSecret: "",
  });

  useEffect(() => {
    // Check if already logged in via local token
    const token = localStorage.getItem("elixlumi_admin_token");
    if (token) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/admin/login" : "/api/admin/signup";
      
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        if (!formData.adminSecret) {
          throw new Error("Admin Secret Key is required for signup.");
        }
      }

      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, adminSecret: formData.adminSecret };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (isLogin) {
        localStorage.setItem("elixlumi_admin_token", data.token);
        localStorage.setItem("elixlumi_admin_user", JSON.stringify(data.user));
        toast({ title: "Welcome back!", description: "Redirecting to admin panel..." });
        navigate("/admin");
      } else {
        toast({ title: "Success!", description: "Account created. You can now sign in." });
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "", adminSecret: "" }));
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-foreground mb-2">
            ELIX LUMI
          </h1>
          <p className="text-muted-foreground">Admin Panel</p>
        </div>

        <div className="bg-card border border-accent/20 rounded-lg p-8">
          <h2 className="font-display text-xl text-foreground mb-6 text-center">
            {isLogin ? "Sign In" : "Create Account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@elixlumi.com"
                required
                className="bg-muted/20 border-accent/20"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label>Admin Secret Key</Label>
                <Input 
                  name="adminSecret" 
                  type="password" 
                  value={formData.adminSecret} 
                  onChange={handleInputChange} 
                  placeholder="Enter setup secret" 
                  required 
                  className="bg-muted/20 border-accent/20" 
                />
                <p className="text-[10px] text-muted-foreground">Contact developer for the setup secret.</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="bg-muted/20 border-accent/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="bg-muted/20 border-accent/20"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <a href="/" className="hover:text-accent transition-colors">
            ← Back to website
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminAuth;
