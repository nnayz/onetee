import type { FC } from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { DisplayThread, MediaItem } from "@/types/community.types";
import MediaGrid from "./MediaGrid";
import MediaViewer from "./MediaViewer";
import ThreadView from "./ThreadView";

interface MainFeedProps {
  threads: DisplayThread[];
  onLike: (threadId: string, isCurrentlyLiked: boolean) => void;
  onRepost: (threadId: string) => void;
  onNavigateToPost: (postId: string) => void;
  onNavigateToProfile: (username: string) => void;
  likingThreadId?: string | null;
  repostingThreadId?: string | null;
  selectedThreadId?: string | null;
  onBackToFeed: () => void;
}

const MainFeed: FC<MainFeedProps> = ({
  threads,
  onLike,
  onRepost,
  onNavigateToPost,
  onNavigateToProfile,
  likingThreadId,
  repostingThreadId,
  selectedThreadId,
  onBackToFeed
}) => {
  const [mediaViewerState, setMediaViewerState] = useState<{
    isOpen: boolean;
    mediaItems: MediaItem[];
    initialIndex: number;
  }>({
    isOpen: false,
    mediaItems: [],
    initialIndex: 0
  });

  const handleMediaClick = (mediaIndex: number, mediaItems: MediaItem[]) => {
    setMediaViewerState({
      isOpen: true,
      mediaItems,
      initialIndex: mediaIndex
    });
  };

  const closeMediaViewer = () => {
    setMediaViewerState(prev => ({ ...prev, isOpen: false }));
  };

  // If a thread is selected, show the ThreadView instead of the feed
  if (selectedThreadId) {
    return (
      <ThreadView
        threadId={selectedThreadId}
        onBack={onBackToFeed}
        onNavigateToProfile={onNavigateToProfile}
      />
    );
  }

  return (
    <div className="pb-20 lg:pb-0">
      	{(threads || []).map((thread, index) => (
        <motion.div
          key={thread.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="border-b border-gray-200 p-3 sm:p-4 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
        >
          <div className="flex space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-light text-gray-700 flex-shrink-0 overflow-hidden rounded-full">
              {thread.avatarUrl ? (
                <img 
                  src={thread.avatarUrl} 
                  alt={`${thread.author} avatar`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center text-sm font-light text-gray-700 ${thread.avatarUrl ? 'hidden' : ''}`}>
                {thread.avatar}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <h3
                  onClick={() => thread.username && onNavigateToProfile(thread.username)}
                  className="font-light text-gray-900 cursor-pointer text-sm sm:text-base truncate"
                >
                  {thread.author}
                </h3>
                <span className="text-gray-500 text-xs sm:text-sm truncate">{thread.handle}</span>
                <span className="text-gray-400 hidden sm:inline">·</span>
                <span className="text-gray-500 text-xs sm:text-sm">{thread.timestamp}</span>
              </div>
              <p onClick={() => onNavigateToPost(thread.id)} className="text-gray-900 mt-1 leading-normal text-xs sm:text-sm cursor-pointer">
                {thread.content}
              </p>
              
              {/* Display media items */}
              {thread.media_items && thread.media_items.length > 0 && (
                <div className="mt-3">
                  <MediaGrid
                    mediaItems={thread.media_items}
                    onMediaClick={(mediaIndex) => handleMediaClick(mediaIndex, thread.media_items)}
                    className="rounded-lg overflow-hidden"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between max-w-xs sm:max-w-md">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors duration-200 group"
                  onClick={() => onNavigateToPost(thread.id)}
                >
                  <div className="p-1 sm:p-2 group-hover:bg-blue-50 rounded-full">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm">{thread.replies}</span>
                </button>
                
                <button 
                  onClick={() => onRepost(thread.id)}
                  disabled={repostingThreadId === thread.id}
                  className={`flex items-center space-x-1 transition-colors duration-200 group ${
                    thread.isReposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
                  } ${repostingThreadId === thread.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="p-1 sm:p-2 group-hover:bg-green-50 rounded-full">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm">{thread.reposts}</span>
                </button>
                
                <button 
                  onClick={() => onLike(thread.id, thread.isLiked)}
                  disabled={likingThreadId === thread.id}
                  className={`flex items-center space-x-1 transition-colors duration-200 group ${
                    thread.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  } ${likingThreadId === thread.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="p-1 sm:p-2 group-hover:bg-red-50 rounded-full">
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${thread.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm">{thread.likes}</span>
                </button>
                
                <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200 group">
                  <div className="p-1 sm:p-2 group-hover:bg-gray-50">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Media Viewer */}
      <MediaViewer
        mediaItems={mediaViewerState.mediaItems}
        initialIndex={mediaViewerState.initialIndex}
        isOpen={mediaViewerState.isOpen}
        onClose={closeMediaViewer}
      />
    </div>
  );
};

export default MainFeed; 