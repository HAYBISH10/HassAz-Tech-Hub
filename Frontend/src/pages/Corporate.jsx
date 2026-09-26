import { Link, useOutletContext } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import { site } from "../data/site";

const offers = [
  {
    title: "Staff training",
    text: "Custom programs in software engineering, data, cybersecurity, and AI for teams that need skill they can use this quarter, not a generic seminar. Cohorts can run full-time, part-time, remote, or in person.",
  },
  {
    title: "Capacity building",
    text: "We work with universities, NGOs, and public institutions to design labs, mentor models, and pathways that last after the workshop ends. The aim is a team that can keep building without us in the room.",
  },
  {
    title: "Talent pipelines",
    text: "Hire from HIACDI graduates who have been reviewed on real projects, or run a sponsored cohort for your organisation. You see the work, not only a CV.",
  },
  {
    title: "Digital solutions",
    text: "Partner with the hub on applied builds where learners and practitioners work on a defined problem with a professional standard: internal tools, public-facing products, or training platforms.",
  },
];

const pillars = [
  {
    title: "Talent",
    accent: "text-gold",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    text: "HIACDI trains people who can write software, analyse data, and ship work under review. Hire graduates, sponsor a cohort, or bring a team in for a focused upskilling block.",
  },
  {
    title: "Quality",
    accent: "text-navy",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    text: "Training is project-based. Mentors review code, datasets, and presentations the way a workplace would. Your staff leave with artefacts they can put on a live system, not a certificate alone.",
  },
  {
    title: "Expertise",
    accent: "text-gold-dark",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    text: "Use the hub to design curricula, run labs, or stand up an applied build. We bring instructors, a delivery standard, and a clear scope so the engagement has an owner on both sides.",
  },
];

const stats = [
  { value: "6", label: "Learning paths for teams: software, data, cybersecurity, AI, DPO, and high-school tech" },
  { value: "3", label: "Yearly learner intakes (January, June, and December) so hiring and training can be planned" },
  { value: "Hands-on", label: "Project reviews, labs, and portfolio work instead of slide-only workshops" },
  { value: "Kenya", label: "Delivery for organisations, campuses, and public institutions across East Africa" },
];

const steps = [
  {
    n: "01",
    title: "Scope the need",
    text: "Tell us whether you need staff trained, a graduate pipeline, a campus lab, or a build. We map that to a program, duration, and mode of learning.",
  },
  {
    n: "02",
    title: "Design the engagement",
    text: "You get a written outline: outcomes, schedule, mentors, and how success will be reviewed. Nothing starts on a handshake alone.",
  },
  {
    n: "03",
    title: "Train, hire, or build",
    text: "Cohorts run with live instruction. Sponsored learners are assessed on real work. Applied builds have milestones you can inspect.",
  },
  {
    n: "04",
    title: "Leave a capability behind",
    text: "The point is not a one-off workshop. Teams should be able to keep practising, hiring, or maintaining the work after the engagement ends.",
  },
];

const audiences = [
  {
    title: "Companies",
    text: "Upskill engineers and analysts, reskill career-switchers already on payroll, or recruit from a HIACDI cohort that has already been through project review.",
  },
  {
    title: "Universities and colleges",
    text: "Add industry labs, short courses, and mentor support around existing degrees so students finish with work they can show, not only transcripts.",
  },
  {
    title: "NGOs and public institutions",
    text: "Build digital capacity for programs that need data, software, cybersecurity, or AI literacy, with training that matches the work your teams actually do.",
  },
];

const programs = [
  {
    area: "Software Engineering",
    items: "Full stack bootcamps, DevOps, and hardware/software maintenance for product and IT teams.",
  },
  {
    area: "Data Courses",
    items: "Data science, analytics, and business intelligence for teams that need to report, model, and decide from evidence.",
  },
  {
    area: "Cybersecurity",
    items: "Foundations through bootcamp-level practice for staff who secure systems, networks, and user access.",
  },
  {
    area: "Applied AI",
    items: "Practical AI for learning, generative tools, agents, and engineering tracks for teams adopting AI at work.",
  },
];

export default function Corporate() {
  const { onBook } = useOutletContext() || {};

  return (
    <div>
      <PageHero
        eyebrow="Corporate & partners"
        title="Train your people. Build a pipeline. Work with HIACDI."
        text="HIACDI Tech Hub is the technology partner for organisations that need skilled people, not a brochure. We train corporate teams, help institutions stand up lasting labs, and connect employers to graduates who have already been reviewed on real projects."
      />

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold tracking-wide text-gold">Your tech talent partner</p>
          <h2 className="font-heading mt-2 max-w-3xl text-3xl font-bold text-navy sm:text-4xl">
            Close the skills gap with training that shows up in the work.
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
            HIACDI bridges classroom practice and workplace delivery. Organisations come to us to upskill staff,
            reskill teams moving into software or data, hire from a known training standard, or run a sponsored
            cohort against a live problem. Learners build. Mentors review. You see the output.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
            We work in Kenya and with partners who need East Africa-ready talent: product companies, universities,
            NGOs, and public institutions. Engagements can be remote, hybrid, or in person. Duration follows the
            job: a focused staff workshop, a multi-week bootcamp, or a longer pipeline.
          </p>
        </div>
      </section>

      <section className="bg-navy px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-center text-2xl font-bold sm:text-3xl">#WeAreHIACDI</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-7 text-white/80">
            We train the next generation of builders through project-based learning, and we work with organisations
            that want the same standard for their people.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <article key={item.label} className="rounded-2xl bg-white p-6 text-navy">
                <p className="font-heading text-3xl font-bold text-gold">{item.value}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{item.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-soft px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {pillars.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
              <img src={item.image} alt="" className="h-48 w-full object-cover" />
              <div className="p-6">
                <h3 className={`font-heading text-xl font-bold ${item.accent}`}>{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-3xl font-bold text-navy">What organisations ask us to do</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            Four ways to work with the hub. Mix them if you need training and hiring in the same year.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {offers.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]"
              >
                <h3 className="font-heading text-xl font-bold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-dark px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-3xl font-bold">How a partnership runs</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <article key={item.n}>
                <p className="font-heading text-sm font-bold text-gold">{item.n}</p>
                <h3 className="mt-2 font-heading text-lg font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/75">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-3xl font-bold text-navy">Who we work with</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {audiences.map((item) => (
              <article key={item.title} className="rounded-2xl border border-navy/10 p-6">
                <h3 className="font-heading text-lg font-bold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
              </article>
            ))}
          </div>
          <h3 className="font-heading mt-12 text-2xl font-bold text-navy">Programs organisations use most</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {programs.map((item) => (
              <article key={item.area} className="rounded-2xl bg-soft p-6">
                <h4 className="font-heading font-bold text-navy">{item.area}</h4>
                <p className="mt-2 text-sm leading-7 text-muted">{item.items}</p>
                <Link to="/courses" className="mt-3 inline-block text-sm font-semibold text-gold">
                  View courses
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">Schedule a consultation</h2>
          <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
            Tell us what you need trained, hired, or built. We will reply with a clear next step: a call, a
            written outline, or a cohort plan. There is no obligation to start until the scope is agreed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${site.email}?subject=HIACDI Tech Hub partnership`}
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy hover:bg-gold-dark hover:text-white"
            >
              Write to {site.email}
            </a>
            {onBook ? (
              <button
                type="button"
                onClick={onBook}
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-gold hover:text-gold"
              >
                Book for Calls
              </button>
            ) : (
              <Link
                to="/contact"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
              >
                Contact Us
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
