export default function PageHero({ eyebrow, title, text, children }) {
  return (
    <section className="relative overflow-hidden bg-navy-dark px-4 py-14 text-white sm:px-6 sm:py-20">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/10" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="relative mx-auto max-w-6xl">
        {eyebrow ? <p className="text-sm font-semibold tracking-wide text-gold">{eyebrow}</p> : null}
        <h1 className="font-heading mt-3 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {text ? (
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/80 sm:mt-6 sm:text-base sm:leading-8">{text}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
