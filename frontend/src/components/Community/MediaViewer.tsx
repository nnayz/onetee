import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MediaItem } from '@/types/community.types';

interface MediaViewerProps {
  mediaItems: MediaItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({
  mediaItems,
  initialIndex,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentIndex(prev => prev > 0 ? prev - 1 : mediaItems.length - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentIndex(prev => prev < mediaItems.length - 1 ? prev + 1 : 0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mediaItems.length, onClose]);

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : mediaItems.length - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev < mediaItems.length - 1 ? prev + 1 : 0);
  };

  if (!isOpen || !mediaItems[currentIndex]) return null;

  const currentMedia = mediaItems[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation arrows */}
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Media content */}
          <div className="relative max-w-full max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center"
              >
                {currentMedia.media_type === "image" ? (
                  <img
                    src={currentMedia.url}
                    alt={currentMedia.alt_text || "Thread media"}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      console.error('Media image failed to load:', currentMedia.url, e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <div className="text-white text-lg mb-2">Media type:</div>
                    <div className="text-gray-300">{currentMedia.media_type}</div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Image counter */}
          {mediaItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {currentIndex + 1} / {mediaItems.length}
            </div>
          )}

          {/* Alt text */}
          {currentMedia.alt_text && (
            <div className="absolute bottom-4 left-4 right-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
              {currentMedia.alt_text}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaViewer; 