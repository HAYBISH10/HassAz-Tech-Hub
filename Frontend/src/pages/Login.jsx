import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell, { authInputClass } from "../components/auth/AuthShell";
import GoogleButton from "../components/auth/GoogleButton";
import PageLoader from "../components/ui/PageLoader";
import { useUserAuth } from "../context/UserAuthContext";

export default function Login() {
  const { login, isLoggedIn } = useUserAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/account";
  const googleHint = params.get("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    googleHint === "unavailable"
      ? "Google sign-in is not configured yet. Please use your email and password."
      : googleHint === "error"
        ? "Google sign-in could not be completed. Please try again."
        : ""
  );
  const [busy, setBusy] = useState(false);

  if (isLoggedIn) return <Navigate to={next} replace />;

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login({ email, password });
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message || "Incorrect email or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell eyebrow="Student access" title="Login">
      {busy ? <PageLoader overlay label="Signing in..." /> : null}
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy">Email</span>
          <input type="email" className={authInputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy">Password</span>
          <input
            type="password"
            className={authInputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <div className="text-right">
          <Link to={`/forgot-password?next=${encodeURIComponent(next)}`} className="text-sm font-semibold text-gold">
            Forgot Password?
          </Link>
        </div>
        <button type="submit" disabled={busy} className="w-full rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Signing in…" : "Login"}
        </button>
      </form>
      <div className="my-4 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-navy/10" />
        or
        <span className="h-px flex-1 bg-navy/10" />
      </div>
      <GoogleButton
        next={next}
        onError={setError}
      />
      {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <p className="mt-5 text-center text-sm text-muted">
        New to HassAz Tech Hub?{" "}
        <Link to={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-gold">
          Sign Up
        </Link>
      </p>
    </AuthShell>
  );
}
