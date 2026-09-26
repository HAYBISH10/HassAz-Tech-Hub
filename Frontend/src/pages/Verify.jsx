import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";
import VerificationResultCard from "../components/verify/VerificationResultCard";
import { verifyCertificate } from "../services/api";

const inputClass =
  "w-full rounded-md border border-navy/15 px-4 py-3 text-ink outline-none focus:border-gold";

export default function Verify() {
  const { certificateId: pathCert } = useParams();
  const [params] = useSearchParams();
  // Certificate ID comes from the QR-code link (/verify/CERTIFICATE_ID), with the old
  // query format (?cert=...) still supported so previously printed QRs keep working.
  const certificateId = pathCert || params.get("cert") || "";

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
    try {
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

  function resetForm() {
    setResult(null);
    setError("");
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-semibold text-gold">Certificate verification</p>
      <h1 className="font-heading mt-1 text-2xl font-bold text-navy sm:text-3xl">Verify a certificate</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        HIACDI — Humanity, Inclusion &amp; Advancement Community Development Initiative. Enter the full
        name and email exactly as printed on the certificate — the result is shown instantly and a
        confirmation is sent to your email.
      </p>
      {certificateId ? (
        <p className="mt-4 inline-block max-w-full break-all rounded-full bg-navy/5 px-4 py-1.5 text-xs font-semibold text-navy">
          Certificate ID: {certificateId}
        </p>
      ) : null}

      {result ? (
        <VerificationResultCard
          verified={Boolean(result.verified)}
          certificate={result.certificate}
          message={result.message}
          emailedTo={result.emailed ? email.trim() : null}
          onReset={resetForm}
        />
      ) : (
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
      )}
    </section>
  );
}
