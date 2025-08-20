import { api } from "./client";

export interface CreatePostPayload {
  content: string;
  in_reply_to_id?: string | null;
  media_keys?: string[] | null;
}

export interface PresignRequest {
  filename: string;
  content_type: string;
}

export const CommunityAPI = {
  listPosts: (params?: { limit?: number; offset?: number; tag?: string }) => api.get(`/community/posts`, { params }).then((r) => r.data),
  createPost: (data: CreatePostPayload) => api.post("/community/posts", data).then((r) => r.data),
  likePost: (postId: string) => api.post(`/community/posts/${postId}/like`).then((r) => r.data),
  repostPost: (postId: string) => api.post(`/community/posts/${postId}/repost`).then((r) => r.data),
  bookmarkPost: (postId: string) => api.post(`/community/posts/${postId}/bookmark`).then((r) => r.data),
  deletePost: (postId: string) => api.delete(`/community/posts/${postId}`).then((r) => r.data as { success: boolean }),
  getProfile: (username: string) => api.get(`/community/profiles/${username}`).then((r) => r.data),
  getProfilePosts: (username: string, params?: { limit?: number; offset?: number }) => api.get(`/community/profiles/${username}/posts`, { params }).then((r) => r.data),
  replyToPost: (postId: string, content: string) => api.post(`/community/posts/${postId}/reply`, { content }).then((r) => r.data),
  getThread: (postId: string) => api.get(`/community/posts/${postId}`).then((r) => r.data),
  recentActivity: () => api.get(`/community/activity/recent`).then((r) => r.data),
  trendingTags: () => api.get(`/community/trending/tags`).then((r) => Array.isArray(r.data) ? r.data : []),
  presignMedia: (data: PresignRequest) => api.post(`/community/media/presign`, data).then((r) => r.data),
  attachMedia: (data: { post_id: string; object_key: string; media_type: string; alt_text?: string | null }) => api.post(`/community/media/attach`, data).then((r) => r.data),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/community/profiles/me/avatar`, form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data as { avatar_url: string });
  },
};

