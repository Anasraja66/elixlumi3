import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import MagneticButton from "./MagneticButton";

interface NavigationProps {
  onOpenForm?: () => void;
}

const Navigation = ({ onOpenForm }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Apply theme
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Experience", id: "experience" },
    { label: "Notes", id: "notes" },
    { label: "Collection", id: "collection" },
    { label: "Philosophy", id: "philosophy" },
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-background/95 backdrop-blur-md py-4 border-b border-foreground/10 shadow-sm" 
            : "bg-transparent py-8 lg:py-12"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
          <div className="flex items-center justify-between">
            {/* Bold Sheryians-style Logo */}
            <Link to="/" className="z-50 flex flex-col group">
              <span className="font-ui text-3xl lg:text-4xl tracking-tighter text-foreground font-extrabold transition-all duration-500 group-hover:text-primary">
                ELIX LUMI
              </span>
              <div className="h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
            </Link>

            {/* Nav Center - Bold and Visible */}
            <nav className="hidden lg:flex items-center gap-12">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="group relative font-ui text-xs tracking-widest uppercase text-foreground/60 hover:text-foreground font-bold transition-all duration-300"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-foreground transition-all duration-500 group-hover:w-full" />
                </button>
              ))}
            </nav>

            {/* Buttons Right - High Contrast */}
            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={toggleTheme}
                className="p-2.5 text-foreground/40 hover:text-foreground transition-colors hover:bg-foreground/5 rounded-full"
                aria-label="Toggle Theme"
              >
                {theme === "light" ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
              </button>
              
              <MagneticButton 
                onClick={() => navigate("/shop")}
                className="px-10 py-4 bg-foreground text-background transition-all duration-500 rounded-full hover:scale-105 active:scale-95 shadow-xl shadow-foreground/10"
              >
                <span className="font-ui text-xs tracking-[0.2em] uppercase font-bold">Shop Now</span>
              </MagneticButton>
            </div>

            {/* Mobile Toggle */}
            <div className="flex items-center gap-6 lg:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 text-foreground"
              >
                {theme === "light" ? <Moon size={20} strokeWidth={2.5} /> : <Sun size={20} strokeWidth={2.5} />}
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="z-50 p-2"
              >
                <div className="w-7 flex flex-col gap-2">
                  <span className={`h-1 w-full bg-foreground transition-all duration-500 ${isMobileMenuOpen ? "rotate-45 translate-y-3" : ""}`} />
                  <span className={`h-1 w-full bg-foreground transition-all duration-500 ${isMobileMenuOpen ? "opacity-0" : ""}`} />
                  <span className={`h-1 w-full bg-foreground transition-all duration-500 ${isMobileMenuOpen ? "-rotate-45 -translate-y-3" : ""}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-12"
          >
            {navLinks.map((link, i) => (
              <motion.button
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => scrollToSection(link.id)}
                className="font-ui text-4xl text-foreground font-extrabold tracking-tighter"
              >
                {link.label}
              </motion.button>
            ))}
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => navigate("/shop")}
              className="mt-12 px-16 py-6 bg-foreground text-background font-ui text-sm tracking-widest uppercase font-bold rounded-full"
            >
              Shop Collection
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
