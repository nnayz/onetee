import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthAPI } from "@/lib/api/auth";
import type { LoginPayload } from "@/lib/api/auth";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState<LoginPayload>({ username_or_email: "", password: "" });
  const [reg, setReg] = useState<{ username: string; email: string; password: string; display_name?: string }>({ username: "", email: "", password: "", display_name: "" });
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: AuthAPI.login,
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/community");
    },
    onError: (e: any) => setError(e?.detail ?? "Login failed"),
  });

  const signupMutation = useMutation({
    mutationFn: () => AuthAPI.signup({
      username: reg.username,
      email: reg.email,
      password: reg.password,
      display_name: reg.display_name,
    }),
    onSuccess: async () => {
      setMode("login");
      await loginMutation.mutateAsync({ username_or_email: reg.username, password: reg.password });
    },
    onError: (e: any) => setError(e?.detail ?? "Signup failed"),
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setMode("login")} className={`text-sm ${mode === "login" ? "text-gray-900 border-b border-gray-900" : "text-gray-600 hover:text-gray-900"}`}>Login</button>
          <button onClick={() => setMode("register")} className={`text-sm ${mode === "register" ? "text-gray-900 border-b border-gray-900" : "text-gray-600 hover:text-gray-900"}`}>Register</button>
        </div>

        {mode === "login" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginMutation.mutate(form);
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Username or email</label>
              <input type="text" value={form.username_or_email} onChange={(e) => setForm({ ...form, username_or_email: e.target.value })} className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-900" required />
            </div>
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-900" required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="px-8 py-3 bg-gray-900 text-white font-light tracking-wider hover:bg-gray-800" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              signupMutation.mutate();
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Username</label>
              <input type="text" value={reg.username} onChange={(e) => setReg({ ...reg, username: e.target.value })} className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-900" required />
            </div>
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Email</label>
              <input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-900" required />
            </div>
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Display name (optional)</label>
              <input type="text" value={reg.display_name || ""} onChange={(e) => setReg({ ...reg, display_name: e.target.value })} className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Password</label>
              <input type="password" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-gray-900" required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="px-8 py-3 bg-gray-900 text-white font-light tracking-wider hover:bg-gray-800" disabled={signupMutation.isPending}>
              {signupMutation.isPending ? "Creating..." : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

