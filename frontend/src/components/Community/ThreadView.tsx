import { useMutation, useQuery } from "@tanstack/react-query";
import { CommunityAPI } from "@/lib/api/community";
import { AuthAPI } from "@/lib/api/auth";
import { useState } from "react";
import { motion } from "framer-motion";
import MediaGrid from "./MediaGrid";
import MediaViewer from "./MediaViewer";
import ThreadCard from "./ThreadCard";
import type { MediaItem, ThreadWithAuthor } from "@/types/community.types";

interface ThreadViewProps {
  threadId: string;
  onBack: () => void;
  onNavigateToProfile: (username: string) => void;
}

const ThreadView: React.FC<ThreadViewProps> = ({ 
  threadId, 
  onBack, 
  onNavigateToProfile 
}) => {
  const me = useQuery({ queryKey: ["me"], queryFn: AuthAPI.me });
  const threadQuery = useQuery({ 
    queryKey: ["thread", threadId], 
    queryFn: () => CommunityAPI.getThreadWithReplies(threadId), 
    enabled: !!threadId 
  });
  
  const [reply, setReply] = useState("");
  const [mediaViewerState, setMediaViewerState] = useState<{
    isOpen: boolean;
    mediaItems: MediaItem[];
    initialIndex: number;
  }>({
    isOpen: false,
    mediaItems: [],
    initialIndex: 0
  });

  const replyMutation = useMutation({
    mutationFn: (content: string) => CommunityAPI.replyToThread(threadId, content),
    onSuccess: () => {
      setReply("");
      threadQuery.refetch();
    }
  });

  const likeMutation = useMutation({
    mutationFn: (threadId: string) => CommunityAPI.likeThread(threadId),
    onSuccess: () => {
      threadQuery.refetch();
    }
  });

  const unlikeMutation = useMutation({
    mutationFn: (threadId: string) => CommunityAPI.unlikeThread(threadId),
    onSuccess: () => {
      threadQuery.refetch();
    }
  });

  const handleLikeToggle = (threadId: string, isCurrentlyLiked: boolean) => {
    if (isCurrentlyLiked) {
      unlikeMutation.mutate(threadId);
    } else {
      likeMutation.mutate(threadId);
    }
  };

  const repostMutation = useMutation({
    mutationFn: (threadId: string) => CommunityAPI.repostThread(threadId),
    onSuccess: () => {
      threadQuery.refetch();
    }
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

  const t = threadQuery.data;
  const thread = t?.thread;
  const replies = t?.replies || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header with Back */}
      <div className="sticky top-16 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="flex items-center px-4 h-12">
          <button
            aria-label="Back"
            onClick={onBack}
            className="mr-3 p-2 hover:bg-gray-100 active:bg-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-medium text-gray-900">Thread</h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {threadQuery.isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {thread && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Main Thread */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-light text-gray-700 flex-shrink-0 overflow-hidden rounded-full">
                  {thread.author?.avatar_url ? (
                    <img 
                      src={thread.author.avatar_url} 
                      alt={`${thread.author.display_name || thread.author.username} avatar`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {(thread.author?.display_name || thread.author?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 
                      className="font-medium text-gray-900 cursor-pointer hover:underline"
                      onClick={() => thread.author?.username && onNavigateToProfile(thread.author.username)}
                    >
                      {thread.author?.display_name || thread.author?.username || 'Unknown User'}
                    </h3>
                    <span className="text-gray-500 text-sm">@{thread.author?.username || 'unknown'}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500 text-sm">{new Date(thread.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="text-gray-900 whitespace-pre-wrap mt-2 text-base leading-relaxed">
                    {thread.content}
                  </div>

                  {/* Media Grid */}
                  {thread.media_items && thread.media_items.length > 0 && (
                    <div className="mt-4">
                      <MediaGrid
                        mediaItems={thread.media_items}
                        onMediaClick={(mediaIndex) => handleMediaClick(mediaIndex, thread.media_items)}
                        className="overflow-hidden"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between max-w-md mt-4">
                    <button 
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors duration-200"
                      onClick={() => {
                        if (me.data?.id) {
                          document.getElementById('reply-textarea')?.focus();
                        }
                      }}
                    >
                      <div className="p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span className="text-sm">{thread.replies || 0}</span>
                    </button>
                    
                    <button 
                      onClick={() => repostMutation.mutate(thread.id)}
                      disabled={repostMutation.isPending}
                      className={`flex items-center space-x-2 transition-colors duration-200 ${
                        thread.is_reposted ? 'text-green-500' : 'text-gray-600 hover:text-green-500'
                      }`}
                    >
                      <div className="p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <span className="text-sm">{thread.reposts || 0}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleLikeToggle(thread.id, thread.is_liked)}
                      disabled={likeMutation.isPending || unlikeMutation.isPending}
                      className={`flex items-center space-x-2 transition-colors duration-200 ${
                        thread.is_liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <div className="p-2">
                        <svg className={`w-5 h-5 ${thread.is_liked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <span className="text-sm">{thread.likes || 0}</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                      <div className="p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reply Compose (above replies) */}
            {me.data?.id && (
              <div className="border-t border-gray-200">
                <div className="py-4">
                  <div className="text-sm text-gray-500">
                    Replying to <span className="text-gray-700">@{thread.author?.username || 'unknown'}</span>
                  </div>
                  <div className="flex mt-3">
                    <div className="w-10 h-10 bg-gray-200 overflow-hidden flex-shrink-0 rounded-full">
                      {me.data?.avatar_url ? (
                        <img src={me.data.avatar_url} alt="me" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          {(me.data?.username || '').slice(0,1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <form 
                      className="flex-1 ml-3"
                      onSubmit={(e) => { 
                        e.preventDefault(); 
                        if (me.data?.id && reply.trim()) replyMutation.mutate(reply); 
                      }}
                    >
                      <textarea 
                        id="reply-textarea"
                        value={reply} 
                        onChange={(e) => setReply(e.target.value)} 
                        className="w-full text-base placeholder-gray-500 focus:outline-none border-0 focus:ring-0 resize-none min-h-[72px]"
                        rows={3} 
                        placeholder="Post your reply"
                        disabled={replyMutation.isPending}
                      />
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-3 text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828V7h-2.828z"/></svg>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h18M3 12h18M3 19h18"/></svg>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6"/></svg>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-sm text-gray-500 hidden sm:block">{reply.length}/280</div>
                          <button 
                            disabled={!me.data?.id || !reply.trim() || replyMutation.isPending} 
                            className="px-5 py-1.5 bg-gray-900 text-white font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                          >
                            {replyMutation.isPending ? 'Posting...' : 'Reply'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Replies (below compose) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Replies</h3>
              
              {replies && replies.length > 0 ? (
                replies.map((reply: ThreadWithAuthor) => (
                  <ThreadCard
                    key={reply.id}
                    id={reply.id}
                    content={reply.content}
                    author={reply.author}
                    created_at={reply.created_at}
                    media_items={reply.media_items}
                    likes={reply.likes}
                    replies={reply.replies}
                    reposts={reply.reposts}
                    is_liked={reply.is_liked}
                    is_reposted={reply.is_reposted}
                    onLike={handleLikeToggle}
                    onRepost={(threadId) => repostMutation.mutate(threadId)}
                    onReply={(threadId) => {
                      // Navigate to the same thread view but focus on the reply
                      window.location.hash = `#reply-${threadId}`;
                    }}
                    onMediaClick={handleMediaClick}
                    onNavigateToProfile={onNavigateToProfile}
                    compact={true}
                    className="border-b border-gray-100"
                    isLiking={likeMutation.isPending}
                    isReposting={repostMutation.isPending}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No replies yet. Be the first to reply!</p>
                </div>
              )}
            </div>

            {/* Media Viewer */}
            <MediaViewer
              mediaItems={mediaViewerState.mediaItems}
              initialIndex={mediaViewerState.initialIndex}
              isOpen={mediaViewerState.isOpen}
              onClose={closeMediaViewer}
            />
          </motion.div>
        )}

        {threadQuery.error && (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load thread. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadView; 