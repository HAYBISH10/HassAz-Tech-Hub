import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Accordion from "../components/ui/Accordion";
import ApplyCta from "../components/ui/ApplyCta";
import { getProgram } from "../data/catalog";
import { useCatalog } from "../hooks/useContent";
import { fetchIntakes } from "../services/api";

function Field({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dotted border-navy/25 py-3 text-sm">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right font-semibold text-navy">{children}</dd>
    </div>
  );
}

function IntakeCard({ offer, applyBase }) {
  return (
    <article className="flex flex-col rounded-[22px] border border-gold bg-white p-6 shadow-sm">
      <h2 className="font-heading text-2xl font-bold text-gold">{offer.label}</h2>
      <dl className="mt-4 flex-1">
        <Field label="Start Date:">{offer.startDate || "Upcoming intake"}</Field>
        <Field label="Course Duration:">{offer.duration || "—"}</Field>
        <Field label="Mode of Learning:">{offer.schedule || "—"}</Field>
        <Field label="Tuition Fee:">{offer.fee || "—"}</Field>
        <Field label="Monthly Installment:">{offer.monthlyFee ? `${offer.monthlyFee} per month` : "Ksh 3,500 per month"}</Field>
        <Field label="Brochure:">
          {offer.brochureUrl ? (
            <a href={offer.brochureUrl} target="_blank" rel="noreferrer" className="font-semibold text-gold hover:underline">
              Download Here
            </a>
          ) : (
            "—"
          )}
        </Field>
      </dl>
      {offer.installmentsUrl ? (
        <a
          href={offer.installmentsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 text-sm font-semibold text-gold hover:underline"
        >
          Download fees installment plans Here
        </a>
      ) : null}
      <ApplyCta
        to={`${applyBase}&mode=${encodeURIComponent(offer.modeId || "")}`}
        className="mt-6 inline-flex w-full justify-center rounded-full bg-gold px-6 py-3 text-center text-sm font-semibold text-white hover:bg-gold-dark"
      >
        Apply Now
      </ApplyCta>
    </article>
  );
}

export default function CourseProgram() {
  const { categorySlug, programSlug } = useParams();
  const catalog = useCatalog();
  const match = getProgram(categorySlug, programSlug, catalog);
  const [intake, setIntake] = useState({ year: new Date().getFullYear(), heading: "Intakes in progress", offers: [] });

  useEffect(() => {
    fetchIntakes()
      .then(setIntake)
      .catch(() => {});
  }, []);

  const offers = useMemo(() => {
    if (!match) return [];
    const fromAdmin = (intake.offers || []).filter(
      (item) =>
        item.programSlug === match.program.slug &&
        (!item.categorySlug || item.categorySlug === match.category.slug)
    );
    if (fromAdmin.length) return fromAdmin;
    return (match.program.modes || []).map((item) => ({
      id: item.id,
      modeId: item.id,
      label: item.label,
      startDate: item.startDate,
      duration: item.duration,
      schedule: item.schedule,
      fee: item.fee,
      monthlyFee: item.monthlyFee || "Ksh 3,500",
    }));
  }, [intake.offers, match]);

  if (!match) {
    return (
      <section className="px-5 py-20 text-center">
        <h1 className="font-heading text-3xl text-navy">Course not found</h1>
        <Link to="/courses" className="mt-4 inline-block text-gold">
          Back to courses
        </Link>
      </section>
    );
  }

  const { category, program } = match;
  const applyBase = `/apply?category=${category.slug}&program=${program.slug}`;
  const columns = offers.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-b from-[#fbeee4] to-[#f7f3e8] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          {program.image ? (
            <img src={program.image} alt={program.title} className="course-hero-image mx-auto mb-8 rounded-2xl" />
          ) : null}
          <p className="text-sm font-semibold text-gold">
            <Link to={`/courses/${category.slug}`}>{category.title}</Link>
          </p>
          <h1 className="font-heading mt-3 text-3xl font-bold text-navy sm:text-5xl">{program.title}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-navy/80 sm:text-base sm:leading-8">{program.intro}</p>
          {program.careers?.length ? (
            <p className="mt-4 text-sm text-muted">Career paths include {program.careers.join(", ")}.</p>
          ) : null}
          <p className="mt-8 font-heading text-2xl font-bold text-gold sm:text-3xl">
            {intake.year} {intake.heading || "Intakes in progress"}
          </p>
        </div>

        <div className={`mx-auto mt-10 grid max-w-6xl gap-5 ${columns}`}>
          {offers.map((offer) => (
            <IntakeCard key={offer.id || offer.modeId} offer={offer} applyBase={applyBase} />
          ))}
        </div>
      </section>

      <section className="bg-navy px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading mb-6 text-3xl font-bold text-white">Course details</h2>
          <Accordion items={program.details || []} />
        </div>
      </section>

      <section className="px-4 py-12 text-center sm:px-6 sm:py-16">
        <h2 className="font-heading mx-auto max-w-3xl text-2xl font-bold text-navy sm:text-4xl">{program.headline}</h2>
        <ApplyCta
          to={`${applyBase}&mode=${encodeURIComponent(offers[0]?.modeId || program.modes[0]?.id || "")}`}
          className="mt-8 inline-flex rounded-full bg-gold px-8 py-3 font-semibold text-white hover:bg-gold-dark"
        >
          Get started — Apply now
        </ApplyCta>
      </section>

      <section className="bg-soft px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading mb-6 text-center text-3xl font-bold text-navy">Curriculum overview</h2>
          <Accordion items={program.curriculum || []} />
        </div>
      </section>
    </div>
  );
}
