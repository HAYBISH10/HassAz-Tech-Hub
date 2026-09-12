export default function PageLoader({ label = "Please wait...", overlay = false, transparent = false }) {
  const baseClass = overlay ? "page-loader page-loader--overlay" : "page-loader page-loader--full";
  const toneClass = transparent ? "page-loader--transparent" : "";

  return (
    <div className={`${baseClass} ${toneClass}`.trim()} role="status" aria-live="polite">
      <span className="page-loader__spinner" aria-hidden="true" />
      <p className="page-loader__label">{label}</p>
    </div>
  );
}
