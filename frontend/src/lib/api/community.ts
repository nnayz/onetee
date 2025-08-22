import { api } from "./client";

export interface CreateThreadPayload {
  content: string;
  in_reply_to_id?: string | null;
  media_keys?: string[] | null;
}

export interface PresignRequest {
  filename: string;
  content_type: string;
}

export const CommunityAPI = {
  listThreads: (params?: { limit?: number; offset?: number; tag?: string }) => api.get(`/community/threads`, { params }).then((r) => r.data),
  createThread: (data: CreateThreadPayload) => api.post("/community/threads", data).then((r) => r.data),
  likeThread: (threadId: string) => api.post(`/community/threads/${threadId}/like`).then((r) => r.data),
  repostThread: (threadId: string) => api.post(`/community/threads/${threadId}/repost`).then((r) => r.data),
  bookmarkThread: (threadId: string) => api.post(`/community/threads/${threadId}/bookmark`).then((r) => r.data),
  deleteThread: (threadId: string) => api.delete(`/community/threads/${threadId}`).then((r) => r.data as { success: boolean }),
  getProfile: (username: string) => api.get(`/community/profiles/${username}`).then((r) => r.data),
  getProfileThreads: (username: string, params?: { limit?: number; offset?: number }) => api.get(`/community/profiles/${username}/threads`, { params }).then((r) => r.data),
  replyToThread: (threadId: string, content: string) => api.post(`/community/threads/${threadId}/reply`, { content }).then((r) => r.data),
  getThread: (threadId: string) => api.get(`/community/threads/${threadId}`).then((r) => r.data),
  getThreadWithReplies: (threadId: string) => api.get(`/community/threads/${threadId}/detail`).then((r) => r.data),
  recentActivity: () => api.get(`/community/activity/recent`).then((r) => r.data),
  trendingTags: () => api.get(`/community/trending/tags`).then((r) => Array.isArray(r.data) ? r.data : []),
  presignMedia: (data: PresignRequest) => api.post(`/community/media/presign`, data).then((r) => r.data),
  attachMedia: (data: { thread_id: string; object_key: string; media_type: string; alt_text?: string | null }) => api.post(`/community/media/attach`, data).then((r) => r.data),
  uploadAvatar: async (file: File) => {
    // 1) Presign upload for avatar
    const form = new FormData();
    form.append("file", file);
    const presign = await api
      .post(`/community/profiles/me/avatar/presign`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data as { url: string; object_key: string });

    // 2) Upload the file to storage using the presigned URL
    // Note: Don't add Content-Type header to presigned URL requests
    await fetch(presign.url, {
      method: "PUT",
      body: file,
      // Remove Content-Type header - presigned URLs are pre-signed with specific headers
    });

    // 3) Attach the uploaded object to the user's profile (backend expects AttachMediaRequest shape)
    const attachPayload = {
      thread_id: "00000000-0000-0000-0000-000000000000", // ignored by backend for avatar attach
      object_key: presign.object_key,
      media_type: "image",
      alt_text: null as string | null,
    };
    return api
      .post(`/community/profiles/me/avatar/attach`, attachPayload)
      .then((r) => r.data as { avatar_url: string });
  },
};

