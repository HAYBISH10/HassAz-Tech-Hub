export { courses } from "./courses.js";

export const siteContent = {
  name: "HIACDI Tech Hub",
  motto: "Learn. Build. Innovate.",
  tagline: "Technology Education + Innovation + Digital Solutions",
  announcement:
    "New intake alert! HIACDI Tech Hub bootcamps are now open. Apply now",
  email: "hiacditechhub@gmail.com",
  admissionsEmail: "hiacditechhub@gmail.com",
  location: "Kenya",
  whatsapp: process.env.WHATSAPP || "0741808582",
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

export const faqs = [
  {
    title: "What is HIACDI Tech Hub?",
    body: "HIACDI Tech Hub is a Kenya-based technology institution. We combine professional training, mentorship, and digital solutions so learners can gain skills, build real work, and move into employment, further study, or their own products.",
  },
  {
    title: "Who can apply?",
    body: "Everyone with a passion to learn technology — whether you are in primary school, secondary school, a graduate, a working professional, or anyone who wants to know more about tech. If you have the passion to learn, you are highly welcome. Join us.",
  },
  {
    title: "How do you teach?",
    body: "Live instructor-led classes, lab time with a mentor, and project reviews. We do not treat a recording library as a course. You practise, you are reviewed, and you rebuild the work yourself.",
  },
  {
    title: "What learning modes are available?",
    body: "Full-time, part-time, remote, and in-person options, depending on the program. Open a course to see the modes offered for that intake.",
  },
  {
    title: "Do you award certificates?",
    body: "Yes. Learners who complete an awarded program receive a HIACDI Tech Hub certificate. Only students saved in our graduate register can verify a certificate. Scan the QR on the certificate, then enter the registered full name and email.",
  },
  {
    title: "How do I verify a certificate?",
    body: "Scan the QR code on the certificate or go to /verify, then enter the full name and email exactly as printed on the certificate. The result is shown immediately and a confirmation email is sent to the email address provided.",
  },
  {
    title: "How do I apply?",
    body: "Choose a program, pick a learning mode, and complete the application form at /apply. You can also book an admissions call if you want to speak with the academic team first.",
  },
  {
    title: "Do you train organisations?",
    body: "Yes. Universities, companies, NGOs, and public institutions can work with us on staff training, capacity building, and talent pipelines. See /corporate or write to hiacditechhub@gmail.com.",
  },
  {
    title: "Where are you based?",
    body: "HIACDI Tech Hub is based in Kenya. Remote learning is available on selected programs, and in-person options are listed on each course.",
  },
];
