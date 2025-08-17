import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { CommunityAPI } from "@/lib/api/community";
import { AuthAPI } from "@/lib/api/auth";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
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

  const followMutation = useMutation({
    mutationFn: async () => CommunityAPI.followUser((profileQuery.data as any).id),
    onSuccess: () => profileQuery.refetch(),
  });
  const unfollowMutation = useMutation({
    mutationFn: async () => CommunityAPI.unfollowUser((profileQuery.data as any).id),
    onSuccess: () => profileQuery.refetch(),
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24">
        {profileQuery.data && (
          <div className="mb-8">
            <h1 className="text-3xl font-extralight text-gray-900">{profileQuery.data.display_name || profileQuery.data.username}</h1>
            <p className="text-gray-600">@{profileQuery.data.username}</p>
            <p className="text-gray-700 mt-4">{profileQuery.data.bio}</p>
            <div className="flex gap-6 mt-4 text-sm text-gray-600">
              <span>{profileQuery.data.counts.posts} Posts</span>
              <span>{profileQuery.data.counts.followers} Followers</span>
              <span>{profileQuery.data.counts.following} Following</span>
            </div>
            {me.data?.id && me.data.username !== profileQuery.data.username && (
              <div className="mt-4">
                {profileQuery.data.is_following ? (
                  <button onClick={() => unfollowMutation.mutate()} className="px-6 py-2 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors font-light">
                    Following
                  </button>
                ) : (
                  <button onClick={() => followMutation.mutate()} className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 font-light">
                    Follow
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        <div className="space-y-6">
          {(postsQuery.data || []).map((p: any) => (
            <div key={p.id} className="border-b border-gray-200 pb-6">
              <div className="text-gray-900">{p.content}</div>
              <div className="text-xs text-gray-500 mt-2">{new Date(p.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

