import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Hero from "../components/home/Hero";
import { useCatalog } from "../hooks/useContent";
import { features, graduateEmployers, site } from "../data/site";

export default function Home() {
  const { onBook } = useOutletContext();
  return (
    <div>
      <Hero onBook={onBook} />
      <FeatureSlider />
      <CoursesPreview />
      <Partners />
      <Stats />
      <Awards />
      <CommunityBanner />
      <Testimonials />
      <Stories />
      <StayUpdated />
    </div>
  );
}

function FeatureSlider() {
  const [index, setIndex] = useState(0);
  const visible = [
    features[index % features.length],
    features[(index + 1) % features.length],
  ];

  return (
    <section className="relative bg-white px-4 pb-10 sm:px-6 sm:pb-16">
      <button
        type="button"
        className="absolute top-[40%] left-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-lg text-white sm:left-3 sm:h-10 sm:w-10"
        onClick={() => setIndex((value) => (value + features.length - 1) % features.length)}
        aria-label="Previous"
      >
        ‹
      </button>
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 md:gap-6">
        {visible.map((item, cardIndex) => (
          <article
            key={item.title}
            className={`overflow-hidden rounded-2xl sm:rounded-3xl ${cardIndex === 1 ? "hidden md:block" : ""}`}
          >
            <img src={item.image} alt="" className="h-48 w-full object-cover sm:h-64" />
            <div className={`${item.color} p-5 text-white sm:p-8`}>
              <h3 className="font-heading text-xl font-bold sm:text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/90 sm:leading-7">{item.text}</p>
            </div>
          </article>
        ))}
      </div>
      <button
        type="button"
        className="absolute top-[40%] right-2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-lg text-white sm:right-3 sm:h-10 sm:w-10"
        onClick={() => setIndex((value) => (value + 1) % features.length)}
        aria-label="Next"
      >
        ›
      </button>
    </section>
  );
}

function CoursesPreview() {
  const catalog = useCatalog();

  return (
    <section className="bg-navy-dark px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">Six course parts</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/75">
          Choose a path, then pick the program and learning mode that fits you.
        </p>
        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {catalog.map((category) => (
            <article key={category.slug} className="overflow-hidden rounded-2xl bg-white text-navy">
              {category.image ? (
                <img src={category.image} alt={category.title} className="course-card-image" />
              ) : null}
              <div className="p-5 sm:p-6">
                <h3 className="font-heading text-lg font-bold sm:text-xl">{category.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{category.summary}</p>
                <Link
                  to={`/courses/${category.slug}`}
                  className="mt-5 inline-block text-sm font-semibold text-gold"
                >
                  View programs
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
      <h2 className="font-heading px-2 text-center text-2xl font-bold text-navy sm:text-3xl md:text-4xl">
        Where Our Graduates Work
      </h2>
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 items-center gap-x-6 gap-y-10 sm:mt-14 sm:grid-cols-3 md:grid-cols-5 md:gap-x-10 md:gap-y-12">
        {graduateEmployers.map((employer) => (
          <div key={employer.name} className="flex h-14 items-center justify-center px-2 sm:h-16">
            <img
              src={employer.src}
              alt={employer.name}
              className="partner-logo max-h-10 w-auto object-contain sm:max-h-12"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { value: "7", label: "Core technology programs" },
    { value: "3", label: "Pillars: Learn. Build. Innovate." },
    { value: "Hands-on", label: "Project-based training model" },
    { value: "1", label: "Mission: digital opportunity" },
  ];

  return (
    <section className="bg-navy-dark px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="border-l-2 border-b-2 border-white/40 p-4 sm:p-5">
            <p className="font-heading text-2xl font-bold text-gold sm:text-3xl">{item.value}</p>
            <p className="mt-2 text-sm text-white/85">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Awards() {
  const items = [
    "Practical, industry-focused training",
    "Real-world learner projects",
    "Mentorship and career preparation",
    "A technology community, not only a classroom",
  ];

  return (
    <section className="bg-navy px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
        <h2 className="font-heading text-2xl font-bold sm:min-w-48 sm:text-3xl">Our Focus</h2>
        <div className="grid flex-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {items.map((item) => (
            <p key={item} className="text-sm leading-6 text-white/90">
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunityBanner() {
  return (
    <section className="bg-soft px-4 py-12 text-center sm:px-6 sm:py-20">
      <h2 className="font-heading mx-auto max-w-4xl text-2xl font-bold text-navy sm:text-3xl md:text-4xl">
        Join #HassAz Community of Innovators and Tech Leaders
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm text-navy/80 sm:mt-5 sm:text-base">
        Stay up to date with upcoming events, free learning materials, news and
        updates.
      </p>
      <Link
        to="/community"
        className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 font-semibold text-white sm:mt-8 sm:px-8"
      >
        HassAz Community
      </Link>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-20">
      <h2 className="font-heading text-center text-2xl font-bold text-navy sm:text-3xl">
        Our Testimonials
      </h2>
      <div className="mx-auto mt-8 max-w-4xl sm:mt-10">
        <article className="flex flex-col items-center gap-5 rounded-2xl bg-navy-dark p-5 text-white sm:p-8 md:flex-row md:items-center md:gap-6">
          <div className="flex-1">
            <p className="text-sm leading-7 text-white/90 sm:text-base sm:leading-8">
              HassAz Tech Hub is built so learners do not only attend class —
              they practise, build, and leave with work they can show. That is
              the standard we hold for every program.
            </p>
            <p className="mt-4 font-semibold text-gold sm:mt-5">{site.name}</p>
            <p className="text-sm text-white/70">Learn. Build. Innovate.</p>
          </div>
          <img
            src="/brand/logo-mark.png?v=2"
            alt=""
            className="h-20 w-20 rounded-full object-contain sm:h-28 sm:w-28"
          />
        </article>
      </div>
    </section>
  );
}

function Stories() {
  return (
    <section className="bg-white px-4 pb-12 sm:px-6 sm:pb-20">
      <h2 className="font-heading text-center text-2xl font-bold text-gold sm:text-3xl">
        Learner Success Stories
      </h2>
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2">
        {[
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
        ].map((image) => (
          <div key={image} className="relative overflow-hidden rounded-2xl">
            <img src={image} alt="" className="h-48 w-full object-cover sm:h-64" />
            <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-xl text-white sm:h-16 sm:w-16 sm:text-2xl">
              ▶
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function StayUpdated() {
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    interests: [],
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("Sending...");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("Thank you. We will keep you updated.");
      setForm({ firstName: "", lastName: "", email: "", role: "", interests: [] });
    } catch {
      setStatus("Saved locally for now. Start the backend to store inquiries.");
    }
  }

  function toggleInterest(value) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(value)
        ? current.interests.filter((item) => item !== value)
        : [...current.interests, value],
    }));
  }

  const images = [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  ];

  return (
    <section className="bg-white px-4 pb-28 sm:px-6 sm:pb-24">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {images.map((image) => (
            <img
              key={image}
              src={image}
              alt=""
              className="h-32 w-full rounded-2xl object-cover sm:h-52"
            />
          ))}
        </div>
        <form onSubmit={handleSubmit} className="rounded-2xl bg-navy-dark p-5 text-white sm:p-8">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">Stay Updated with HassAz</h2>
          <p className="mt-2 text-sm text-white/80">
            Sign up to receive learning resources, event invites, and important
            updates.
          </p>
          <div className="mt-6 grid gap-4">
            <input
              required
              placeholder="First Name"
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
              className="w-full rounded-md bg-white px-4 py-3 text-ink"
            />
            <input
              placeholder="Last Name"
              value={form.lastName}
              onChange={(event) => setForm({ ...form, lastName: event.target.value })}
              className="w-full rounded-md bg-white px-4 py-3 text-ink"
            />
            <input
              required
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-md bg-white px-4 py-3 text-ink"
            />
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="w-full rounded-md bg-white px-4 py-3 text-ink"
            >
              <option value="">Which of these best describes you?</option>
              <option>Student</option>
              <option>Working professional</option>
              <option>Organization / partner</option>
            </select>
            <fieldset>
              <legend className="mb-2 text-sm">What are you interested in?</legend>
              {["Software Engineering", "Data Courses", "Cyber Security", "AI", "DPO", "High School Bootcamp"].map(
                (item) => (
                  <label key={item} className="mr-4 mb-2 inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.interests.includes(item)}
                      onChange={() => toggleInterest(item)}
                    />
                    {item}
                  </label>
                )
              )}
            </fieldset>
            <button
              type="submit"
              className="w-full rounded-md bg-gold px-6 py-3 font-semibold text-navy-dark sm:ml-auto sm:w-auto"
            >
              Submit
            </button>
            {status ? <p className="text-sm text-gold">{status}</p> : null}
          </div>
        </form>
      </div>
    </section>
  );
}
