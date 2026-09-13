import { useOutletContext } from "react-router-dom";
import CorporateCtas from "../components/corporate/CorporateCtas";
import PageHero from "../components/layout/PageHero";
import { corporate } from "../data/corporate";

export default function CorporatePartner() {
  const { onBook } = useOutletContext() || {};
  const partner = corporate.partner;

  return (
    <div>
      <PageHero eyebrow="Partner with us" title={partner.title} text={partner.intro}>
        <CorporateCtas onBook={onBook} tone="onDark" />
      </PageHero>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">Kinds of partnership</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {partner.kinds.map((item) => (
            <article key={item.title} className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]">
              <h3 className="font-heading text-xl font-bold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {corporate.who.map((item) => (
            <article key={item.title} className="rounded-2xl bg-[#f7f4ec] p-6">
              <h3 className="font-heading text-lg font-bold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
        <CorporateCtas onBook={onBook} />
      </section>
    </div>
  );
}
