import PageHero from "../components/layout/PageHero";
import ApplyCta from "../components/ui/ApplyCta";
import { community } from "../data/community";

export default function Community() {
  return (
    <div>
      <PageHero eyebrow={community.eyebrow} title={community.title} text={community.text} />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm font-semibold text-gold">What we stand for</p>
        <h2 className="font-heading mt-2 text-2xl font-bold text-navy sm:text-4xl">Vision and Mission</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="relative overflow-hidden rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]">
            <span className="absolute top-0 left-0 h-1 w-full bg-gold" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Vision</p>
            <p className="mt-3 text-sm leading-7 text-muted">{community.vision}</p>
          </article>
          <article className="relative overflow-hidden rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]">
            <span className="absolute top-0 left-0 h-1 w-full bg-gold" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Mission</p>
            <p className="mt-3 text-sm leading-7 text-muted">{community.mission}</p>
          </article>
        </div>
      </section>

      <section className="bg-[#f7f4ec] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-gold">Community life</p>
          <h2 className="font-heading mt-2 text-2xl font-bold text-navy sm:text-4xl">
            Community, graduation, guests, and more
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {community.sections.map((item) => (
              <article
                key={item.title}
                className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(10,46,109,0.08)]"
              >
                <img src={item.image} alt={item.title} className="h-56 w-full object-cover" />
                <div className="border-t border-gold/40 p-6">
                  <h3 className="font-heading text-xl font-bold text-navy">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm font-semibold text-gold">People in the photos</p>
        <h2 className="font-heading mt-2 text-2xl font-bold text-navy sm:text-4xl">
          Leadership, guests, and the HIACDI team
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          People in yellow reflectors are guests in most photos. The Founder & CEO wears a lanyard.
          The Executive Director wears a reflector and a lanyard.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {community.people.map((person) => (
            <article
              key={`${person.name}-${person.image}`}
              className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[0_12px_40px_rgba(10,46,109,0.06)]"
            >
              <img src={person.image} alt={person.name} className="h-56 w-full object-cover object-[center_20%]" />
              <div className="border-t border-gold/40 p-5">
                <h3 className="font-heading text-lg font-bold text-navy">{person.name}</h3>
                <p className="mt-1 text-sm font-semibold text-gold">{person.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{person.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-soft px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-gold">Photo gallery</p>
          <h2 className="font-heading mt-2 text-2xl font-bold text-navy sm:text-4xl">Every image from the day</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {community.gallery.map((item) => (
              <figure key={item.image} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <img src={item.image} alt={item.caption} className="h-56 w-full object-cover" />
                <figcaption className="border-t border-gold/40 p-4 text-sm leading-6 text-muted">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
          <ApplyCta className="mt-10 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark">
            Apply to train with us
          </ApplyCta>
        </div>
      </section>
    </div>
  );
}
