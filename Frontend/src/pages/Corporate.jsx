import { Link, useOutletContext } from "react-router-dom";
import CorporateCtas from "../components/corporate/CorporateCtas";
import PageHero from "../components/layout/PageHero";
import { corporate } from "../data/corporate";

export default function Corporate() {
  const { onBook } = useOutletContext() || {};

  return (
    <div>
      <PageHero eyebrow={corporate.hero.eyebrow} title={corporate.hero.title} text={corporate.hero.text}>
        <CorporateCtas onBook={onBook} tone="onDark" />
      </PageHero>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-gold">HassAz for organisations</p>
          <h2 className="font-heading mt-2 text-3xl font-bold text-navy sm:text-4xl">Your technology talent partner</h2>
          <p className="mt-5 text-sm leading-7 text-muted sm:text-base sm:leading-8">{corporate.partnerLead}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/corporate/hire"
              className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid"
            >
              Hire our graduates
            </Link>
            <Link
              to="/corporate/training"
              className="rounded-full border border-navy/20 px-6 py-2.5 text-sm font-semibold text-navy hover:border-gold hover:text-gold-dark"
            >
              Corporate training
            </Link>
            <Link
              to="/corporate/partner"
              className="rounded-full border border-navy/20 px-6 py-2.5 text-sm font-semibold text-navy hover:border-gold hover:text-gold-dark"
            >
              Partner with us
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-navy px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-semibold text-gold">Why organisations work with HassAz</p>
          <h2 className="font-heading mt-2 text-3xl font-bold sm:text-4xl">A standard you can inspect</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/75">
            We do not quote vanity numbers we cannot stand behind. These are the facts of how the hub is built —
            programme areas, intake calendar, and the way we teach.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {corporate.stats.map((item) => (
              <article key={item.label} className="rounded-2xl bg-white px-6 py-8 text-left text-navy">
                <p className="font-heading text-4xl font-bold text-gold">{item.value}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{item.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f4ec] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-gold">How we partner</p>
          <h2 className="font-heading mt-2 text-3xl font-bold text-navy sm:text-4xl">Talent, quality, and expertise</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
            Three ways to work with the hub. Each one is a real programme — not a brochure line.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {corporate.pillars.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(10,46,109,0.08)]">
                <img src={item.image} alt="" className="h-48 w-full object-cover" />
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-navy">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
                  <Link to={item.to} className="mt-5 inline-flex rounded-full border border-navy/15 px-5 py-2 text-sm font-semibold text-navy hover:border-gold hover:text-gold-dark">
                    {item.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-gold">What we deliver</p>
          <h2 className="font-heading mt-2 text-3xl font-bold text-navy sm:text-4xl">Training, pipelines, and applied work</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {corporate.offers.map((item) => (
              <article key={item.title} className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]">
                <h3 className="font-heading text-xl font-bold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f4ec] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-gold">Who we serve</p>
          <h2 className="font-heading mt-2 text-3xl font-bold text-navy sm:text-4xl">Built for serious institutions</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {corporate.who.map((item) => (
              <article key={item.title} className="rounded-2xl bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]">
                <h3 className="font-heading text-lg font-bold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-gold">How an engagement starts</p>
          <h2 className="font-heading mt-2 text-3xl font-bold text-navy sm:text-4xl">From the first call to handover</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {corporate.process.map((item) => (
              <li key={item.step} className="rounded-2xl border border-navy/10 p-6">
                <p className="font-heading text-sm font-bold text-gold">{item.step}</p>
                <h3 className="font-heading mt-2 text-lg font-bold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f7f4ec] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-gold">Insights</p>
          <h2 className="font-heading mt-2 text-3xl font-bold text-navy sm:text-4xl">What organisations should know</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {corporate.highlights.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(10,46,109,0.06)]">
                <img src={item.image} alt="" className="h-44 w-full object-cover" />
                <div className="p-6">
                  <h3 className="font-heading text-lg font-bold text-navy">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-dark px-4 py-16 text-center text-white sm:px-6">
        <p className="text-sm font-semibold text-gold">Ready to talk?</p>
        <h2 className="font-heading mt-2 text-3xl font-bold sm:text-4xl">Schedule a free consultation</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/75">
          Tell us whether you need to hire, train a team, or design a longer partnership. We will reply with a
          clear next step — not a generic brochure.
        </p>
        <CorporateCtas onBook={onBook} align="center" tone="onDark" />
      </section>
    </div>
  );
}
