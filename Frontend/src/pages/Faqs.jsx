import Accordion from "../components/ui/Accordion";
import PageHero from "../components/layout/PageHero";
import { faqs } from "../data/about";

export default function Faqs() {
  return (
    <div>
      <PageHero
        eyebrow="FAQs"
        title="Questions learners and partners ask HassAz"
        text="Admissions, teaching, certificates, and how to start. If your question is not here, write to hassaztechhub@gmail.com or book a call."
      />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <Accordion items={faqs} />
      </section>
    </div>
  );
}
