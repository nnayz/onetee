import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ScrollAnimatedElement from "./ScrollAnimatedElement";
import { ShopAPI } from "@/lib/api/shop";

interface Collection {
  id: number;
  name: string;
  image: string;
  itemCount: string;
}

interface CollectionShowcaseProps {
  title: string;
  collections?: Collection[];
  className?: string;
}

const CollectionShowcase: React.FC<CollectionShowcaseProps> = ({
  title,
  collections,
  className = ""
}) => {
  const [tags, setTags] = useState<Array<{ id: number; name: string }>>([]);
  useEffect(() => {
    if (!collections) {
      ShopAPI.listTags().then(setTags).catch(() => setTags([]));
    }
  }, [collections]);
  const displayCollections = collections || tags.map((t) => ({ id: t.id, name: (t.name || '').toUpperCase(), image: "/vite.svg", itemCount: "" }));

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

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayCollections.map((collection, index) => (
          <ScrollAnimatedElement
            key={collection.id}
            animationType={index % 2 === 0 ? "slideRight" : "slideLeft"}
            delay={index * 0.2}
            enableBlur={true}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden bg-white border border-gray-200 aspect-[4/5]">
              {/* Parallax Background Image */}
              <motion.div
                className="absolute inset-0 overflow-hidden"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              
              {/* Collection Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <div>
                    <h3 className="text-xl font-light tracking-wider mb-1" style={{ fontFamily: 'var(--font-sans)' }}>
                      {collection.name}
                    </h3>
                    {collection.itemCount && (
                      <p className="text-sm text-white/80 tracking-widest font-extralight" style={{ fontFamily: 'var(--font-sans)' }}>
                        {collection.itemCount}
                      </p>
                    )}
                  </div>
                  
                  {/* View Collection Button */}
                  <button className="border border-white/60 px-4 py-2 text-sm font-light tracking-wider text-white hover:bg-white hover:text-black transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ fontFamily: 'var(--font-sans)' }}>
                    VIEW COLLECTION
                  </button>
                </motion.div>
              </div>
            </div>
          </ScrollAnimatedElement>
        ))}
      </div>
    </div>
  );
};

export default CollectionShowcase;