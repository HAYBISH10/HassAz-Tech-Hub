export default function AuthShell({ eyebrow, title, children }) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-[#f7f3e8] to-white px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <img src="/brand/logo-mark.png?v=3" alt="HIACDI Tech Hub" className="h-14 w-auto object-contain" />
          <p className="font-heading mt-3 text-lg font-bold text-navy">
            HIACDI <span className="text-gold">TECH</span> HUB
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-gold">{eyebrow}</p>
          <h1 className="font-heading mt-2 text-2xl font-bold text-navy">{title}</h1>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

export const authInputClass =
  "w-full rounded-md border border-navy/15 px-4 py-3 text-ink outline-none focus:border-gold";
