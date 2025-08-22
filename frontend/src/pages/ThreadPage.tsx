import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CommunityAPI } from "@/lib/api/community";
import { AuthAPI } from "@/lib/api/auth";
import { useState } from "react";
import { motion } from "framer-motion";
import MediaGrid from "@/components/Community/MediaGrid";
import MediaViewer from "@/components/Community/MediaViewer";
import ThreadCard from "@/components/Community/ThreadCard";
import type { MediaItem } from "@/types/community.types";

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const me = useQuery({ queryKey: ["me"], queryFn: AuthAPI.me });
  const threadQuery = useQuery({ queryKey: ["thread", id], queryFn: () => CommunityAPI.getThreadWithReplies(id as string), enabled: !!id });
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
    mutationFn: (content: string) => CommunityAPI.replyToThread(id as string, content),
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
      <div className="max-w-3xl mx-auto px-4 pt-24">
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
                    <h3 className="font-medium text-gray-900 cursor-pointer hover:underline">
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
                        className="rounded-xl overflow-hidden"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between max-w-md mt-4">
                    <button 
                      className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors duration-200 group"
                      onClick={() => {
                        if (me.data?.id) {
                          // Focus on reply textarea
                          document.getElementById('reply-textarea')?.focus();
                        }
                      }}
                    >
                      <div className="p-2 group-hover:bg-blue-50 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span className="text-sm">{thread.replies || 0}</span>
                    </button>
                    
                    <button 
                      onClick={() => repostMutation.mutate(thread.id)}
                      disabled={repostMutation.isPending}
                      className={`flex items-center space-x-2 transition-colors duration-200 group ${
                        thread.is_reposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
                      }`}
                    >
                      <div className="p-2 group-hover:bg-green-50 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <span className="text-sm">{thread.reposts || 0}</span>
                    </button>
                    
                    <button 
                      onClick={() => likeMutation.mutate(thread.id)}
                      disabled={likeMutation.isPending}
                      className={`flex items-center space-x-2 transition-colors duration-200 group ${
                        thread.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <div className="p-2 group-hover:bg-red-50 rounded-full">
                        <svg className={`w-5 h-5 ${thread.is_liked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <span className="text-sm">{thread.likes || 0}</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 group">
                      <div className="p-2 group-hover:bg-gray-50 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Replies */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Replies</h3>
              
              {replies && replies.length > 0 ? (
                replies.map((reply: any, index: number) => (
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
                    onLike={(threadId) => likeMutation.mutate(threadId)}
                    onRepost={(threadId) => repostMutation.mutate(threadId)}
                    onReply={(threadId) => navigate(`/thread/${threadId}`)}
                    onMediaClick={handleMediaClick}
                    onNavigateToProfile={(username) => navigate(`/profile/${username}`)}
                    compact={true}
                    className="border-b border-gray-100"
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No replies yet. Be the first to reply!</p>
                </div>
              )}
            </div>

            {/* Reply Form */}
            {me.data?.id && (
              <div className="border-t border-gray-200 pt-6">
                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  if (me.data?.id && reply.trim()) replyMutation.mutate(reply); 
                }}>
                  <textarea 
                    id="reply-textarea"
                    value={reply} 
                    onChange={(e) => setReply(e.target.value)} 
                    className="w-full border border-gray-200 p-4 focus:outline-none focus:border-gray-900 rounded-lg resize-none" 
                    rows={3} 
                    placeholder="Write a reply..."
                    disabled={replyMutation.isPending}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm text-gray-500">
                      {reply.length}/280 characters
                    </div>
                    <button 
                      disabled={!me.data?.id || !reply.trim() || replyMutation.isPending} 
                      className="px-6 py-2 bg-gray-900 text-white font-medium rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                    >
                      {replyMutation.isPending ? 'Posting...' : 'Reply'}
                    </button>
                  </div>
                </form>
              </div>
            )}

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
}

