import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell, { authInputClass } from "../components/auth/AuthShell";
import PageLoader from "../components/ui/PageLoader";
import { requestPasswordReset } from "../services/userAuth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setDone(true);
    } catch (err) {
      setError(err.message || "Could not send a reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell eyebrow="Account recovery" title="Forgot password">
      {busy ? <PageLoader overlay label="Sending reset email..." /> : null}
      {done ? (
        <p className="text-sm leading-6 text-navy">
          If an account exists for that email, a password reset link has been sent. Check your inbox and follow the
          instructions. The link expires in one hour.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <p className="text-sm text-muted">Enter the email on your HassAz Tech Hub account. We will send a reset link if it exists.</p>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-navy">Email address</span>
            <input type="email" className={authInputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" disabled={busy} className="w-full rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
            Send reset link
          </button>
        </form>
      )}
      {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <p className="mt-5 text-center text-sm">
        <Link to="/login" className="font-semibold text-gold">
          Back to Login
        </Link>
      </p>
    </AuthShell>
  );
}
