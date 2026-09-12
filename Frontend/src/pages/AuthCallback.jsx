import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";
import { useUserAuth } from "../context/UserAuthContext";
import { fetchCurrentUser, saveUserSession } from "../services/userAuth";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { adoptSession } = useUserAuth();

  useEffect(() => {
    const token = params.get("token");
    const expiresAt = Number(params.get("expiresAt") || 0);
    const next = params.get("next") || "/account";
    if (!token || !expiresAt) {
      navigate("/login?google=error", { replace: true });
      return;
    }
    saveUserSession({ token, expiresAt });
    fetchCurrentUser().then((user) => {
      adoptSession({ user });
      navigate(next.startsWith("/") ? next : "/account", { replace: true });
    });
  }, [adoptSession, navigate, params]);

  return (
    <section className="relative min-h-[40vh]">
      <PageLoader overlay label="Finishing Google sign-in..." />
    </section>
  );
}
