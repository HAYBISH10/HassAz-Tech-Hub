import { Link } from "react-router-dom";

export default function VerificationResultCard({ verified, certificate, message, expired, emailedTo, onReset }) {
  const year = new Date().getFullYear();

  return (
    <article className="mt-8 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
      <div className={`px-6 py-8 text-center ${verified ? "bg-[#f4efe4]" : "bg-red-50"}`}>
        <img
          src="/brand/logo-mark.png?v=3"
          alt="HIACDI Tech Hub logo"
          className="mx-auto h-16 w-auto rounded-full bg-white object-contain p-1"
        />
        <p className="font-heading mt-3 text-lg font-bold text-navy">
          HIACDI <span className="text-gold">TECH</span> HUB
        </p>
        <p className="mt-1 text-xs text-muted">
          Humanity, Inclusion &amp; Advancement Community Development Initiative
        </p>
        <p
          className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
            verified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {verified ? "Certificate Verified Successfully" : "Certificate Verification Failed."}
        </p>
      </div>

      {verified && certificate ? (
        <dl className="space-y-4 px-6 py-8 text-sm sm:px-8">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Full name</dt>
            <dd className="mt-1 font-semibold text-navy">{certificate.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Program</dt>
            <dd className="mt-1 text-navy">{certificate.program}</dd>
          </div>
          {certificate.details ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Details</dt>
              <dd className="mt-1 leading-6 text-navy/80">{certificate.details}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Certificate ID</dt>
            <dd className="mt-1 break-all font-mono text-xs font-semibold text-gold">
              {certificate.certificateId}
            </dd>
          </div>
        </dl>
      ) : (
        <div className="space-y-4 px-6 py-8 text-sm leading-7 text-navy sm:px-8">
          <p className="font-semibold">{message || "Certificate Verification Failed."}</p>
          {expired ? (
            <p className="text-xs text-muted">
              This verification link has expired. Please submit the verification form again.
            </p>
          ) : null}
          <p className="text-xs text-muted">
            The details entered do not match an officially awarded HIACDI Tech Hub certificate. Make sure
            the full name and email are typed exactly as printed on the certificate. If you believe this
            is a mistake, contact us at hiacditechhub@gmail.com.
          </p>
        </div>
      )}

      {emailedTo ? (
        <p className="border-t border-navy/5 px-6 py-4 text-center text-xs leading-5 text-muted">
          A confirmation email is on its way to{" "}
          <span className="font-semibold text-navy">{emailedTo}</span>. If you do not find it in your
          Inbox, please check your Spam or Junk folder.
        </p>
      ) : null}

      <div className="border-t border-navy/5 px-6 py-5 text-center">
        {onReset ? (
          <button type="button" onClick={onReset} className="text-sm font-semibold text-navy underline">
            Verify another certificate
          </button>
        ) : (
          <Link to="/verify" className="text-sm font-semibold text-navy underline">
            Verify another certificate
          </Link>
        )}
      </div>
      <p className="border-t border-navy/5 px-6 py-4 text-center text-xs text-muted">
        © Copyright {year} by HIACDI Tech Hub. All rights reserved.
      </p>
    </article>
  );
}
