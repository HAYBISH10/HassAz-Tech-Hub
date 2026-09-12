import { Link, useParams } from "react-router-dom";
import { getCategory } from "../data/catalog";
import { useCatalog } from "../hooks/useContent";

export default function CourseCategory() {
  const { categorySlug } = useParams();
  const catalog = useCatalog();
  const category = getCategory(categorySlug, catalog);

  if (!category) {
    return (
      <section className="px-5 py-20 text-center">
        <h1 className="font-heading text-3xl text-navy">Category not found</h1>
        <Link to="/courses" className="mt-4 inline-block text-gold">
          Back to courses
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-[#f7f3e8] to-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-sm font-semibold text-gold">HassAz Tech Hub</p>
        <h1 className="font-heading mt-2 text-3xl font-bold text-navy sm:text-5xl">{category.title}</h1>
        {category.image ? (
          <img
            src={category.image}
            alt={category.title}
            className="course-hero-image mt-6 rounded-2xl"
          />
        ) : null}
        <p className="mt-5 max-w-3xl text-sm leading-7 text-navy/80 sm:text-base sm:leading-8">
          {category.summary}
        </p>
        <p className="mt-8 font-heading text-xl font-bold text-navy">Course offerings</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {category.programs.map((program) => (
            <article key={program.slug} className="overflow-hidden rounded-2xl border border-gold/50 bg-white">
              {program.image ? (
                <img src={program.image} alt={program.title} className="course-card-image" />
              ) : null}
              <div className="p-5 sm:p-6">
                <h2 className="font-heading text-xl font-bold text-gold">{program.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{program.summary}</p>
                <p className="mt-4 text-xs font-semibold tracking-wide text-navy uppercase">
                  {program.modes.map((item) => item.label).join(" · ")}
                </p>
                <Link
                  to={`/courses/${category.slug}/${program.slug}`}
                  className="mt-5 inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold-dark"
                >
                  View this course
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
