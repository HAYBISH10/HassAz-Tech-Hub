import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminPath } from "../adminPath";
import PageLoader from "../components/ui/PageLoader";
import { adminLogin, clearSession } from "../services/auth";

const inputClass =
  "w-full rounded-md border border-navy/15 px-4 py-3 text-ink outline-none focus:border-gold";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    clearSession();
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminLogin(username.trim(), password);
      navigate(adminPath(), { replace: true });
    } catch (err) {
      setError(err.message || "Incorrect username or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-navy-dark px-4 py-10">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl sm:p-10">
        {busy ? <PageLoader overlay label="Signing in..." /> : null}
        <div className="flex flex-col items-center text-center">
          <img
            src="/brand/logo-mark.png?v=3"
            alt="HIACDI Tech Hub"
            className="h-16 w-auto object-contain"
          />
          <p className="font-heading mt-3 text-lg font-bold text-navy">
            HIACDI <span className="text-gold">TECH</span> HUB
          </p>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-gold">
            Admin Access
          </p>
        </div>
        <form onSubmit={onSubmit} autoComplete="off" className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-navy">Username</span>
            <input
              className={inputClass}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-navy">Password</span>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-mid disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {error ? (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
          ) : null}
        </form>
        <p className="mt-6 text-center text-xs text-muted">
          Restricted access. HIACDI Tech Hub staff only.
        </p>
      </div>
    </section>
  );
}
