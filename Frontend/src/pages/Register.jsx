import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell, { authInputClass } from "../components/auth/AuthShell";
import GoogleButton from "../components/auth/GoogleButton";
import PageLoader from "../components/ui/PageLoader";
import { useUserAuth } from "../context/UserAuthContext";

export default function Register() {
  const { register, isLoggedIn } = useUserAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/account";
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoggedIn) {
    return <Navigate to={next} replace />;
  }

  function set(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setTitle("");
      setError("Password and confirm password do not match.");
      return;
    }
    setBusy(true);
    setError("");
    setTitle("");
    try {
      await register(form);
      navigate(next, { replace: true });
    } catch (err) {
      setTitle(err.title || "");
      setError(err.message || "Could not create this account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell eyebrow="Create account" title="Sign up">
      {busy ? <PageLoader overlay label="Creating your account..." /> : null}
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Full name" value={form.fullName} onChange={(v) => set("fullName", v)} autoComplete="name" />
        <Field label="Email address" type="email" value={form.email} onChange={(v) => set("email", v)} autoComplete="email" />
        <Field label="Phone number" value={form.phone} onChange={(v) => set("phone", v)} autoComplete="tel" />
        <Field label="Password" type="password" value={form.password} onChange={(v) => set("password", v)} autoComplete="new-password" />
        <Field
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={(v) => set("confirmPassword", v)}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted">Password must be at least 8 characters and match the confirmation.</p>
        <button type="submit" disabled={busy} className="w-full rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <div className="my-4 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-navy/10" />
        or
        <span className="h-px flex-1 bg-navy/10" />
      </div>
      <GoogleButton next={next} onError={setError} />
      {error ? (
        <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {title ? <p className="font-bold">{title}</p> : null}
          <p className={title ? "mt-1 font-semibold" : "font-semibold"}>{error}</p>
        </div>
      ) : null}
      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-gold">
          Login
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-navy">{label}</span>
      <input
        type={type}
        className={authInputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={label !== "Phone number"}
      />
    </label>
  );
}
