import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";
import VerificationResultCard from "../components/verify/VerificationResultCard";
import { confirmCertificateVerification } from "../services/api";

export default function VerifyConfirm() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: "" });

  useEffect(() => {
    let active = true;
    confirmCertificateVerification(token)
      .then((data) => {
        if (active) setState({ loading: false, data, error: "" });
      })
      .catch((err) => {
        if (active) {
          setState({ loading: false, data: null, error: err.message || "Certificate Verification Failed." });
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  const { loading, data, error } = state;

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-semibold text-gold">Certificate verification</p>
      <h1 className="font-heading mt-1 text-2xl font-bold text-navy sm:text-3xl">Verification result</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        HIACDI — Humanity, Inclusion &amp; Advancement Community Development Initiative.
      </p>

      {loading ? (
        <div className="relative mt-8 min-h-40 rounded-2xl border border-navy/10 bg-white p-6">
          <PageLoader overlay label="Checking certificate..." />
        </div>
      ) : (
        <VerificationResultCard
          verified={Boolean(data?.verified)}
          certificate={data?.certificate}
          message={error || data?.message}
          expired={Boolean(data?.expired)}
        />
      )}
    </section>
  );
}
