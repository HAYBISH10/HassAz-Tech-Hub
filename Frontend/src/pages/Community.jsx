import PageHero from "../components/layout/PageHero";
import ApplyCta from "../components/ui/ApplyCta";

const items = [
  {
    title: "Bootcamps and labs",
    text: "Join the same project culture you see in class: build, review, and ship work with other learners.",
  },
  {
    title: "Talks and workshops",
    text: "Short sessions on software, data, security, AI, and careers — open to learners and the wider HassAz circle.",
  },
  {
    title: "Career studio",
    text: "Portfolio reviews, interview practice, and guidance on what to do after a program.",
  },
];

export default function Community() {
  return (
    <div>
      <PageHero
        eyebrow="HassAz Community"
        title="A hub for people who learn, build, and stay in the craft"
        text="Stay close to bootcamps, workshops, talks, and career events. HassAz is a place to practise with other digital innovators — not only a classroom you leave at the end of a module."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]"
            >
              <h2 className="font-heading text-xl font-bold text-navy">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
        <ApplyCta className="mt-10 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark">
          Apply to train with us
        </ApplyCta>
      </section>
    </div>
  );
}
