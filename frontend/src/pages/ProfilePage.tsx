import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
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
  const postsQuery = useQuery({
    queryKey: ["profile", username, "posts"],
    queryFn: async () => CommunityAPI.getProfilePosts(username as string),
    enabled: !!username,
  });

  const deletePost = useMutation({
    mutationFn: (postId: string) => CommunityAPI.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => CommunityAPI.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  // Follow/Unfollow removed

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24">
        {profileQuery.data && (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600">
                {profileQuery.data.avatar_url ? (
                  <img src={profileQuery.data.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  (profileQuery.data.username || "").slice(0,2).toUpperCase()
                )}
              </div>
              {me.data?.username === username && (
                <label className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                  Change avatar
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadAvatar.mutate(f);
                    }}
                  />
                </label>
              )}
            </div>
            <h1 className="text-3xl font-extralight text-gray-900">{profileQuery.data.display_name || profileQuery.data.username}</h1>
            <p className="text-gray-600">@{profileQuery.data.username}</p>
            <p className="text-gray-700 mt-4">{profileQuery.data.bio}</p>
            <div className="flex gap-6 mt-4 text-sm text-gray-600">
              <span>{profileQuery.data.counts.posts} Posts</span>
            </div>
          </div>
        )}
        <div className="space-y-6">
          {(postsQuery.data || []).map((p: any) => (
            <div key={p.id} className="border-b border-gray-200 pb-6">
              <div className="text-gray-900">{p.content}</div>
              <div className="text-xs text-gray-500 mt-2">{new Date(p.created_at).toLocaleString()}</div>
              {me.data?.username === username && (
                <div className="mt-3">
                  <button
                    onClick={() => deletePost.mutate(p.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                    disabled={deletePost.isPending}
                  >
                    {deletePost.isPending ? "Deleting..." : "Delete"}
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

