import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import HamburgerMenu from '@/components/HamburgerMenu';
import Footer from '@/components/Footer';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('RELEVANCE');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock search results
  const searchResults = [
    {
      id: 1,
      name: "ESSENTIAL T-SHIRT",
      price: 1299,
      originalPrice: null,
      category: "MEN",
      colors: 8,
      image: "/api/placeholder/300/400",
      badge: "NEW",
      isNew: true
    },
    {
      id: 2,
      name: "COTTON BLEND HOODIE",
      price: 2999,
      originalPrice: 3999,
      category: "WOMAN",
      colors: 4,
      image: "/api/placeholder/300/400",
      badge: "SALE",
      isNew: false
    },
    {
      id: 3,
      name: "MINIMALIST JACKET",
      price: 4999,
      originalPrice: null,
      category: "MEN",
      colors: 3,
      image: "/api/placeholder/300/400",
      badge: null,
      isNew: false
    },
    {
      id: 4,
      name: "RELAXED FIT JEANS",
      price: 2499,
      originalPrice: null,
      category: "WOMAN",
      colors: 5,
      image: "/api/placeholder/300/400",
      badge: "NEW",
      isNew: true
    },
    {
      id: 5,
      name: "OVERSIZED BLAZER",
      price: 5999,
      originalPrice: 7999,
      category: "WOMAN",
      colors: 2,
      image: "/api/placeholder/300/400",
      badge: "SALE",
      isNew: false
    },
    {
      id: 6,
      name: "BASIC POLO SHIRT",
      price: 1799,
      originalPrice: null,
      category: "MEN",
      colors: 6,
      image: "/api/placeholder/300/400",
      badge: null,
      isNew: false
    }
  ];

  const categories = ['ALL', 'WOMAN', 'MEN', 'ACCESSORIES'];
  const sortOptions = ['RELEVANCE', 'PRICE LOW TO HIGH', 'PRICE HIGH TO LOW', 'NEWEST FIRST'];

  const filteredResults = searchResults.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HamburgerMenu />
      
      <div className="pt-16">
        {/* Search Header */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="flex flex-col space-y-6">
              {/* Search Bar */}
              <div className="max-w-2xl">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full px-4 py-3 text-lg font-light border border-gray-300 focus:border-gray-900 focus:outline-none transition-colors duration-200"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Search Info */}
              {searchQuery && (
                <div className="text-sm text-gray-600 font-light">
                  {filteredResults.length} results for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Results */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="sticky top-16 bg-white border-b border-gray-200 py-4 z-40">
            <div className="flex items-center justify-between">
              {/* Categories */}
              <div className="flex items-center space-x-8">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`text-sm font-light tracking-wide pb-2 transition-colors duration-200 ${
                      selectedCategory === category
                        ? 'text-gray-900 border-b border-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sort and View */}
              <div className="flex items-center space-x-6">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="text-sm font-light text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 ${viewMode === 'grid' ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1 ${viewMode === 'list' ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="py-8">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12">
                {filteredResults.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative mb-4 overflow-hidden">
                      <div className="aspect-[3/4] bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      {/* Badge */}
                      {product.badge && (
                        <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-light ${
                          product.badge === 'SALE' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-black text-white'
                        }`}>
                          {product.badge}
                        </div>
                      )}

                      {/* Add Button */}
                      <button className="absolute bottom-2 right-2 px-3 py-1 bg-white text-gray-900 border border-gray-400 text-sm font-light opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:border-gray-900">
                        ADD
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-light text-gray-900 uppercase tracking-wide">
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-light text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 uppercase">
                        +{product.colors} COLORS
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredResults.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center space-x-6 p-4 border border-gray-200 hover:border-gray-400 transition-colors duration-200 cursor-pointer group"
                  >
                    <div className="w-24 h-32 bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-light text-gray-900 uppercase tracking-wide">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 uppercase">
                            {product.category} • +{product.colors} COLORS
                          </p>
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-light text-gray-900">
                              ₹{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                            {product.badge && (
                              <span className={`px-2 py-1 text-xs font-light ${
                                product.badge === 'SALE' 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-black text-white'
                              }`}>
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button className="px-4 py-2 bg-white text-gray-900 border border-gray-400 text-sm font-light hover:border-gray-900 transition-colors duration-200">
                          ADD TO CART
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {filteredResults.length === 0 && searchQuery && (
              <div className="text-center py-16">
                <h3 className="text-lg font-light text-gray-900 mb-2">No results found</h3>
                <p className="text-sm text-gray-500">
                  Try adjusting your search or browse our categories
                </p>
              </div>
            )}

            {/* Default state */}
            {filteredResults.length === 0 && !searchQuery && (
              <div className="text-center py-16">
                <h3 className="text-lg font-light text-gray-900 mb-2">Start your search</h3>
                <p className="text-sm text-gray-500">
                  Find exactly what you're looking for
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;