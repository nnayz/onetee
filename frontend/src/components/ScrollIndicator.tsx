import React from "react";
import { motion } from "framer-motion";

interface ScrollIndicatorProps {
  className?: string;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: 2,
        ease: "easeOut"
      }}
      className={`flex flex-col items-center space-y-3 ${className}`}
    >
      {/* Scroll text */}
      <motion.span
        className="text-sm text-gray-500 font-light tracking-widest uppercase"
        style={{ fontFamily: 'var(--font-sans)' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Scroll
      </motion.span>
      
      {/* Animated line */}
      <motion.div
        className="w-px bg-gray-400"
        initial={{ height: 0 }}
        animate={{ height: 40 }}
        transition={{ 
          duration: 0.8, 
          delay: 2.3,
          ease: "easeOut"
        }}
      />
      
      {/* Animated dot */}
      <motion.div
        className="w-1 h-1 bg-gray-400 rounded-full"
        animate={{ 
          y: [0, 20, 0],
          opacity: [1, 0.3, 1]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />
    </motion.div>
  );
};

export default ScrollIndicator;