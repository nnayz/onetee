import type { FC } from "react";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";
import CollectionShowcase from "@/components/CollectionShowcase";
import ScrollIndicator from "@/components/ScrollIndicator";
import HamburgerMenu from "@/components/HamburgerMenu";
import Reviews from "@/components/Reviews";
import landingImage from "@/assets/landing page.jpg";

const LandingPage: FC = () => {
  const handleAnimationComplete = () => {};
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 overflow-hidden">
      {/* Hamburger Menu */}
      <HamburgerMenu />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,0,0,0.02)_0%,_transparent_50%)]"></div>
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-8 lg:px-16 max-w-7xl mx-auto pt-4">
        
        {/* Hero Section */}
        <HeroSection 
          backgroundImage={landingImage}
          onAnimationComplete={handleAnimationComplete}
        />
        
        {/* Scroll Indicator */}
        <ScrollIndicator className="absolute bottom-8 left-1/2 transform -translate-x-1/2" />
      </div>
      
      {/* Product Sections */}
      <div className="relative z-10 px-8 lg:px-16 max-w-7xl mx-auto">
        {/* Bestsellers Section */}
        <ProductGrid 
          title="Bestsellers"
          className="mt-32"
        />
        
        {/* Shop by Collection Section */}
        <CollectionShowcase 
          title="Shop by Collection"
          className="mt-20"
        />
        
        {/* Reviews Section */}
        <Reviews 
          title="What Our Customers Say"
          className="mt-20"
        />
      </div>
    </div>
  );
};

export default LandingPage; 