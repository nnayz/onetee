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
  const queryClient = useQueryClient();

  const meQuery = useQuery({ queryKey: ["me"], queryFn: AuthAPI.me });

  // Track local interactions to show immediate feedback without mutating cache shape
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [repostedIds, setRepostedIds] = useState<Set<string>>(new Set());

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
        isLiked: likedIds.has(p.id),
        isReposted: repostedIds.has(p.id),
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

  const handleLike = (threadId: string) => {
    if (!meQuery.data?.id) return;
    if (!isUuid(threadId)) return; // avoid 422 for temp ids
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId); else next.add(threadId);
      return next;
    });
    		CommunityAPI.likeThread(threadId).then(() => {
			queryClient.invalidateQueries({ queryKey: ["community", "threads"] });
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
    		CommunityAPI.repostThread(threadId).then(() => {
			queryClient.invalidateQueries({ queryKey: ["community", "threads"] });
    }).catch(() => {
      // revert on error
      setRepostedIds((prev) => {
        const next = new Set(prev);
        if (next.has(threadId)) next.delete(threadId); else next.add(threadId);
        return next;
      });
    });
  };

  	const handleNavigateToThread = (threadId: string) => {
		navigate(`/thread/${threadId}`);
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
      <div className="flex max-w-7xl mx-auto pt-16">
        
        {/* Left Sidebar */}
        <LeftSidebar
          trendingTags={trendingQuery.data || []}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
        />

        {/* Main Feed */}
        <div className="flex-1 w-full lg:max-w-xl lg:border-r border-gray-200 min-h-screen">
          		{/* Thread Composer */}
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

          {/* Feed */}
          <MainFeed
            threads={threadsQuery.data || []}
            onLike={handleLike}
            onRepost={handleRepost}
            onNavigateToPost={handleNavigateToThread}
            onNavigateToProfile={handleNavigateToProfile}
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