import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthAPI } from "@/lib/api/auth";
import { CommunityAPI } from "@/lib/api/community";
import type { ThreadWithAuthor, DisplayThread, TrendingTag, ActivityItem } from "@/types/community.types";
import {
  LeftSidebar,
  RightSidebar,
  	ThreadComposer,
  MainFeed,
  MobileNavigation
} from "@/components/Community";

const CommunityPage: FC = () => {
  const navigate = useNavigate();
  const [newThread, setNewThread] = useState("");
  const [threadError, setThreadError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [likingThreadId, setLikingThreadId] = useState<string | null>(null);
  const [repostingThreadId, setRepostingThreadId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [feedScrollPosition, setFeedScrollPosition] = useState<number>(0);
  const queryClient = useQueryClient();

  const meQuery = useQuery({ queryKey: ["me"], queryFn: AuthAPI.me });

  // Load threads from backend (newest first) and map to display threads via select
	const threadsQuery = useQuery<ThreadWithAuthor[], Error, DisplayThread[]>({
		queryKey: ["community", "threads", { tag: selectedTag || null }],
		queryFn: () => CommunityAPI.listThreads({ limit: 50, tag: selectedTag || undefined }),
    select: (data) => {
      		console.log('Raw threads data with media:', data?.map(p => ({ id: p.id, media_count: (p.media_items || []).length, media_urls: p.media_items?.map(m => m.url) })));
      return (data || []).map((p) => ({
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
        avatar: p.author?.avatar_url || (p.author?.username || "").slice(0, 2).toUpperCase(),
        avatarUrl: p.author?.avatar_url || null,
        media_items: p.media_items || [],
        isLiked: p.is_liked ?? false,
        isReposted: p.is_reposted ?? false,
      }));
    },
  });

  const activityQuery = useQuery<ActivityItem[]>({
    queryKey: ["community", "activity"],
    queryFn: () => CommunityAPI.recentActivity(),
    enabled: !!meQuery.data?.id,
  });

  const trendingQuery = useQuery<TrendingTag[]>({
    queryKey: ["community", "trending"],
    queryFn: () => CommunityAPI.trendingTags(),
  });

  function getErrorMessage(err: unknown): string {
    if (typeof err === "object" && err !== null) {
      const e = err as { detail?: string; message?: string; response?: { data?: { detail?: string } } };
      		return e.response?.data?.detail || e.detail || e.message || "Unable to thread right now";
	}
	return "Unable to thread right now";
  }

  	const createThread = useMutation({
		mutationFn: async (payload: { content: string; mediaKeys?: string[] }) =>
			CommunityAPI.createThread({
				content: payload.content,
				media_keys: payload.mediaKeys || null,
			}),
		onSuccess: () => {
			setNewThread("");
			setFiles([]);
			setThreadError(null);
			// Refetch to get server UUIDs (avoid temp ids)
			queryClient.invalidateQueries({ queryKey: ["community", "threads"] });
		},
		onError: (e) => {
			setThreadError(getErrorMessage(e));
		}
	});

  const isUuid = (v: string) => /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(v);

  	const handleCreateThread = async () => {
    const content = newThread.trim();
    if ((!content && files.length === 0) || !meQuery.data?.id) return;
    try {
      let mediaKeys: string[] = [];
      if (files.length > 0) {
        // Upload each file using presigned URLs
        const uploads = await Promise.all(files.map(async (f) => {
          const presign = await CommunityAPI.presignMedia({ filename: f.name, content_type: f.type || "application/octet-stream" });
          // Note: Don't add Content-Type header to presigned URL requests
          await fetch(presign.url, { method: "PUT", body: f });
          return presign.object_key as string;
        }));
        mediaKeys = uploads.filter(Boolean);
      }
      		createThread.mutate({ content, mediaKeys });
    		} catch (e) {
			setThreadError(getErrorMessage(e));
		}
  };

  const handleLike = (threadId: string, isCurrentlyLiked: boolean) => {
    if (!meQuery.data?.id) return;
    if (!isUuid(threadId)) return; // avoid 422 for temp ids
    if (likingThreadId === threadId) return; // prevent multiple clicks
    
    setLikingThreadId(threadId);
    
    // Call appropriate API
    const apiCall = isCurrentlyLiked 
      ? CommunityAPI.unlikeThread(threadId)
      : CommunityAPI.likeThread(threadId);

    apiCall.then(() => {
      queryClient.invalidateQueries({ queryKey: ["community", "threads"] });
    }).catch(() => {
      // Error handling - could show a toast notification here
      console.error("Failed to update like status");
    }).finally(() => {
      setLikingThreadId(null);
    });
  };

  const handleRepost = (threadId: string) => {
    if (!meQuery.data?.id) return;
    if (!isUuid(threadId)) return; // avoid 422 for temp ids
    if (repostingThreadId === threadId) return; // prevent multiple clicks
    
    setRepostingThreadId(threadId);
    
    CommunityAPI.repostThread(threadId).then(() => {
      queryClient.invalidateQueries({ queryKey: ["community", "threads"] });
    }).catch(() => {
      // Error handling - could show a toast notification here
      console.error("Failed to repost thread");
    }).finally(() => {
      setRepostingThreadId(null);
    });
  };

  	const handleNavigateToThread = (threadId: string) => {
		// Save current scroll position before opening thread
		setFeedScrollPosition(window.scrollY);
		setSelectedThreadId(threadId);
		// Scroll to top when opening thread
		window.scrollTo(0, 0);
	};

  const handleBackToFeed = () => {
    setSelectedThreadId(null);
    // Restore scroll position after a brief delay to ensure DOM is updated
    setTimeout(() => {
      window.scrollTo(0, feedScrollPosition);
    }, 100);
  };

  const handleNavigateToProfile = (username: string) => {
    navigate(`/u/${username}`);
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  const handleNavigateMarketplace = () => {
    navigate("/marketplace");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hamburger Menu - Hidden on mobile when bottom nav is present */}
      <div className="lg:block">
        <HamburgerMenu />
      </div>

      {/* Twitter-like Layout */}
      <div className="flex max-w-7xl mx-auto justify-center">
        
        {/* Left Sidebar */}
        <LeftSidebar
          trendingTags={trendingQuery.data || []}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
        />

        {/* Main Feed */}
        <div className="flex-1 w-full lg:max-w-xl lg:border-r border-gray-200 min-h-screen">
          {/* Thread Composer - only show when not viewing a thread */}
          {!selectedThreadId && (
            <ThreadComposer
              newThread={newThread}
              setNewThread={setNewThread}
              files={files}
              setFiles={setFiles}
              postError={threadError}
              onPost={handleCreateThread}
              isAuthenticated={!!meQuery.data?.id}
              userAvatar={meQuery.data?.avatar_url}
              username={meQuery.data?.username}
              isPosting={createThread.isPending}
            />
          )}

          {/* Feed */}
          <MainFeed
            threads={threadsQuery.data || []}
            onLike={handleLike}
            onRepost={handleRepost}
            onNavigateToPost={handleNavigateToThread}
            onNavigateToProfile={handleNavigateToProfile}
            likingThreadId={likingThreadId}
            repostingThreadId={repostingThreadId}
            selectedThreadId={selectedThreadId}
            onBackToFeed={handleBackToFeed}
          />
        </div>

        {/* Right Sidebar */}
        <RightSidebar
          activityItems={activityQuery.data || []}
          isAuthenticated={!!meQuery.data?.id}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        onNavigateHome={handleNavigateHome}
        onNavigateMarketplace={handleNavigateMarketplace}
      />
    </div>
  );
};

export default CommunityPage;