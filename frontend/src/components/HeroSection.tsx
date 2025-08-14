import type { FC } from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BlurText from "@/blocks/blurText";

interface HeroSectionProps {
  backgroundImage: string;
  onAnimationComplete?: () => void;
  className?: string;
}

const HeroSection: FC<HeroSectionProps> = ({
  backgroundImage,
  onAnimationComplete,
  className = ""
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      // Small delay to ensure smooth transition
      setTimeout(() => setImageLoaded(true), 100);
    };
    img.onerror = () => {
      // Still show the container even if image fails to load
      setTimeout(() => setImageLoaded(true), 100);
    };
    img.src = backgroundImage;
  }, [backgroundImage]);

  return (
    <div className={`w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${className}`}>
      {/* Left side - Image with text overlay (Framer style) */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {/* Split reveal background image */}
        <div className="absolute inset-0">
          {/* Left half */}
          <div 
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              imageLoaded ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
              clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)'
            }}
          />
          
          {/* Right half */}
          <div 
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              imageLoaded ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
              clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)',
              transitionDelay: '100ms'
            }}
          />
          
          {/* Dark overlay for text contrast */}
          <div 
            className={`absolute inset-0 bg-black/40 transition-opacity duration-800 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}
          />
        </div>
        
        {/* Text overlaid on image */}
        <div className="absolute inset-0 flex items-center justify-start">
          <div className="text-center">
            <BlurText
              text="OneTee."
              delay={800}
              animateBy="words"
              direction="bottom"
              onAnimationComplete={onAnimationComplete}
              className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-wide leading-[0.9] text-white drop-shadow-lg"
              style={{ fontFamily: 'Dancing Script, cursive' }}
            />
            <BlurText
              text="OneTeam!"
              delay={1000}
              animateBy="words"
              direction="bottom"
              onAnimationComplete={onAnimationComplete}
              className="text-4xl md:text-5xl lg:text-6xl font-thin tracking-wide leading-[0.9] text-white drop-shadow-lg"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
          </div>
        </div>
      </div>

      {/* Right side - T-shirt store content */}
      <div className="space-y-6 flex flex-col items-end justify-center text-right">
        <BlurText
          text="Welcome."
          delay={1200}
          animateBy="words"
          direction="top"
          onAnimationComplete={onAnimationComplete}
          className="text-6xl md:text-7xl lg:text-8xl font-extralight tracking-wider text-gray-900"
          style={{ fontFamily: 'var(--font-sans)' }}
        />
        
        <motion.p
          initial={{ filter: "blur(10px)", opacity: 0, y: -30 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: 0.3,
            ease: "easeOut"
          }}
          className="text-lg text-gray-600 leading-relaxed max-w-md text-right font-light"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Premium quality t-shirts that bring teams together. Crafted with care, designed for unity.
        </motion.p>
      </div>
    </div>
  );
};

export default HeroSection;