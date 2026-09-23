import { useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import ApplyCta from "../components/ui/ApplyCta";
import { about } from "../data/about";
import { site } from "../data/site";

export default function About() {
  const { onBook } = useOutletContext() || {};

  return (
    <div>
      <PageHero eyebrow={about.eyebrow} title={about.title} text={about.intro}>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">{about.mission}</p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm font-semibold text-gold">
          {site.motto}
        </p>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm font-semibold text-gold">What the motto means here</p>
        <h2 className="font-heading mt-2 max-w-3xl text-2xl font-bold text-navy sm:text-4xl">
          Three standards, not three slogans
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Learn. Build. Innovate. is how HassAz is run. Each word has a job in the classroom and in
          the lab.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {about.pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="relative overflow-hidden rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_12px_40px_rgba(10,46,109,0.06)]"
            >
              <span className="absolute top-0 left-0 h-1 w-full bg-gold" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{pillar.title}</p>
              <h3 className="font-heading mt-3 text-xl font-bold text-navy">{pillar.lead}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f7f4ec] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-gold">Leadership and faculty</p>
          <h2 className="font-heading mt-2 text-2xl font-bold text-navy sm:text-4xl">
            The people who teach and hold the standard
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            HassAz is led by practitioners. The same people who design the programs review learner
            work and stay accountable for quality.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {about.team.map((person) => (
              <article key={`${person.title}-${person.image}`} className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(10,46,109,0.08)]">
                <div className="bg-white">
                  <img
                    src={person.image}
                    alt={`${person.name}, ${person.title}`}
                    loading="lazy"
                    decoding="async"
                    className={`mx-auto h-80 w-full sm:h-[22rem] ${
                      person.cover ? "object-cover object-[center_18%]" : "object-contain object-top"
                    }`}
                  />
                </div>
                <div className="border-t border-gold/40 p-6">
                  <h3 className="font-heading text-lg font-bold text-navy">{person.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-gold">{person.title}</p>
                  {person.role ? <p className="mt-1 text-sm text-navy/80">{person.role}</p> : null}
                  <p className="mt-3 text-sm leading-6 text-muted">{person.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-dark px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_26rem]">
          <div>
            <p className="text-sm font-semibold text-gold">Mentorship program</p>
            <h2 className="font-heading mt-2 text-2xl font-bold sm:text-4xl">{about.mentorship.title}</h2>
            <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
              {about.mentorship.text}
            </p>
            <ul className="mt-6 grid gap-3 text-sm">
              {about.mentorship.points.map((point) => (
                <li key={point} className="flex gap-3 rounded-xl bg-white/5 px-4 py-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <figure className="mentorship-stage">
            <MentorshipVideo src={about.mentorship.video} />
            <figcaption className="mentorship-caption">
              <p className="font-heading text-sm font-bold text-white sm:text-base">
                {about.mentorship.videoTitle}
              </p>
              <p className="mt-1 text-sm font-semibold text-gold">{about.mentorship.videoSubtitle}</p>
              <p className="mt-2 text-xs text-white/70">{about.mentorship.videoCredit}</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-navy px-4 py-14 text-center text-white sm:px-6 sm:py-16">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">Ready to train with HassAz?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80">
          Choose a program, or speak with the academic team about the right mode for your schedule.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ApplyCta className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white hover:bg-gold-dark">
            Apply now
          </ApplyCta>
          <Link
            to="/courses"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-gold hover:text-gold"
          >
            View courses
          </Link>
          {onBook ? (
            <button
              type="button"
              onClick={onBook}
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-gold hover:text-gold"
            >
              Book for Calls
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function MentorshipVideo({ src }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="relative bg-navy-dark">
      <video
        ref={videoRef}
        className="mentorship-video"
        playsInline
        preload="metadata"
        onClick={toggle}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-3 left-3 z-10 rounded-full bg-navy-dark px-4 py-2 text-xs font-semibold text-white ring-1 ring-gold/50 hover:bg-navy"
        aria-label={playing ? "Pause mentorship video" : "Play mentorship video"}
      >
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
}
