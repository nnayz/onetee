import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { CommunityAPI } from "@/lib/api/community";
import { AuthAPI } from "@/lib/api/auth";
import { useState } from "react";

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const me = useQuery({ queryKey: ["me"], queryFn: AuthAPI.me });
  const threadQuery = useQuery({ queryKey: ["thread", id], queryFn: () => CommunityAPI.getThread(id as string), enabled: !!id });
  const [reply, setReply] = useState("");
  const replyMutation = useMutation({
    mutationFn: (content: string) => CommunityAPI.replyToPost(id as string, content),
    onSuccess: () => {
      setReply("");
      threadQuery.refetch();
    }
  });

  const t = threadQuery.data;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24">
        {t && (
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-6">
              <div className="text-gray-900 whitespace-pre-wrap">{t.post.content}</div>
              <div className="text-xs text-gray-500 mt-2">{new Date(t.post.created_at).toLocaleString()}</div>
            </div>

            <div className="space-y-6">
              {(t.replies || []).map((r: any) => (
                <div key={r.id} className="border-b border-gray-100 pb-4">
                  <div className="text-gray-900 whitespace-pre-wrap">{r.content}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(r.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (me.data?.id && reply.trim()) replyMutation.mutate(reply); }}>
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} className="w-full border border-gray-200 p-3 focus:outline-none focus:border-gray-900" rows={3} placeholder={me.data?.id ? "Write a reply" : "Sign in to reply"} />
              <button disabled={!me.data?.id || !reply.trim()} className="mt-3 px-6 py-2 bg-gray-900 text-white font-light disabled:bg-gray-300">
                Reply
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

