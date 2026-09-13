import { useOutletContext } from "react-router-dom";
import CorporateCtas from "../components/corporate/CorporateCtas";
import PageHero from "../components/layout/PageHero";
import { corporate } from "../data/corporate";

export default function CorporateTraining() {
  const { onBook } = useOutletContext() || {};
  const training = corporate.training;

  return (
    <div>
      <PageHero eyebrow="Corporate training" title={training.title} text={training.intro}>
        <CorporateCtas onBook={onBook} tone="onDark" />
      </PageHero>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">Tracks we design for teams</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {training.tracks.map((item) => (
            <article key={item.title} className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]">
              <h3 className="font-heading text-xl font-bold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
        <h2 className="font-heading mt-14 text-2xl font-bold text-navy sm:text-3xl">How your staff can attend</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {training.modes.map((item) => (
            <li key={item} className="rounded-2xl bg-[#f7f4ec] px-5 py-4 text-sm leading-7 text-navy/80">
              {item}
            </li>
          ))}
        </ul>
        <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {corporate.process.map((item) => (
            <li key={item.step} className="rounded-2xl border border-navy/10 p-6">
              <p className="font-heading text-sm font-bold text-gold">{item.step}</p>
              <h3 className="font-heading mt-2 text-lg font-bold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </li>
          ))}
        </ol>
        <CorporateCtas onBook={onBook} />
      </section>
    </div>
  );
}
