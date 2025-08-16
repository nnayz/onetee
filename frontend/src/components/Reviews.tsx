import type { FC } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  verified: boolean;
  location?: string;
  productPurchased?: string;
  date?: string;
}

interface ReviewsProps {
  className?: string;
  title?: string;
}

const Reviews: FC<ReviewsProps> = ({ 
  className = "",
  title = "Customer Stories" 
}) => {
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const reviewsRef = useRef(null);
  
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const reviewsInView = useInView(reviewsRef, { once: true, margin: "-50px" });

  const reviews: Review[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      rating: 5,
      comment: "Absolutely love the quality and comfort. Perfect fit every time!",
      verified: true,
      location: "Mumbai",
      productPurchased: "Essential Crew Neck",
      date: "2 weeks ago"
    },
    {
      id: "2",
      name: "Rahul Sharma",
      rating: 5,
      comment: "Outstanding customer service and lightning-fast delivery. The t-shirt exceeded all my expectations.",
      verified: true,
      location: "Delhi",
      productPurchased: "Organic Cotton Tee",
      date: "1 month ago"
    },
    {
      id: "3",
      name: "Priya Patel",
      rating: 5,
      comment: "Supporting eco-friendly fashion has never felt this good. The hemp fabric is incredibly soft.",
      verified: true,
      location: "Bangalore",
      productPurchased: "Sustainable Hemp Tee",
      date: "3 weeks ago"
    },
    {
      id: "4",
      name: "Arjun Kumar",
      rating: 4,
      comment: "Premium quality materials and excellent craftsmanship. Worth every penny.",
      verified: true,
      location: "Chennai",
      productPurchased: "Premium Cotton Blend",
      date: "1 week ago"
    },
    {
      id: "5",
      name: "Kavya Reddy",
      rating: 5,
      comment: "Perfect for team events! The print quality is excellent and maintains shape after washes.",
      verified: true,
      location: "Hyderabad",
      productPurchased: "Team Unity Shirt",
      date: "2 days ago"
    },
    {
      id: "6",
      name: "Vikram Singh",
      rating: 5,
      comment: "Minimalist design done right. Clean, simple, and incredibly comfortable.",
      verified: true,
      location: "Pune",
      productPurchased: "Minimalist Design Tee",
      date: "1 week ago"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <section className={`py-32 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Header Section - Centered with Stats */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl lg:text-6xl font-extralight tracking-wider text-gray-900 mb-8">
            {title}
          </h2>
          
          {/* Inline Stats */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center space-x-12 mb-12"
          >
            <div className="text-center">
              <div className="flex justify-center mb-1">
                {renderStars(5)}
              </div>
              <p className="text-sm text-gray-500 font-light">4.9 out of 5</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-2xl font-light text-gray-900">2,847</p>
              <p className="text-sm text-gray-500 font-light">Reviews</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-2xl font-light text-gray-900">99%</p>
              <p className="text-sm text-gray-500 font-light">Satisfaction</p>
            </div>
          </motion.div>
          
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Real feedback from customers who love our premium t-shirts
          </p>
        </motion.div>

        {/* Reviews - Masonry-style Layout */}
        <div ref={reviewsRef} className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 40 }}
              animate={reviewsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="break-inside-avoid mb-6"
            >
              <div className="border border-gray-200 p-6 bg-white group hover:border-gray-300 transition-colors duration-300">
                
                {/* Rating and Verified Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  {review.verified && (
                    <span className="text-xs text-gray-500 font-medium tracking-wider">
                      VERIFIED
                    </span>
                  )}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 font-light leading-relaxed mb-6 text-sm">
                  "{review.comment}"
                </blockquote>

                {/* Customer Info - Horizontal Layout */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {getInitials(review.name)}
                  </div>
                  
                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {review.name}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 space-x-1">
                      <span>{review.location}</span>
                      <span>•</span>
                      <span>{review.date}</span>
                    </div>
                  </div>
                </div>

                {/* Product Tag */}
                {review.productPurchased && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Purchased</p>
                    <p className="text-xs font-medium text-gray-700">
                      {review.productPurchased}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA - Simple and Clean */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={reviewsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-20 pt-16 border-t border-gray-200"
        >
          <h3 className="text-2xl font-extralight tracking-wider text-gray-900 mb-4">
            Experience the Difference
          </h3>
          <p className="text-gray-600 font-light mb-8">
            Join thousands of satisfied customers
          </p>
          
          {/* Trust Badges */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Premium Quality</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Reviews;