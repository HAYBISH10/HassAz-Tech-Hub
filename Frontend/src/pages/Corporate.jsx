import { Link, useOutletContext } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import { site } from "../data/site";

const offers = [
  {
    title: "Staff training",
    text: "Custom programs in software, data, cybersecurity, and AI for teams that need skill they can use this quarter — not a generic seminar.",
  },
  {
    title: "Capacity building",
    text: "We work with universities, NGOs, and public institutions to design labs, mentor models, and pathways that last after the workshop ends.",
  },
  {
    title: "Talent pipelines",
    text: "Hire from HassAz graduates who have been reviewed on real projects, or run a sponsored cohort for your organisation.",
  },
  {
    title: "Digital solutions",
    text: "Partner with the hub on applied builds where learners and practitioners work on a defined problem with a professional standard.",
  },
];

export default function Corporate() {
  const { onBook } = useOutletContext() || {};

  return (
    <div>
      <PageHero
        eyebrow="Corporate & partners"
        title="Train your people. Build a pipeline. Work with HassAz."
        text="HassAz Tech Hub works with universities, companies, NGOs, and public institutions on staff training, digital solutions, and talent."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-5 md:grid-cols-2">
          {offers.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]"
            >
              <h2 className="font-heading text-xl font-bold text-navy">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={`mailto:${site.email}?subject=HassAz Tech Hub partnership`}
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-mid"
          >
            Write to {site.email}
          </a>
          {onBook ? (
            <button
              type="button"
              onClick={onBook}
              className="rounded-full border border-navy/20 px-6 py-3 text-sm font-semibold text-navy hover:border-gold hover:text-gold"
            >
              Book for Calls
            </button>
          ) : (
            <Link
              to="/about/faqs"
              className="rounded-full border border-navy/20 px-6 py-3 text-sm font-semibold text-navy"
            >
              Read FAQs
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
