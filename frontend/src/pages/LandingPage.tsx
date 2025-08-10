import type { FC } from "react";
import BlurText from "@/blocks/blurText";
import StickyHeaders from "@/components/StickyHeaders";

const LandingPage: FC = () => {
  const handleAnimationComplete = () => {
    console.log("Animation complete");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 overflow-hidden">
      {/* Sticky Headers */}
      <StickyHeaders />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,0,0,0.02)_0%,_transparent_50%)]"></div>
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-8 lg:px-16 max-w-7xl mx-auto">
        
        {/* Hero Section - Left aligned */}
        <div className="space-y-12 max-w-5xl">
          {/* Main headline */}
          <div className="space-y-6">
            <BlurText
              text="OneTee creates"
              delay={100}
              animateBy="words"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[0.85]"
              style={{ fontFamily: 'Host Grotesk, sans-serif' }}
            />
            
            <div className="space-y-3">
              <BlurText
                text="meaningful"
                delay={400}
                animateBy="words"
                direction="bottom"
                onAnimationComplete={handleAnimationComplete}
                className="text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[0.85]"
                style={{ fontFamily: 'Dancing Script, cursive' }}
              />
              <BlurText
                text="connections."
                delay={600}
                animateBy="words"
                direction="bottom"
                onAnimationComplete={handleAnimationComplete}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.85]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>
          
          {/* Brand slogan */}
          <div className="mt-20 space-y-6">
            <div className="flex items-baseline space-x-6 flex-wrap">
              <BlurText
                text="OneTee."
                delay={900}
                animateBy="words"
                direction="bottom"
                onAnimationComplete={handleAnimationComplete}
                className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide"
                style={{ fontFamily: 'Host Grotesk, sans-serif' }}
              />
              <BlurText
                text="OneTeam!"
                delay={1100}
                animateBy="words"
                direction="bottom"
                onAnimationComplete={handleAnimationComplete}
                className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional content to enable scrolling */}
      <div className="relative z-10 px-8 lg:px-16 max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mt-32">
          <div className="space-y-4">
            <h3 className="text-2xl font-light" style={{ fontFamily: 'Host Grotesk, sans-serif' }}>
              Premium Quality
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Crafted with the finest materials and attention to detail. Every piece tells a story of excellence.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-light" style={{ fontFamily: 'Host Grotesk, sans-serif' }}>
              Team Spirit
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Designed to bring people together. Our apparel creates bonds that last beyond the fabric.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-light" style={{ fontFamily: 'Host Grotesk, sans-serif' }}>
              Sustainable Future
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Committed to ethical practices and environmental responsibility in every step of our process.
            </p>
          </div>
        </div>
        
        {/* More content for scrolling */}
        <div className="mt-32 space-y-16">
          <div className="text-center">
            <h2 className="text-4xl font-light mb-8" style={{ fontFamily: 'Host Grotesk, sans-serif' }}>
              Our Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From concept to creation, every OneTee piece follows a journey of innovation and care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                01
              </div>
              <h4 className="text-xl font-medium" style={{ fontFamily: 'Host Grotesk, sans-serif' }}>
                Design Thinking
              </h4>
              <p className="text-gray-600">
                We start with understanding your team's unique identity and values, translating them into meaningful designs.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                02
              </div>
              <h4 className="text-xl font-medium" style={{ fontFamily: 'Host Grotesk, sans-serif' }}>
                Careful Crafting
              </h4>
              <p className="text-gray-600">
                Using premium materials and sustainable practices, we bring your vision to life with meticulous attention to detail.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Minimal decorative elements */}
      <div className="absolute top-32 right-32 w-24 h-24 bg-gray-200/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-40 left-20 w-36 h-36 bg-gray-100/30 rounded-full blur-2xl"></div>
    </div>
  );
};

export default LandingPage; 