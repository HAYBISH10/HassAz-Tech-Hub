export default function ApplicationSuccessDialog({ open, onOk }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-success-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-xl sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
          ✓
        </div>
        <h2 id="application-success-title" className="font-heading mt-5 text-2xl font-bold text-navy">
          Application Submitted Successfully!
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">Thank you for applying to HassAz Tech Hub.</p>
        <p className="mt-3 text-sm leading-7 text-muted">
          Your application has been received successfully. Our team will review all applications, and qualified
          students will be contacted via email with the next steps.
        </p>
        <p className="mt-3 text-sm leading-7 text-muted">
          📩 Please keep checking your email, including your spam or junk folder.
        </p>
        <p className="mt-3 text-sm leading-7 text-muted">
          Thank you for choosing HassAz Tech Hub. We wish you the best of luck!
        </p>
        <button
          type="button"
          onClick={onOk}
          className="mt-6 rounded-full bg-navy px-8 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid"
        >
          OK
        </button>
      </div>
    </div>
  );
}
