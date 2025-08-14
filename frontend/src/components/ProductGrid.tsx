import React from "react";
import { motion } from "framer-motion";
import ScrollAnimatedElement from "./ScrollAnimatedElement";
import mockProductImg from "@/assets/mock_product_img.jpg";

interface ProductGridProps {
  title: string;
  products?: Array<{
    id: number;
    name: string;
    price: string;
    image: string;
  }>;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  products,
  className = ""
}) => {
  // Mock products using the available image
  const defaultProducts = [
    { id: 1, name: "PREMIUM TEE", price: "₹ 2,950.00", image: mockProductImg },
    { id: 2, name: "TEAM SPIRIT TEE", price: "₹ 3,200.00", image: mockProductImg },
    { id: 3, name: "UNITY SHIRT", price: "₹ 2,750.00", image: mockProductImg },
    { id: 4, name: "CLASSIC TEE", price: "₹ 2,850.00", image: mockProductImg },
  ];

  const displayProducts = products || defaultProducts;

  return (
    <div className={`py-20 ${className}`}>
      {/* Section Title */}
      <ScrollAnimatedElement
        animationType="fadeUp"
        enableBlur={true}
        className="text-center mb-16"
      >
        <h2 className="text-5xl md:text-6xl font-extralight tracking-wider text-gray-900 mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
          {title}
        </h2>
        <div className="w-24 h-px bg-gray-300 mx-auto"></div>
      </ScrollAnimatedElement>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {displayProducts.map((product, index) => (
          <ScrollAnimatedElement
            key={product.id}
            animationType="fadeUp"
            delay={index * 0.1}
            enableBlur={true}
            className="group cursor-pointer"
          >
            <div className="space-y-0">
              {/* Product Image */}
              <div className="relative overflow-hidden bg-white border border-gray-200 aspect-[3/4]">
                {/* Parallax Image Container */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7 }}
                  />
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
              </div>

              {/* Add to Cart Button - Attached to bottom */}
              <button className="w-full py-3 bg-white border border-gray-200 border-t-0 text-gray-900 text-xs font-light tracking-widest hover:bg-gray-50 transition-colors duration-200" style={{ fontFamily: 'var(--font-sans)' }}>
                ADD TO CART
              </button>

              {/* Product Info */}
              <div className="mt-4 space-y-1">
                <h3 className="text-sm font-light text-gray-900 tracking-wider" style={{ fontFamily: 'var(--font-sans)' }}>
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 font-extralight" style={{ fontFamily: 'var(--font-sans)' }}>
                  {product.price}
                </p>
              </div>
            </div>
          </ScrollAnimatedElement>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;