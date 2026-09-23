export const site = {
  name: "HassAz Tech Hub",
  motto: "Learn. Build. Innovate.",
  tagline: "Technology Education + Innovation + Digital Solutions",
  announcement:
    "New intake alert! HassAz Tech Hub bootcamps are now open. Apply now",
  email: "hassaztechhub@gmail.com",
  admissionsEmail: "hassaztechhub@gmail.com",
  location: "Kenya",
  whatsapp: "0741808582",
  hero: {
    title: "Empowering the Next Generation of Digital Innovators",
    text: "Whether you are a high school graduate, a university student or a working professional looking to upskill or switch to tech, HassAz Tech Hub offers practical training tailored to your journey. We meet you where you are and guide you to where you want to go in the tech world.",
    logoSrc: "/brand/logo-wordmark.png?v=2",
  },
  learningModes: [
    { id: "full-time", label: "Full-time Classes" },
    { id: "part-time", label: "Part-time Classes" },
    { id: "remote", label: "Remote Learning" },
    { id: "in-person", label: "In-person Learning" },
  ],
  booking: {
    host: "HassAz Tech Hub Contact",
    title: "Admissions Open Hours",
    durationMinutes: 45,
    location: "Web conferencing details provided upon confirmation.",
    greeting: "Hello!",
    intro:
      "We're looking forward to talking to you. This is a group info session with HassAz Academic Advisors.",
    expect: [
      "Lots of friendly chats and one-on-one interactions",
      "Talk to our Academic Advisors and find out more about courses, learning models, payment options, etc",
      "Get all your queries and concerns addressed",
      "Free career consultation sessions",
    ],
    prepare: [
      "A laptop/smartphone and a stable internet connection.",
      "Switch on your video and keep the microphone on mute unless you are speaking.",
      "Join from a quiet location.",
      "Accept the meeting invite once it is sent.",
    ],
    closing: "Make sure to keep time. Looking forward to e-meeting you!",
    timezone: "Africa/Nairobi",
    timezoneLabel: "East Africa Time",
    openWeekdays: [2],
    times: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    weeksAhead: 8,
  },
};

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/about", label: "About" },
  { to: "/corporate", label: "Corporate" },
  { to: "/community", label: "Community" },
  { to: "/contact", label: "Contact Us" },
];

export { catalog, courses } from "./catalog.js";

export const features = [
  {
    title: "Accelerated Project-Based Learning",
    text: "Learn by building. Every HassAz program is anchored in labs, reviews, and working projects, not slides alone.",
    color: "bg-gold",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Technical Mentor Support with Live Instructor-Led Classes",
    text: "Train with practitioners who review your work, challenge your thinking, and help you apply skills with confidence.",
    color: "bg-navy",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "From Learning to Building",
    text: "Move from classroom practice to real solutions, portfolios, and opportunity through the HassAz technology ecosystem.",
    color: "bg-navy-dark",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  },
];

export const graduateEmployers = [
  { name: "Safaricom", src: "/partners/safaricom.svg" },
  { name: "Google", src: "/partners/google.svg" },
  { name: "Microsoft", src: "/partners/microsoft.svg" },
  { name: "Airtel", src: "/partners/airtel.svg" },
  { name: "Amazon", src: "/partners/amazon.svg" },
  { name: "Absa", src: "/partners/absa.svg" },
  { name: "Equity", src: "/partners/equity.svg" },
  { name: "KCB", src: "/partners/kcb.svg" },
  { name: "I&M", src: "/partners/imb.svg" },
  { name: "Huawei", src: "/partners/huawei.svg" },
  { name: "IBM", src: "/partners/ibm.svg" },
  { name: "Oracle", src: "/partners/oracle.svg" },
  { name: "NCBA", src: "/partners/ncba.svg" },
  { name: "Stanbic", src: "/partners/stanbic.svg" },
  { name: "Meta", src: "/partners/meta.svg" },
];
