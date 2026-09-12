import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";
import { verifyCertificate } from "../services/api";

const inputClass =
  "w-full rounded-md border border-navy/15 px-4 py-3 text-ink outline-none focus:border-gold";

export default function Verify() {
  const [params] = useSearchParams();
  const certificateId = params.get("cert") || "";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(
    () => fullName.trim().length > 1 && email.includes("@") && !busy,
    [fullName, email, busy]
  );

  async function onSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    setError("");
    setResult(null);
    try {
      // Note: the response only ever contains a generic outcome message — never the matched
      // graduate's name, program, or certificate details — so the student cannot see any
      // verification information beyond whether it was confirmed or not.
      const data = await verifyCertificate({
        fullName: fullName.trim(),
        email: email.trim(),
        certificateId,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Could not process this verification. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-semibold text-gold">Certificate scan</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Verify a certificate</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Enter the full name and email exactly as printed on the certificate. We will confirm
        whether it is an officially verified HassAz Tech Hub record.
      </p>
      {certificateId ? (
        <p className="mt-3 text-xs text-navy/70">
          Certificate ID: <span className="font-semibold">{certificateId}</span>
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="relative mt-8 space-y-4 rounded-2xl border border-navy/10 bg-white p-5 sm:p-7">
        {busy ? <PageLoader overlay label="Checking..." /> : null}
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy">Full name</span>
          <input
            className={inputClass}
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
              setError("");
              setResult(null);
            }}
            autoComplete="name"
            placeholder="Exactly as printed on the certificate"
            required
          />
          <span className="mt-1 block text-xs text-muted">
            Type your name exactly as it is printed on your certificate.
          </span>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy">Email address</span>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setResult(null);
            }}
            autoComplete="email"
            required
          />
        </label>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Checking…" : "Verify certificate"}
        </button>
        {error ? (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
        ) : null}
      </form>

      {result ? <VerificationResult result={result} /> : null}
    </section>
  );
}

function VerificationResult({ result }) {
  const year = new Date().getFullYear();
  const verified = Boolean(result.ok);

  return (
    <article className="mt-8 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
      <div className={`px-6 py-8 text-center ${verified ? "bg-[#f4efe4]" : "bg-red-50"}`}>
        <img src="/brand/logo-mark.png?v=2" alt="HassAz Tech Hub" className="mx-auto h-16 w-auto object-contain" />
        <p className="font-heading mt-3 text-lg font-bold text-navy">
          HassAz <span className="text-gold">TECH</span> HUB
        </p>
        <p
          className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
            verified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {verified ? "Verified" : "Not verified"}
        </p>
      </div>
      <div className="space-y-4 px-6 py-8 text-sm leading-7 text-navy">
        {result.message
          .split("\n")
          .filter((line) => line.trim().length)
          .map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        {result.emailed ? (
          <p className="text-xs text-muted">A copy of this result was also sent by email.</p>
        ) : null}
      </div>
      <p className="border-t border-navy/5 px-6 py-4 text-center text-xs text-muted">
        © Copyright {year} by HassAz Tech Hub. All rights reserved.
      </p>
    </article>
  );
}
