import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <h3 className="font-ui text-3xl lg:text-4xl text-foreground tracking-tighter font-black">
              ELIX LUMI
            </h3>
            <p className="font-ui text-[10px] tracking-[0.6em] text-primary mt-2 uppercase font-bold">
              Maison de Parfum
            </p>
          </motion.div>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16 text-center">
            <div className="space-y-1">
              <p className="font-ui text-[10px] tracking-widest text-accent uppercase font-bold">WhatsApp</p>
              <p className="font-ui text-sm text-foreground/60 font-medium">0317 5242 044</p>
            </div>
            <div className="space-y-1">
              <p className="font-ui text-[10px] tracking-widest text-accent uppercase font-bold">TikTok</p>
              <p className="font-ui text-sm text-foreground/60 font-medium">@elixlumi</p>
            </div>
            <div className="space-y-1">
              <p className="font-ui text-[10px] tracking-widest text-accent uppercase font-bold">Instagram</p>
              <p className="font-ui text-sm text-foreground/60 font-medium">@elixlumi</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-8">
            {["Collection", "Our Story", "Boutiques", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="font-body text-sm tracking-wide text-muted-foreground hover:text-accent transition-colors duration-300"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          {/* Copyright */}
          <div className="text-center space-y-2">
            <p className="font-body text-xs text-muted-foreground">
              © 2024 ELIX LUMI. All rights reserved.
            </p>
            <p className="font-body text-xs text-muted-foreground/60">
              Crafted with passion. Worn with intention.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
