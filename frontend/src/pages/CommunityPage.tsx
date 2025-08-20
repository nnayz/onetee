import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthAPI } from "@/lib/api/auth";
import { CommunityAPI } from "@/lib/api/community";

interface Thread {
  id: string;
  author: string;
  handle: string;
  username?: string;
  authorId?: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  reposts: number;
  avatar: string;
  isLiked: boolean;
  isReposted: boolean;
}

// Raw post shape as returned by the backend `/community/posts` endpoint
interface PostWithAuthor {
  id: string;
  author_id: string;
  content: string;
  in_reply_to_id?: string | null;
  created_at: string;
  updated_at: string;
  media_items: unknown[];
  author: {
    id: string;
    username: string;
    display_name?: string | null;
  };
  likes: number;
  reposts: number;
  replies: number;
}

interface TrendingTag {
  tag: string;
  count: number;
}

interface ActivityItem {
  id: string;
  type: string;
  post_id?: string | null;
  actor?: { username?: string | null; display_name?: string | null };
}

const CommunityPage: FC = () => {
  const navigate = useNavigate();
  const [newThread, setNewThread] = useState("");
  const [postError, setPostError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  const meQuery = useQuery({ queryKey: ["me"], queryFn: AuthAPI.me });

  // Track local interactions to show immediate feedback without mutating cache shape
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [repostedIds, setRepostedIds] = useState<Set<string>>(new Set());

  // Load posts from backend (newest first) and map to display threads via select
  const postsQuery = useQuery<PostWithAuthor[], Error, Thread[]>({
    queryKey: ["community", "posts", { tag: selectedTag || null }],
    queryFn: () => CommunityAPI.listPosts({ limit: 50, tag: selectedTag || undefined }),
    select: (data) =>
      (data || []).map((p) => ({
        id: p.id,
        author: p.author?.display_name || p.author?.username || "",
        handle: `@${p.author?.username || ""}`,
        username: p.author?.username,
        authorId: p.author?.id,
        content: p.content,
        timestamp: new Date(p.created_at).toLocaleString(),
        likes: p.likes ?? 0,
        replies: p.replies ?? 0,
        reposts: p.reposts ?? 0,
        avatar: (p.author?.username || "").slice(0, 2).toUpperCase(),
        isLiked: likedIds.has(p.id),
        isReposted: repostedIds.has(p.id),
      })),
  });

  const activityQuery = useQuery<ActivityItem[]>({
    queryKey: ["community", "activity"],
    queryFn: () => CommunityAPI.recentActivity(),
    enabled: !!meQuery.data?.id,
  });

  // Who to follow removed

  const trendingQuery = useQuery<TrendingTag[]>({
    queryKey: ["community", "trending"],
    queryFn: () => CommunityAPI.trendingTags(),
  });

  function getErrorMessage(err: unknown): string {
    if (typeof err === "object" && err !== null) {
      const e = err as { detail?: string; message?: string; response?: { data?: { detail?: string } } };
      return e.response?.data?.detail || e.detail || e.message || "Unable to post right now";
    }
    return "Unable to post right now";
  }

  const createPost = useMutation({
    mutationFn: async (payload: { content: string; mediaKeys?: string[] }) =>
      CommunityAPI.createPost({
        content: payload.content,
        media_keys: payload.mediaKeys || null,
      }),
    onSuccess: () => {
      setNewThread("");
      setFiles([]);
      setPostError(null);
      // Refetch to get server UUIDs (avoid temp ids)
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
    onError: (e) => {
      setPostError(getErrorMessage(e));
    }
  });

  const isUuid = (v: string) => /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(v);

  const handlePostThread = async () => {
    const content = newThread.trim();
    if (!content || !meQuery.data?.id) return;
    try {
      let mediaKeys: string[] = [];
      if (files.length > 0) {
        // Upload each file using presigned URLs
        const uploads = await Promise.all(files.map(async (f) => {
          const presign = await CommunityAPI.presignMedia({ filename: f.name, content_type: f.type || "application/octet-stream" });
          await fetch(presign.url, { method: "PUT", body: f, headers: { "Content-Type": f.type || "application/octet-stream" } });
          return presign.object_key as string;
        }));
        mediaKeys = uploads.filter(Boolean);
      }
      createPost.mutate({ content, mediaKeys });
    } catch (e) {
      setPostError(getErrorMessage(e));
    }
  };

  const handleLike = (threadId: string) => {
    if (!meQuery.data?.id) return;
    if (!isUuid(threadId)) return; // avoid 422 for temp ids
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId); else next.add(threadId);
      return next;
    });
    CommunityAPI.likePost(threadId).then(() => {
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    }).catch(() => {
      // revert on error
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(threadId)) next.delete(threadId); else next.add(threadId);
        return next;
      });
    });
  };

  const handleRepost = (threadId: string) => {
    if (!meQuery.data?.id) return;
    if (!isUuid(threadId)) return; // avoid 422 for temp ids
    setRepostedIds((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId); else next.add(threadId);
      return next;
    });
    CommunityAPI.repostPost(threadId).then(() => {
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    }).catch(() => {
      // revert on error
      setRepostedIds((prev) => {
        const next = new Set(prev);
        if (next.has(threadId)) next.delete(threadId); else next.add(threadId);
        return next;
      });
    });
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Hamburger Menu - Hidden on mobile when bottom nav is present */}
      <div className="lg:block">
        <HamburgerMenu />
      </div>
      
      {/* Navbar */}
      <Navbar />
      
      {/* Twitter-like Layout */}
      <div className="flex max-w-7xl mx-auto pt-16">
        
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-64 p-6 border-r border-gray-200 min-h-screen">
          <div className="sticky top-24">
            <h2 className="text-xl font-light text-gray-900 mb-6">OneTee Community</h2>
            
            {/* Navigation - only Community */}
            <nav className="space-y-2">
              <div className="flex items-center space-x-3 p-3 bg-gray-100 text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-light">Community</span>
              </div>
            </nav>

            {/* Trending Topics - live */}
            <div className="mt-8">
              <h3 className="text-lg font-light text-gray-900 mb-4">Trending</h3>
              <div className="space-y-3">
                {Array.isArray(trendingQuery.data) && trendingQuery.data.map((t) => (
                  <div key={t.tag} className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200" onClick={() => setSelectedTag(t.tag)}>
                    <p className="text-sm font-light text-gray-900">#{t.tag}</p>
                    <p className="text-xs text-gray-500">{t.count} posts</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 w-full lg:max-w-2xl lg:border-r border-gray-200 min-h-screen">
          {/* Header */}
          <div className="sticky top-16 bg-white/80 backdrop-blur border-b border-gray-200 p-4">
            <div>
              <h1 className="text-xl font-light text-gray-900">Community</h1>
              <p className="text-sm text-gray-500 mt-1 hidden sm:block">Connect with the OneTee family</p>
            </div>
          </div>

          {/* Post Composer */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 flex items-center justify-center text-sm font-light text-gray-700 flex-shrink-0">
                {meQuery.data?.username ? meQuery.data.username.slice(0,2).toUpperCase() : '—'}
              </div>
              <div className="flex-1">
                <textarea
                  value={newThread}
                  onChange={(e) => setNewThread(e.target.value)}
                  placeholder="What's happening in your OneTee journey?"
                  className="w-full p-0 border-none resize-none focus:outline-none text-base sm:text-lg placeholder-gray-500"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-2 sm:space-x-4 text-gray-400">
                    <label className="cursor-pointer hover:text-gray-600">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                    </label>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 hover:text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 3v10a2 2 0 002 2h6a2 2 0 002-2V7M7 7h10" />
                    </svg>
                    <span className="text-xs sm:text-sm">{280 - newThread.length}</span>
                  </div>
                  <button
                    onClick={handlePostThread}
                    disabled={!newThread.trim() || newThread.length > 280 || !meQuery.data?.id}
                    className="px-4 py-2 sm:px-6 bg-gray-900 text-white font-light hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm sm:text-base"
                  >
                    {meQuery.data?.id ? 'Post' : 'Sign in to Post'}
                  </button>
                </div>
                {files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {files.map((f, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700">{f.name}</span>
                    ))}
                  </div>
                )}
                {postError && (
                  <p className="mt-2 text-sm text-red-600">{postError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="pb-20 lg:pb-0">
            {(postsQuery.data || []).map((thread, index) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-200 p-3 sm:p-4 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-light text-gray-700 flex-shrink-0">
                    {thread.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <h3
                        onClick={() => thread.username && navigate(`/u/${thread.username}`)}
                        className="font-light text-gray-900 hover:underline cursor-pointer text-sm sm:text-base truncate"
                      >
                        {thread.author}
                      </h3>
                      <span className="text-gray-500 text-xs sm:text-sm truncate">{thread.handle}</span>
                      <span className="text-gray-400 hidden sm:inline">·</span>
                      <span className="text-gray-500 text-xs sm:text-sm">{thread.timestamp}</span>
                    </div>
                    <p onClick={() => navigate(`/post/${thread.id}`)} className="text-gray-900 mt-1 leading-normal text-sm sm:text-base hover:underline cursor-pointer">
                      {thread.content}
                    </p>
                    <div className="flex items-center justify-between max-w-xs sm:max-w-md mt-3">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors duration-200 group"
                        onClick={() => navigate(`/post/${thread.id}`)}
                      >
                        <div className="p-1 sm:p-2 group-hover:bg-blue-50">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm">{thread.replies}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleRepost(thread.id)}
                        className={`flex items-center space-x-1 transition-colors duration-200 group ${
                          thread.isReposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
                        }`}
                      >
                        <div className="p-1 sm:p-2 group-hover:bg-green-50">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm">{thread.reposts + (thread.isReposted ? 1 : 0)}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleLike(thread.id)}
                        className={`flex items-center space-x-1 transition-colors duration-200 group ${
                          thread.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <div className="p-1 sm:p-2 group-hover:bg-red-50">
                          <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${thread.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm">{thread.likes + (thread.isLiked ? 1 : 0)}</span>
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
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden xl:block w-80 p-6">
          <div className="sticky top-24 space-y-6">
            
            

            {/* Who to Follow removed */}

            {/* Recent Activity - live */}
            {meQuery.data?.id && (
              <div className="bg-gray-50 p-4">
                <h3 className="text-xl font-light text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  {(activityQuery.data || []).map((n) => (
                    <p key={n.id} className="text-gray-600">
                      <span className="font-light">{n.actor?.display_name || n.actor?.username}</span> {n.type}{n.post_id ? ' your post' : ''}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Twitter-like */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          <button 
            onClick={() => navigate("/")}
            className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-light">Home</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 transition-colors duration-200">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-light">Explore</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-4 text-gray-900 transition-colors duration-200">
            <svg className="w-6 h-6 mb-1" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs font-light">Community</span>
          </button>
          
          <button 
            onClick={() => navigate("/marketplace")}
            className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs font-light">Shop</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 transition-colors duration-200">
            <div className="w-6 h-6 bg-gray-300 mb-1 flex items-center justify-center">
              <span className="text-xs font-light text-gray-700">Y</span>
            </div>
            <span className="text-xs font-light">Profile</span>
          </button>
        </div>
      </div>


    </div>
  );
};

export default CommunityPage;