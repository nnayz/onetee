import { ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "@/lib/api/auth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const me = useQuery({ queryKey: ["me"], queryFn: AuthAPI.me, retry: false });

  useEffect(() => {
    if (me.isError) {
      navigate("/login", { replace: true });
    }
  }, [me.isError, navigate]);

  if (me.isLoading) {
    return null;
  }

  return <>{children}</>;
}

