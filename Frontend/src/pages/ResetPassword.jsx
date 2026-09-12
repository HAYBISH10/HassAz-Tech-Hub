import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthShell, { authInputClass } from "../components/auth/AuthShell";
import PageLoader from "../components/ui/PageLoader";
import { resetPassword } from "../services/userAuth";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await resetPassword({ token, password, confirmPassword });
      setDone(true);
    } catch (err) {
      setError(err.message || "Could not reset this password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell eyebrow="Account recovery" title="Create a new password">
      {busy ? <PageLoader overlay label="Updating password..." /> : null}
      {!token ? (
        <p className="text-sm font-semibold text-red-700">This reset link is missing or invalid.</p>
      ) : done ? (
        <p className="text-sm leading-6 text-navy">
          Your password has been updated. You can now{" "}
          <Link to="/login" className="font-semibold text-gold">
            log in
          </Link>{" "}
          with the new password.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-navy">New password</span>
            <input type="password" className={authInputClass} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-navy">Confirm new password</span>
            <input
              type="password"
              className={authInputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={busy} className="w-full rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
            Update password
          </button>
        </form>
      )}
      {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
    </AuthShell>
  );
}
