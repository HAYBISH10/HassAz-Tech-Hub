import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";
import { useUserAuth } from "../context/UserAuthContext";
import { fetchCurrentUser, saveUserSession } from "../services/userAuth";

function safeNext(value) {
  const next = String(value || "/account");
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/account";
  return next;
}

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { adoptSession } = useUserAuth();

  useEffect(() => {
    const token = params.get("token");
    const expiresAt = Number(params.get("expiresAt") || 0);
    const next = safeNext(params.get("next"));
    if (token && expiresAt) saveUserSession({ token, expiresAt });
    fetchCurrentUser()
      .then((user) => {
        if (!user) {
          navigate("/login?google=error", { replace: true });
          return;
        }
        adoptSession({ user });
        navigate(next, { replace: true });
      })
      .catch(() => navigate("/login?google=error", { replace: true }));
  }, [adoptSession, navigate, params]);

  return (
    <section className="relative min-h-[40vh]">
      <PageLoader overlay label="Finishing Google sign-in..." />
    </section>
  );
}
