import type { FC } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HamburgerMenu from "@/components/HamburgerMenu";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isSale?: boolean;
  isFavorite?: boolean;
  colors?: string[];
  sizes?: string[];
  badge?: string;
}

const MarketplacePage: FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = [
    { id: "ALL", name: "VIEW ALL" },
    { id: "WOMAN", name: "WOMAN" },
    { id: "MAN", name: "MAN" },
    { id: "KIDS", name: "KIDS" },
    { id: "NEW", name: "NEW IN" },
    { id: "SALE", name: "SALE" }
  ];

  const products: Product[] = [
    {
      id: "1",
      name: "Essential Crew Neck",
      price: 45,
      image: "/api/placeholder/400/500",
      category: "WOMAN",
      description: "Soft, comfortable crew neck perfect for everyday wear",
      rating: 4.8,
      reviews: 124,
      isNew: true,
      badge: "Bestseller",
      colors: ["#000000", "#FFFFFF", "#8B5A3C"],
      sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
      id: "2",
      name: "Organic Cotton Tee",
      price: 35,
      image: "/api/placeholder/400/500",
      category: "MAN",
      description: "100% organic cotton with sustainable production",
      rating: 4.6,
      reviews: 89,
      badge: "Eco-Friendly",
      colors: ["#2D3748", "#E2E8F0", "#48BB78"],
      sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
      id: "3",
      name: "Vintage Wash T-Shirt",
      price: 28,
      originalPrice: 40,
      image: "/api/placeholder/400/500",
      category: "WOMAN",
      description: "Pre-washed vintage style with relaxed fit",
      rating: 4.4,
      reviews: 67,
      isSale: true,
      colors: ["#4A5568", "#ED8936"],
      sizes: ["XS", "S", "M", "L"]
    },
    {
      id: "4",
      name: "Kids Rainbow Tee",
      price: 25,
      image: "/api/placeholder/400/500",
      category: "KIDS",
      description: "Bright, fun design that kids absolutely love",
      rating: 4.9,
      reviews: 156,
      isNew: true,
      colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
      sizes: ["2T", "3T", "4T", "5T", "6T"]
    },
    {
      id: "5",
      name: "Premium Cotton Blend",
      price: 55,
      image: "/api/placeholder/400/500",
      category: "MAN",
      description: "Luxury cotton blend with superior durability",
      rating: 4.7,
      reviews: 203,
      badge: "Premium",
      colors: ["#1A202C", "#2D3748", "#4A5568"],
      sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
      id: "6",
      name: "Sustainable Hemp Tee",
      price: 42,
      image: "/api/placeholder/400/500",
      category: "WOMAN",
      description: "Eco-conscious hemp fiber with natural feel",
      rating: 4.5,
      reviews: 78,
      badge: "Sustainable",
      colors: ["#68D391", "#F7FAFC", "#E2E8F0"],
      sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
      id: "7",
      name: "Team Unity Shirt",
      price: 38,
      image: "/api/placeholder/400/500",
      category: "MAN",
      description: "Perfect for team building and group events",
      rating: 4.6,
      reviews: 92,
      colors: ["#3182CE", "#FFFFFF"],
      sizes: ["S", "M", "L", "XL", "XXL"]
    },
    {
      id: "8",
      name: "Minimalist Design Tee",
      price: 32,
      originalPrice: 45,
      image: "/api/placeholder/400/500",
      category: "WOMAN",
      description: "Clean, simple design for the modern minimalist",
      rating: 4.3,
      reviews: 45,
      isSale: true,
      colors: ["#F7FAFC", "#E2E8F0", "#CBD5E0"],
      sizes: ["XS", "S", "M", "L"]
    },
    {
      id: "9",
      name: "Kids Adventure Tee",
      price: 22,
      image: "/api/placeholder/400/500",
      category: "KIDS",
      description: "Durable design for active little adventurers",
      rating: 4.8,
      reviews: 134,
      colors: ["#F56565", "#4299E1", "#48BB78"],
      sizes: ["2T", "3T", "4T", "5T", "6T"]
    }
  ];

  const filteredProducts = selectedCategory === "ALL" 
    ? products 
    : selectedCategory === "NEW"
    ? products.filter(p => p.isNew)
    : selectedCategory === "SALE"
    ? products.filter(p => p.isSale)
    : products.filter(p => p.category === selectedCategory);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hamburger Menu */}
      <HamburgerMenu />
      
      {/* Navbar */}
      <Navbar />
      
      {/* Header Section */}
      <div className="border-b border-gray-200 pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-extralight tracking-wider text-gray-900 mb-4">
              Marketplace
            </h1>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Discover our complete collection of premium t-shirts designed to bring teams together
            </p>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="border-b border-gray-200 sticky top-16 bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-8 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`whitespace-nowrap text-sm font-light tracking-wide transition-colors duration-200 flex-shrink-0 ${
                      selectedCategory === category.id
                        ? 'text-gray-900 border-b border-gray-900 pb-2'
                        : 'text-gray-600 hover:text-gray-900 pb-2'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              {/* Right side info */}
              <div className="hidden md:flex items-center space-x-6 text-sm flex-shrink-0 ml-6">
                <span className="text-gray-500 font-light tracking-wide">
                  {filteredProducts.length} PRODUCT{filteredProducts.length !== 1 ? 'S' : ''}
                </span>
                <div className="h-4 w-px bg-gray-300"></div>
                <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light tracking-wide">
                  FILTER
                </button>
              </div>
            </div>
            
            {/* Mobile product count and filter */}
            <div className="flex md:hidden items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-gray-500 font-light tracking-wide text-sm">
                {filteredProducts.length} PRODUCT{filteredProducts.length !== 1 ? 'S' : ''}
              </span>
              <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light tracking-wide text-sm">
                FILTER
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {/* Product Image */}
              <div className="aspect-[3/4] bg-gray-100 mb-4 relative overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 font-light text-sm">
                  {product.name}
                </div>
                
                {/* Minimal badges */}
                {product.isNew && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-black text-white px-2 py-1 text-xs font-medium tracking-wider">
                      NEW
                    </span>
                  </div>
                )}
                
                {product.isSale && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-600 text-white px-2 py-1 text-xs font-medium tracking-wider">
                      SALE
                    </span>
                  </div>
                )}

                {/* Add button on hover */}
                <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-full bg-white border border-gray-400 text-gray-900 py-2 text-sm font-light tracking-wider hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors duration-200">
                    ADD
                  </button>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="space-y-1">
                <h3 className="text-sm font-light text-gray-900 group-hover:text-gray-600 transition-colors duration-200 leading-tight">
                  {product.name.toUpperCase()}
                </h3>
                
                {/* Colors */}
                {product.colors && product.colors.length > 1 && (
                  <p className="text-xs text-gray-500 tracking-wide">
                    +{product.colors.length - 1} COLOR{product.colors.length > 2 ? 'S' : ''}
                  </p>
                )}
                
                {/* Price */}
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-sm font-light text-gray-900">
                    ₹ {product.price}.00
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹ {product.originalPrice}.00
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* View More */}
        <div className="text-center mt-16">
          <button className="px-8 py-3 border border-gray-300 text-gray-900 font-light text-sm tracking-wider hover:border-gray-900 transition-colors duration-200">
            VIEW MORE
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MarketplacePage;