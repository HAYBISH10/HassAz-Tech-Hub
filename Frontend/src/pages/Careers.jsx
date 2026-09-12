import { site } from "../data/site";
import { careers } from "../data/about";
import PageHero from "../components/layout/PageHero";

export default function Careers() {
  return (
    <div>
      <PageHero eyebrow={careers.eyebrow} title={careers.title} text={careers.intro} />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">How we work</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {careers.values.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]"
            >
              <h3 className="font-heading text-lg font-bold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f7f4ec] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-gold">Join the faculty</p>
          <h2 className="font-heading mt-2 text-2xl font-bold text-navy sm:text-3xl">
            Roles we welcome interest for
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            These are the kinds of people HassAz needs as we grow. Send a CV and a short note about
            the craft you teach. We will reply when a seat is open.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {careers.roles.map((role) => (
              <article key={role.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{role.type}</p>
                <h3 className="font-heading mt-2 text-lg font-bold text-navy">{role.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{role.text}</p>
              </article>
            ))}
          </div>
          <a
            href={`mailto:${site.email}?subject=HassAz Tech Hub career interest`}
            className="mt-8 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-mid"
          >
            Write to {site.email}
          </a>
        </div>
      </section>
    </div>
  );
}
