import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityAPI } from "@/lib/api/community";
import { AuthAPI } from "@/lib/api/auth";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
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

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => CommunityAPI.uploadAvatar(file),
    onSuccess: (data) => {
      console.log('Upload success, returned data:', data);
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      // Also invalidate any other profile queries that might be cached
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // You could add a toast notification here for success
      console.log("Avatar uploaded successfully!");
    },
    onError: (error) => {
      console.error("Avatar upload failed:", error);
      // You could add a toast notification here
    },
  });

  const logout = useMutation({
    mutationFn: () => AuthAPI.logout(),
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      // Redirect to login page
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Still redirect to login page even if logout fails
      window.location.href = '/login';
    },
  });

  // Follow/Unfollow removed

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar for settings  */}
      <div className="max-w-xl mx-auto px-4 pt-24 w-1/4">
      {profileQuery.data && (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600 relative">
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
                    <div className="w-full h-full text-gray-600 hidden">
                      {(profileQuery.data.username || "").slice(0,2).toUpperCase()}
                    </div>
                  </>
                ) : (
                  (profileQuery.data.username || "").slice(0,2).toUpperCase()
                )}
              </div>
              {me.data?.username === username && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                    {uploadAvatar.isPending ? "Uploading..." : "Change avatar"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadAvatar.isPending}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          // Validate file type
                          if (!f.type.startsWith('image/')) {
                            alert('Please select an image file');
                            return;
                          }
                          // Validate file size (max 5MB)
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
                    <p className="text-xs text-red-600">
                      Upload failed. Please try again.
                    </p>
                  )}
                  {uploadAvatar.isSuccess && (
                    <p className="text-xs text-green-600">
                      Avatar updated successfully!
                    </p>
                  )}
                </div>
              )}
            </div>
            <h1 className="text-3xl font-extralight text-gray-900">{profileQuery.data.display_name || profileQuery.data.username}</h1>
            <p className="text-gray-600">@{profileQuery.data.username}</p>
            <p className="text-gray-700 mt-4">{profileQuery.data.bio}</p>
            
            {/* Logout button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="w-full text-left text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {logout.isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        )}
      </div>
      		{/* Right Sidebar for threads */}
      <div className="max-w-xl mx-auto px-4 pt-24 w-3/4">
      <div className="flex gap-6 mt-4 text-sm text-gray-600">
          		<span>{profileQuery.data?.counts?.threads} Threads</span>
        </div>
        
        <div className="space-y-6">
          		{(threadsQuery.data || []).map((p: { id: string; content: string; created_at: string; media_items?: Array<{ id: string; url: string; media_type: string; alt_text?: string }> }) => (
            <div key={p.id} className="border-b border-gray-200 pb-6">
              <div className="text-gray-900">{p.content}</div>
              
              {/* Display media items */}
              {p.media_items && p.media_items.length > 0 && (
                <div className="mt-3 space-y-2">
                  {p.media_items.map((media: { id: string; url: string; media_type: string; alt_text?: string }) => (
                    <div key={media.id} className="rounded-lg overflow-hidden">
                      {media.media_type === "image" ? (
                        <img 
                          src={media.url} 
                          					alt={media.alt_text || "Thread media"} 
                          className="max-w-full h-auto max-h-96 object-cover"
                        />
                      ) : (
                        <div className="bg-gray-100 p-4 text-center text-gray-500">
                          Media type: {media.media_type}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-2">{new Date(p.created_at).toLocaleString()}</div>
              {me.data?.username === username && (
                <div className="mt-3">
                  <button
                    					onClick={() => deleteThread.mutate(p.id)}
					className="text-xs text-red-600 hover:text-red-700"
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
    </div>
  );
}

