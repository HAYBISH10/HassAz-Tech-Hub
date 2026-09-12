export default function ConfirmDeleteDialog({
  open,
  title = "Confirm delete",
  message = "Are you sure you want to delete this? This cannot be undone.",
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="confirm-delete-title" className="font-heading text-xl font-bold text-navy">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-full border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Confirm delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
