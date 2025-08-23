import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MediaItem } from '@/types/community.types';

interface MediaGridProps {
  mediaItems: MediaItem[];
  onMediaClick?: (mediaIndex: number) => void;
  className?: string;
}

const MediaGrid: React.FC<MediaGridProps> = ({ 
  mediaItems, 
  onMediaClick,
  className = "" 
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!mediaItems || mediaItems.length === 0) return null;

  const count = mediaItems.length;

  const getContainerLayout = (c: number) => {
    if (c === 1) return "grid-cols-1 grid-rows-1";
    if (c === 2) return "grid-cols-2 grid-rows-1 gap-1";
    // For 3 and 4, use 2x2 matrix
    return "grid-cols-2 grid-rows-2 gap-1";
  };

  const getItemLayout = (index: number, total: number) => {
    if (total === 1) return "col-span-1 row-span-1";
    if (total === 2) return "col-span-1 row-span-1";
    if (total === 3) {
      // First fills left column, other two stack on right
      if (index === 0) return "col-span-1 row-span-2";
      return "col-span-1 row-span-1";
    }
    // 4 or more: simple 2x2
    return "col-span-1 row-span-1";
  };

  const renderOverlay = (index: number, total: number) => {
    if (total <= 4) return null;
    return (
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
        <span className="text-white text-2xl font-bold">+{total - 4}</span>
      </div>
    );
  };

  return (
    <div className={`grid aspect-square ${getContainerLayout(Math.min(count, 4))} ${className}`}>
      {mediaItems.slice(0, 4).map((media, index) => (
        <motion.div
          key={media.id}
          className={`relative overflow-hidden ${getItemLayout(index, Math.min(count, 4))} ${onMediaClick ? 'cursor-pointer' : ''}`}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => onMediaClick?.(index)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {media.media_type === "image" ? (
            <img
              src={media.url}
              alt={media.alt_text || "Thread media"}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Media image failed to load:', media.url, e);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="text-sm mb-1">Media type:</div>
                <div className="text-xs">{media.media_type}</div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {hoveredIndex === index && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 flex items-center justify-center"
              >
                <div className="bg-white/90 rounded-full p-2">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {index === 3 && count > 4 && renderOverlay(index, count)}
        </motion.div>
      ))}
    </div>
  );
};

export default MediaGrid; 