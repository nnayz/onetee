import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HamburgerMenu from "@/components/HamburgerMenu";
import { ShopAPI } from "@/lib/api/shop";

const MarketplacePage: FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [products, setProducts] = useState<Array<{ gender?: string }>>([]);
  const [sort, setSort] = useState<string>("newest");

  const categories = [
    { id: "ALL", name: "VIEW ALL" },
    { id: "WOMAN", name: "WOMAN" },
    { id: "MAN", name: "MAN" },
  ];

  useEffect(() => {
    let cancelled = false;
    ShopAPI.listProducts({ sort }).then((data) => {
      if (!cancelled) setProducts(data);
    });
    return () => { cancelled = true };
  }, [sort]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "ALL") return products;
    if (selectedCategory === "WOMAN") return products.filter((p) => p.gender === "women");
    if (selectedCategory === "MAN") return products.filter((p) => p.gender === "men");
    return products;
  }, [products, selectedCategory]);





  return (
    <div className="min-h-screen bg-white">
      {/* Hamburger Menu */}
      <HamburgerMenu />

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
      <div className="border-b border-gray-200 sticky top-16 bg-white/95 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-8 overflow-x-auto pb-2 scrollbar-hide">
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
                <div className="h-4 w-px bg-gray-200"></div>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-gray-600 bg-transparent font-light tracking-wide">
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="bestseller">Bestsellers</option>
                </select>
              </div>
            </div>
            
            {/* Mobile product count and filter */}
            <div className="flex md:hidden items-center justify-between mt-3 pt-3 border-t border-gray-200">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
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
              <div className="aspect-[3/4] bg-gray-50 mb-4 relative overflow-hidden border border-gray-100">
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 font-light text-sm">
                  {product.name}
                </div>
                
                {/* Minimal badges */}
                {product.isNew && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-black text-white px-2 py-1 text-xs font-light tracking-wider">
                      NEW
                    </span>
                  </div>
                )}
                
                {product.isSale && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-600 text-white px-2 py-1 text-xs font-light tracking-wider">
                      SALE
                    </span>
                  </div>
                )}

                {/* Add button on hover */}
                <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-full bg-white border border-gray-200 text-gray-900 py-2 text-sm font-light tracking-wider hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors duration-200">
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
                  <span className="text-sm font-light text-gray-900">{formatINR(product.price_cents || 0)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* View More */}
        <div className="text-center mt-16">
          <button className="px-8 py-3 border border-gray-200 text-gray-900 font-light text-sm tracking-wider hover:border-gray-900 transition-colors duration-200">
            VIEW MORE
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;