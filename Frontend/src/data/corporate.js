export const corporateNavLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/corporate", label: "Corporate", end: true },
  { to: "/corporate/hire", label: "Hire Our Graduates" },
  { to: "/corporate/training", label: "Corporate Training" },
  { to: "/corporate/partner", label: "Partner With Us" },
];

export const corporate = {
  hero: {
    eyebrow: "HassAz Tech Hub for organisations",
    title: "Your technology talent partner in Kenya",
    text: "HassAz Tech Hub works with companies, universities, NGOs, and public institutions that need people who can do the work — not only sit through a seminar. We train teams, prepare graduates for hire, and design partnerships around a professional standard: live teaching, reviewed projects, and skills that hold up in the workplace.",
  },
  partnerLead:
    "We close the gap between classroom theory and the work organisations actually need. HassAz upskills and reskills teams, and prepares graduates who have already been reviewed on real projects in software, data, cybersecurity, and artificial intelligence.",
  pillars: [
    {
      title: "Talent",
      text: "Hire graduates who have built, presented, and defended their work. Every awarded learner has been through live labs, mentor review, and a standard you can inspect — not a recording library.",
      image:
        "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
      to: "/corporate/hire",
      cta: "Learn more",
    },
    {
      title: "Quality",
      text: "Corporate programmes are designed by practitioners. We teach the methods used on real products: code review, data that a manager can trust, secure practice, and AI used with judgment.",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
      to: "/corporate/training",
      cta: "Corporate training",
    },
    {
      title: "Expertise",
      text: "Partner with the hub on staff training, sponsored cohorts, campus labs, and applied builds. We stay in the room after the workshop so the skill is used, not forgotten.",
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      to: "/corporate/partner",
      cta: "Partner with us",
    },
  ],
  stats: [
    { value: "6", label: "Programme areas, from software engineering to data, cyber, AI, privacy, and school pathways" },
    { value: "3", label: "Intakes a year — January, June, and December — so teams can plan hiring and training" },
    { value: "Live", label: "Instructor-led classes with a mentor in the lab, not slide-only delivery" },
    { value: "Kenya", label: "Based in Kenya, with remote options on selected programmes for distributed teams" },
    { value: "Review", label: "Every serious pathway ends in work a learner can walk an employer through" },
    { value: "Partner", label: "Universities, companies, NGOs, and public institutions can commission a cohort" },
  ],
  offers: [
    {
      title: "Staff training that is used this quarter",
      text: "Custom programmes in software, data, cybersecurity, and AI for teams that need skill they can apply immediately. We agree the outcome first — a workflow, a dashboard, a secure practice, a product increment — then teach to that standard.",
    },
    {
      title: "Capacity building that lasts after the workshop",
      text: "We work with universities, NGOs, and public institutions to design labs, mentor models, and learner pathways. The aim is a habit of review and delivery that stays when HassAz leaves the room.",
    },
    {
      title: "Talent pipelines you can hire from",
      text: "HassAz graduates are reviewed on projects, not only attendance. Organisations can hire from an awarded cohort, sponsor a class for a defined role, or run an internship studio with the Academic Director.",
    },
    {
      title: "Digital solutions with a teaching standard",
      text: "Partner on applied builds where practitioners and advanced learners work on a defined problem. The organisation gets output; learners get work they can defend. Both sides are held to the same professional bar.",
    },
  ],
  who: [
    {
      title: "Companies and startups",
      text: "Upskill engineers and analysts, hire reviewed graduates, or run a short academy for a product team that must move faster without lowering quality.",
    },
    {
      title: "Universities and colleges",
      text: "Add live labs, mentor review, and industry-facing projects to an existing faculty programme. We do not replace your degree — we make the practice side serious.",
    },
    {
      title: "NGOs and public institutions",
      text: "Build digital capacity for service delivery, data use, and information security. Training is scoped to the work your staff already do.",
    },
  ],
  process: [
    {
      step: "01",
      title: "Discovery call",
      text: "We listen to the roles, the skill gap, and the timeline. You meet Academic Advisors or the partnership lead — not a generic sales script.",
    },
    {
      step: "02",
      title: "Scoped proposal",
      text: "You receive a written outline: outcomes, duration, mode (in-person, remote, or hybrid), assessment, and how success will be judged.",
    },
    {
      step: "03",
      title: "Delivery and review",
      text: "Live sessions, labs, and mentor review. Managers can see progress. Learners produce work, not only attendance lists.",
    },
    {
      step: "04",
      title: "Handover",
      text: "We close with artefacts you can keep: projects, reports, and a clear note on what the team can now do without us in the room.",
    },
  ],
  hire: {
    title: "Hire HassAz graduates who have already been reviewed",
    intro:
      "A HassAz certificate is not a participation badge. Awarded graduates have completed live instruction, lab work, and a standard of review set by practitioners. When you hire from the hub, you meet people who can talk through their code, their analysis, or their security decisions.",
    points: [
      {
        title: "Software engineering",
        text: "Full-stack and related pathways. Graduates have shipped interfaces, APIs, and reviewed projects — with Git discipline and the habit of explaining a design choice.",
      },
      {
        title: "Data and analytics",
        text: "Data Science Bootcamp and analytics programmes. Graduates clean data, build views a manager can use, and present findings without hiding behind a tool name.",
      },
      {
        title: "Cybersecurity",
        text: "Defensive practice, threat awareness, and careful analysis. We train people to think like a security team, not only to click through a certification dump.",
      },
      {
        title: "Artificial intelligence",
        text: "Applied AI with judgment: when to use a model, how to check the output, and how to support a real product or operations decision.",
      },
    ],
    steps: [
      "Tell us the role, the stack, and whether you need an intern, a junior hire, or a short project placement.",
      "We shortlist awarded graduates whose projects match the work — name, pathway, and what they built.",
      "You interview. We do not inflate a CV. If the fit is wrong, we say so.",
      "Onboarding can include a short HassAz studio so the first weeks stay close to the standard they were taught.",
    ],
  },
  training: {
    title: "Corporate training built around your work, not a generic syllabus",
    intro:
      "Most staff training fails because it is a slide deck with a certificate at the end. HassAz designs programmes for a named team and a named outcome. Sessions are live. Work is reviewed. Managers can see whether the skill transferred.",
    tracks: [
      {
        title: "Engineering upskilling",
        text: "Modern JavaScript and backend practice, APIs, databases, and how a small team reviews and ships work. Suitable for support staff moving into build roles, or engineers who need a shared standard.",
      },
      {
        title: "Data for decision-makers and analysts",
        text: "From spreadsheets that cannot be trusted to clean pipelines, dashboards, and a habit of asking what the number actually means. Built for operations, finance, and product teams as well as analysts.",
      },
      {
        title: "Cybersecurity awareness and practice",
        text: "Phishing, access, and secure handling of data — taught as behaviour, then practised. We can go deeper for IT and security staff who need labs, not only a policy briefing.",
      },
      {
        title: "Applied AI for teams",
        text: "How to use models in real workflows without leaking data or accepting a confident wrong answer. Staff leave with a written rule of use for your organisation.",
      },
    ],
    modes: [
      "Full-time intensive weeks for a cohort you release from the roster",
      "Part-time evenings so operations do not stop",
      "Remote live sessions for distributed offices",
      "In-person labs in Kenya when the work needs hands on a machine in the same room",
    ],
  },
  partner: {
    title: "Partner with HassAz on training, talent, and applied builds",
    intro:
      "A partnership is a written relationship with a purpose: a sponsored cohort, a campus lab, a hiring pipeline, or a product built to a professional standard. We do not sell logo placement as impact.",
    kinds: [
      {
        title: "Sponsored cohorts",
        text: "Fund a class for your organisation, your county, or a community you already serve. You help set the outcome. HassAz teaches and reviews. Graduates can be considered for your roles first if that is the agreement.",
      },
      {
        title: "Campus and faculty partnerships",
        text: "Add live labs and industry projects beside an existing degree or diploma. Faculty stay in charge of the academic award. HassAz holds the practice bar.",
      },
      {
        title: "Hiring partnerships",
        text: "Meet awarded graduates on a regular cycle — January, June, and December intakes — so recruitment is planned, not last-minute.",
      },
      {
        title: "Applied digital solutions",
        text: "Define a problem. We staff it with practitioners and advanced learners. You receive working output and a handover. Learners receive work they can show.",
      },
    ],
  },
  highlights: [
    {
      title: "Three planned intakes a year",
      text: "January, June, and December. Organisations can align hiring and staff training with the same calendar learners already use.",
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Certificate verification",
      text: "Only graduates saved in our register can verify a HassAz certificate. Scan the QR, then match the registered name and email.",
      image:
        "https://images.unsplash.com/photo-1589330694653-ded6df03f7dd?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Mentorship as the teaching method",
      text: "Corporate and public programmes use the same rule as our bootcamps: a mentor in the room, work reviewed, and no slide-only course.",
      image:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    },
  ],
};
