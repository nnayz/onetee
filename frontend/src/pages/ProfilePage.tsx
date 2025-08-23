import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityAPI } from "@/lib/api/community";
import { AuthAPI } from "@/lib/api/auth";
import { useState } from "react";
import MediaGrid from "@/components/Community/MediaGrid";
import MediaViewer from "@/components/Community/MediaViewer";
import type { MediaItem } from "@/types/community.types";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: AuthAPI.me });
  const profileQuery = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => CommunityAPI.getProfile(username as string),
    enabled: !!username,
  });
  const threadsQuery = useQuery({
    queryKey: ["profile", username, "threads"],
    queryFn: async () => CommunityAPI.getProfileThreads(username as string),
    enabled: !!username,
  });

  const deleteThread = useMutation({
    mutationFn: (threadId: string) => CommunityAPI.deleteThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username, "threads"] });
      queryClient.invalidateQueries({ queryKey: ["community", "threads"] });
    },
  });

  const likeThread = useMutation({
    mutationFn: (threadId: string) => CommunityAPI.likeThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username, "threads"] });
    }
  });

  const unlikeThread = useMutation({
    mutationFn: (threadId: string) => CommunityAPI.unlikeThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username, "threads"] });
    }
  });

  const handleLikeToggle = (threadId: string, isCurrentlyLiked: boolean) => {
    if (isCurrentlyLiked) {
      unlikeThread.mutate(threadId);
    } else {
      likeThread.mutate(threadId);
    }
  };

  const repostThread = useMutation({
    mutationFn: (threadId: string) => CommunityAPI.repostThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username, "threads"] });
    }
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => CommunityAPI.uploadAvatar(file),
    onSuccess: (data) => {
      console.log('Upload success, returned data:', data);
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      console.log("Avatar uploaded successfully!");
    },
    onError: (error) => {
      console.error("Avatar upload failed:", error);
    },
  });

  const logout = useMutation({
    mutationFn: () => AuthAPI.logout(),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      window.location.href = '/login';
    },
  });

  const [mediaViewerState, setMediaViewerState] = useState<{
    isOpen: boolean;
    mediaItems: MediaItem[];
    initialIndex: number;
  }>({
    isOpen: false,
    mediaItems: [],
    initialIndex: 0,
  });

  const handleMediaClick = (mediaIndex: number, mediaItems: MediaItem[]) => {
    setMediaViewerState({
      isOpen: true,
      mediaItems,
      initialIndex: mediaIndex,
    });
  };

  const closeMediaViewer = () => {
    setMediaViewerState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col lg:flex-row">
      {/* Left Sidebar for settings  */}
      <div className="w-full lg:w-1/3 px-6 lg:pl-16">
      {profileQuery.data && (
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center gap-4 lg:gap-6 mb-6">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-neutral-600 relative">
                {uploadAvatar.isPending && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {profileQuery.data.avatar_url ? (
                  <>
                    <img 
                      src={profileQuery.data.avatar_url} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Avatar image failed to load:', e);
                        e.currentTarget.style.display = 'none';
                        const fallbackElement = e.currentTarget.nextElementSibling;
                        if (fallbackElement) {
                          fallbackElement.classList.remove('hidden');
                          fallbackElement.classList.add('flex', 'items-center', 'justify-center');
                        }
                      }}
                    />
                    <div className="w-full h-full text-neutral-600 hidden font-light">
                      {(profileQuery.data.username || "").slice(0,2).toUpperCase()}
                    </div>
                  </>
                ) : (
                  <span className="text-neutral-600 font-light text-lg">
                    {(profileQuery.data.username || "").slice(0,2).toUpperCase()}
                  </span>
                )}
              </div>
              {me.data?.username === username && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-700 transition-colors duration-200 font-light">
                    {uploadAvatar.isPending ? "Uploading..." : "Edit photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadAvatar.isPending}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          if (!f.type.startsWith('image/')) {
                            alert('Please select an image file');
                            return;
                          }
                          if (f.size > 5 * 1024 * 1024) {
                            alert('File size must be less than 5MB');
                            return;
                          }
                          uploadAvatar.mutate(f);
                        }
                      }}
                    />
                  </label>
                  {uploadAvatar.isError && (
                    <p className="text-xs text-red-500 font-light">
                      Upload failed. Please try again.
                    </p>
                  )}
                  {uploadAvatar.isSuccess && (
                    <p className="text-xs text-neutral-600 font-light">
                      Photo updated
                    </p>
                  )}
                </div>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-light text-neutral-900 tracking-wide">{profileQuery.data.display_name || profileQuery.data.username}</h1>
            <p className="text-neutral-500 text-sm font-light mt-1">@{profileQuery.data.username}</p>
            {profileQuery.data.bio && (
              <p className="text-neutral-700 mt-4 lg:mt-6 text-sm leading-relaxed font-light">{profileQuery.data.bio}</p>
            )}
            
            {/* Logout button if user profile is the same as the current user */}
            {me.data?.username === username && (
              <div className="mt-8 lg:mt-12 pt-6 border-t border-neutral-200">
                <button
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  className="text-sm text-neutral-500 hover:text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-light"
                >
                  {logout.isPending ? "Signing out..." : "Sign out"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Right Sidebar for threads */}
      <div className="w-full lg:w-2/3 px-6 lg:pr-16">
      <div className="flex gap-8 mt-4 lg:mt-6 text-sm text-neutral-500 font-light">
              <span>{profileQuery.data?.counts?.threads} posts</span>
        </div>
        
        <div className="space-y-8 lg:space-y-12">
              {(threadsQuery.data || []).map((p: { id: string; content: string; created_at: string; media_items?: MediaItem[]; likes?: number; reposts?: number; replies?: number; is_liked?: boolean; is_reposted?: boolean; }) => (
            <div key={p.id} className="border-b border-neutral-200 pb-8 lg:pb-12">
              <div className="text-neutral-900 text-sm lg:text-base leading-relaxed font-light">{p.content}</div>
              
              {/* Display media items using MediaGrid */}
              {p.media_items && p.media_items.length > 0 && (
                <div className="mt-4 max-w-sm lg:max-w-md">
                  <MediaGrid
                    mediaItems={p.media_items}
                    onMediaClick={(mediaIndex) => handleMediaClick(mediaIndex, p.media_items as MediaItem[])}
                    className="overflow-hidden"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between mt-6 max-w-xs">
                <button className="flex items-center space-x-2 text-neutral-500 hover:text-neutral-700 transition-colors duration-200 group"
                  onClick={() => navigate(`/thread/${p.id}`)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-xs font-light">{p.replies ?? 0}</span>
                </button>
                
                <button 
                  onClick={() => repostThread.mutate(p.id)}
                  className={`flex items-center space-x-2 transition-colors duration-200 group ${
                    p.is_reposted ? 'text-neutral-700' : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-xs font-light">{p.reposts ?? 0}</span>
                </button>
                
                <button 
                  onClick={() => handleLikeToggle(p.id, p.is_liked ?? false)}
                  className={`flex items-center space-x-2 transition-colors duration-200 group ${
                    p.is_liked ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <svg className={`w-4 h-4 ${p.is_liked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-xs font-light">{p.likes ?? 0}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-neutral-500 hover:text-neutral-700 transition-colors duration-200 group">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>

              <div className="text-xs text-neutral-400 mt-4 font-light">{new Date(p.created_at).toLocaleDateString()}</div>
              {me.data?.username === username && (
                <div className="mt-3">
                  <button
                    onClick={() => deleteThread.mutate(p.id)}
                    className="text-xs text-neutral-500 hover:text-neutral-700 font-light"
                    disabled={deleteThread.isPending}
                >
                    {deleteThread.isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Media Viewer for profile posts */}
      <MediaViewer
        mediaItems={mediaViewerState.mediaItems}
        initialIndex={mediaViewerState.initialIndex}
        isOpen={mediaViewerState.isOpen}
        onClose={closeMediaViewer}
      />
    </div>
  );
}

