export const site = {
  name: "HIACDI Tech Hub",
  motto: "Learn. Build. Innovate.",
  tagline: "Technology Education + Innovation + Digital Solutions",
  announcement:
    "New intake alert! HIACDI Tech Hub bootcamps are now open. Apply now",
  email: "hiacditechhub@gmail.com",
  admissionsEmail: "hiacditechhub@gmail.com",
  location: "Kenya",
  whatsapp: "0741808582",
  hero: {
    title: "Empowering the Next Generation of Digital Innovators",
    text: "This is for everyone with a passion to learn technology — whether you are in primary school, secondary school, a graduate, a working professional, or anyone who wants to know more about tech. If you have the passion to learn, you are highly welcome. Join us.",
    logoSrc: "/brand/logo-wordmark.png?v=3",
  },
  learningModes: [
    { id: "full-time", label: "Full-time Classes" },
    { id: "part-time", label: "Part-time Classes" },
    { id: "remote", label: "Remote Learning" },
    { id: "in-person", label: "In-person Learning" },
  ],
  booking: {
    host: "HIACDI Tech Hub Contact",
    title: "Admissions Open Hours",
    durationMinutes: 45,
    location: "Web conferencing details provided upon confirmation.",
    greeting: "Hello!",
    intro:
      "We're looking forward to talking to you. This is a group info session with HIACDI Academic Advisors.",
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
    text: "Learn by building. Every HIACDI program is anchored in labs, reviews, and working projects, not slides alone.",
    color: "bg-gold",
    image: "/home/feature-1.jpg",
  },
  {
    title: "Technical Mentor Support with Live Instructor-Led Classes",
    text: "Train with practitioners who review your work, challenge your thinking, and help you apply skills with confidence.",
    color: "bg-navy",
    image: "/home/feature-2.jpg",
  },
  {
    title: "From Learning to Building",
    text: "Move from classroom practice to real solutions, portfolios, and opportunity through the HIACDI technology ecosystem.",
    color: "bg-navy-dark",
    image: "/home/feature-3.jpg",
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
