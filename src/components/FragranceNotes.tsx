import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";

const notes = [
  {
    key: "top",
    title: "Opening",
    icon: "✦",
    notes: ["Bergamot", "Pink Pepper", "Saffron"],
    description: "A luminous burst of citrus and spice, igniting the senses with warmth and intrigue.",
    color: "primary",
  },
  {
    key: "heart",
    title: "Heart",
    icon: "❧",
    notes: ["Tulip Accord", "Bulgarian Rose", "Oud"],
    description: "The soul of the fragrance—a rare tulip accord wrapped in velvety rose and precious oud.",
    color: "accent",
  },
  {
    key: "base",
    title: "Foundation",
    icon: "◆",
    notes: ["Amber", "Sandalwood", "Musk"],
    description: "A lasting embrace of creamy woods and sensual musk that lingers like a whispered promise.",
    color: "gold",
  },
];

const FragranceNotes = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="luxury-section py-32 md:py-48 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/40 to-background" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-center mb-24"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-4 font-body text-xs tracking-luxury text-accent uppercase mb-6"
          >
            <span className="w-8 h-px bg-accent/50" />
            The Composition
            <span className="w-8 h-px bg-accent/50" />
          </motion.span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-light text-foreground">
            Olfactory <span className="italic text-gradient-gold">Journey</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-primary/30 via-accent/30 to-gold/30" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {notes.map((note, index) => (
              <motion.div
                key={note.key}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative"
              >
                {/* Timeline dot */}
                <motion.div
                  animate={{
                    scale: hoveredIndex === index ? 1.5 : 1,
                    boxShadow:
                      hoveredIndex === index
                        ? `0 0 30px hsl(var(--${note.color}) / 0.5)`
                        : "none",
                  }}
                  className={`hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-${note.color} border-4 border-background z-10`}
                />

                <div className="relative bg-card/30 backdrop-blur-sm border border-accent/10 p-8 lg:p-10 h-full transition-all duration-700 group-hover:bg-card/60 group-hover:border-accent/30 overflow-hidden">
                  {/* Glow effect */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-${note.color}/10 to-transparent`}
                  />

                  {/* Number */}
                  <motion.span
                    animate={{ scale: hoveredIndex === index ? 1.1 : 1 }}
                    className="absolute top-6 right-6 font-display text-7xl text-accent/5 group-hover:text-accent/15 transition-all duration-700"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </motion.span>

                  <div className="relative space-y-6">
                    {/* Icon & Title */}
                    <div className="space-y-3">
                      <motion.span
                        animate={{ rotate: hoveredIndex === index ? 360 : 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-block text-2xl text-accent"
                      >
                        {note.icon}
                      </motion.span>
                      <h3 className="font-display text-2xl md:text-3xl text-foreground">
                        {note.title}
                      </h3>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={isInView ? { scaleX: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                        className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent origin-left"
                      />
                    </div>

                    {/* Notes list */}
                    <ul className="space-y-3">
                      {note.notes.map((item, i) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -20 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ duration: 0.5, delay: 0.7 + index * 0.2 + i * 0.1 }}
                          className="flex items-center gap-3 font-body text-sm tracking-wide-luxury text-accent uppercase"
                        >
                          <span className="w-1.5 h-1.5 bg-primary/60 rounded-full" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>

                    {/* Description */}
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {note.description}
                    </p>
                  </div>

                  {/* Bottom accent */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-gold origin-left"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FragranceNotes;
