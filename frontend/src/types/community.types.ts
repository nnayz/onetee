export interface MediaItem {
  id: string;
  url: string;
  media_type: string;
  alt_text?: string;
}

export interface Author {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

export interface CommunityThread {
  id: string;
  author_id: string;
  content: string;
  in_reply_to_id?: string;
  created_at: string;
  updated_at: string;
  media_items: MediaItem[];
  author: Author;
  likes: number;
  reposts: number;
  replies: number;
}

export interface ThreadWithAuthor {
  id: string;
  author_id: string;
  content: string;
  in_reply_to_id?: string;
  created_at: string;
  updated_at: string;
  media_items: MediaItem[];
  author: Author;
  likes: number;
  reposts: number;
  replies: number;
}

export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  counts: {
    threads: number;
  };
}

export interface CreateThreadPayload {
  content: string;
  in_reply_to_id?: string;
  media_keys?: string[];
}

export interface PresignRequest {
  filename: string;
  content_type: string;
}

export interface PresignResponse {
  url: string;
  object_key: string;
}

export interface AttachMediaRequest {
  thread_id: string;
  object_key: string;
  media_type: string;
  alt_text?: string;
}

export interface MediaItemOut {
  id: string;
  url: string;
  media_type: string;
  alt_text?: string;
}

export interface DisplayThread {
  id: string;
  author: string;
  handle: string;
  username: string;
  authorId: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  reposts: number;
  avatar: string;
  avatarUrl: string | null;
  media_items: MediaItem[];
  isLiked: boolean;
  isReposted: boolean;
}

export interface TrendingTag {
  tag: string;
  count: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  content: string;
  timestamp: string;
}