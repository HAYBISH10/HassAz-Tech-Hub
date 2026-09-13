import { useOutletContext } from "react-router-dom";
import CorporateCtas from "../components/corporate/CorporateCtas";
import PageHero from "../components/layout/PageHero";
import { corporate } from "../data/corporate";

export default function CorporateHire() {
  const { onBook } = useOutletContext() || {};
  const hire = corporate.hire;

  return (
    <div>
      <PageHero eyebrow="Hire our graduates" title={hire.title} text={hire.intro}>
        <CorporateCtas onBook={onBook} tone="onDark" />
      </PageHero>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">Pathways you can hire from</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Ask for the pathway that matches the seat. We will not send you a general list and hope something fits.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {hire.points.map((item) => (
            <article key={item.title} className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]">
              <h3 className="font-heading text-xl font-bold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
        <h2 className="font-heading mt-14 text-2xl font-bold text-navy sm:text-3xl">How hiring works</h2>
        <ol className="mt-6 space-y-4">
          {hire.steps.map((text, index) => (
            <li key={text} className="flex gap-4 rounded-2xl bg-[#f7f4ec] p-5">
              <span className="font-heading text-lg font-bold text-gold">{String(index + 1).padStart(2, "0")}</span>
              <p className="text-sm leading-7 text-navy/80">{text}</p>
            </li>
          ))}
        </ol>
        <CorporateCtas onBook={onBook} />
      </section>
    </div>
  );
}
