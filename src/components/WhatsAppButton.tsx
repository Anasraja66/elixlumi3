import { motion } from "framer-motion";

const WhatsAppButton = () => {
  const phoneNumber = "923429003706";
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Tooltip */}
      <motion.span
        className="hidden md:block bg-card/90 backdrop-blur-sm text-foreground text-sm px-4 py-2 rounded-lg border border-accent/20 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ x: 10, opacity: 0 }}
        whileHover={{ x: 0, opacity: 1 }}
      >
        Chat with us on WhatsApp
      </motion.span>

      {/* Button */}
      <div className="relative">
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping" />

        {/* Button background */}
        <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] shadow-xl shadow-[#25D366]/30 group-hover:bg-[#128C7E] transition-colors duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="w-7 h-7 md:w-8 md:h-8 text-white"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19.11 17.21c-.28-.14-1.65-.82-1.91-.91-.26-.1-.45-.14-.64.14-.19.28-.73.91-.9 1.1-.16.19-.33.21-.61.07-.28-.14-1.16-.43-2.2-1.37-.81-.72-1.35-1.61-1.5-1.88-.16-.28-.02-.43.12-.57.12-.12.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.1-.23-.56-.47-.49-.64-.49h-.54c-.19 0-.49.07-.75.35-.26.28-.98.95-.98 2.33 0 1.37 1 2.7 1.14 2.88.14.19 1.97 3 4.77 4.2.67.29 1.2.46 1.61.59.68.22 1.3.19 1.79.12.55-.08 1.65-.67 1.88-1.31.23-.64.23-1.19.16-1.31-.07-.12-.26-.19-.54-.33Z" />
            <path d="M16 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.24.58 4.43 1.68 6.36L3 29l6.81-1.79A12.73 12.73 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8S23.07 3.2 16 3.2Zm0 23.32c-2.02 0-3.99-.55-5.7-1.59l-.41-.25-4.04 1.06 1.08-3.94-.27-.41A10.45 10.45 0 0 1 5.52 16c0-5.78 4.7-10.48 10.48-10.48S26.48 10.22 26.48 16 21.78 26.52 16 26.52Z" />
          </svg>
        </div>
      </div>
    </motion.a>
  );
};

export default WhatsAppButton;
