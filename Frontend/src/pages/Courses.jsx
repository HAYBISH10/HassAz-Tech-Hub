import { Link } from "react-router-dom";
import { useCatalog } from "../hooks/useContent";

export default function Courses() {
  const catalog = useCatalog();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-navy sm:text-4xl">Our Courses</h1>
      <p className="mt-4 max-w-2xl text-sm text-muted sm:text-base">
        Six learning paths. Choose a part, pick a program, then apply for the mode that fits your life.
      </p>
      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {catalog.map((category) => (
          <article key={category.slug} className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white">
            {category.image ? (
              <img src={category.image} alt={category.title} className="course-card-image" />
            ) : null}
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-wide text-gold uppercase">
                {category.programs.length} course offering{category.programs.length === 1 ? "" : "s"}
              </p>
              <h2 className="font-heading mt-2 text-xl font-bold text-navy">{category.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted">{category.summary}</p>
              <Link
                to={`/courses/${category.slug}`}
                className="mt-5 inline-block font-semibold text-gold"
              >
                View programs
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
