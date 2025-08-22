import React from 'react';
import { motion } from 'framer-motion';
import type { MediaItem } from '@/types/community.types';
import MediaGrid from './MediaGrid';

interface ThreadCardProps {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  created_at: string;
  media_items: MediaItem[];
  likes: number;
  replies: number;
  reposts: number;
  is_liked?: boolean;
  is_reposted?: boolean;
  onLike?: (threadId: string) => void;
  onRepost?: (threadId: string) => void;
  onReply?: (threadId: string) => void;
  onMediaClick?: (mediaIndex: number, mediaItems: MediaItem[]) => void;
  onNavigateToProfile?: (username: string) => void;
  className?: string;
  compact?: boolean;
}

const ThreadCard: React.FC<ThreadCardProps> = ({
  id,
  content,
  author,
  created_at,
  media_items,
  likes,
  replies,
  reposts,
  is_liked = false,
  is_reposted = false,
  onLike,
  onRepost,
  onReply,
  onMediaClick,
  onNavigateToProfile,
  className = "",
  compact = false
}) => {
  const avatarSize = compact ? "w-8 h-8" : "w-10 h-10";
  const textSize = compact ? "text-sm" : "text-base";
  const iconSize = compact ? "w-4 h-4" : "w-5 h-5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-b border-gray-200 p-3 sm:p-4 hover:bg-gray-50/50 transition-colors duration-200 ${className}`}
    >
      <div className="flex space-x-2 sm:space-x-3">
        <div className={`${avatarSize} bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-light text-gray-700 flex-shrink-0 overflow-hidden rounded-full`}>
          {author.avatar_url ? (
            <img 
              src={author.avatar_url} 
              alt={`${author.display_name || author.username} avatar`} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center text-sm font-light text-gray-700 ${author.avatar_url ? 'hidden' : ''}`}>
            {(author.display_name || author.username).charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <h3
              onClick={() => onNavigateToProfile?.(author.username)}
              className="font-light text-gray-900 cursor-pointer text-sm sm:text-base truncate hover:underline"
            >
              {author.display_name || author.username}
            </h3>
            <span className="text-gray-500 text-xs sm:text-sm truncate">@{author.username}</span>
            <span className="text-gray-400 hidden sm:inline">·</span>
            <span className="text-gray-500 text-xs sm:text-sm">{new Date(created_at).toLocaleDateString()}</span>
          </div>
          
          <div className={`text-gray-900 mt-1 leading-normal text-xs sm:text-sm ${textSize}`}>
            {content}
          </div>
          
          {/* Media Grid */}
          {media_items && media_items.length > 0 && (
            <div className="mt-3">
              <MediaGrid
                mediaItems={media_items}
                onMediaClick={(mediaIndex) => onMediaClick?.(mediaIndex, media_items)}
                className="rounded-lg overflow-hidden"
              />
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between max-w-xs sm:max-w-md mt-3">
            <button 
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors duration-200 group"
              onClick={() => onReply?.(id)}
            >
              <div className="p-1 sm:p-2 group-hover:bg-blue-50 rounded-full">
                <svg className={`${iconSize}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm">{replies}</span>
            </button>
            
            <button 
              onClick={() => onRepost?.(id)}
              className={`flex items-center space-x-1 transition-colors duration-200 group ${
                is_reposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
              }`}
            >
              <div className="p-1 sm:p-2 group-hover:bg-green-50 rounded-full">
                <svg className={`${iconSize}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm">{reposts}</span>
            </button>
            
            <button 
              onClick={() => onLike?.(id)}
              className={`flex items-center space-x-1 transition-colors duration-200 group ${
                is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <div className="p-1 sm:p-2 group-hover:bg-red-50 rounded-full">
                <svg className={`${iconSize} ${is_liked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm">{likes}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200 group">
              <div className="p-1 sm:p-2 group-hover:bg-gray-50 rounded-full">
                <svg className={`${iconSize}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreadCard; 