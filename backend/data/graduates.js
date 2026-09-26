import { normalizeEmail, normalizeName } from "../utils/names.js";

export const seedGraduates = [
  {
    certificateId: "HIACDI-CERT-2026-0001",
    fullName: "Hassan Issack Mohamed",
    email: "hassanhaybish@gmail.com",
    nameKey: normalizeName("Hassan Issack Mohamed"),
    emailKey: normalizeEmail("hassanhaybish@gmail.com"),
    program: "Software Development Program",
    details:
      "Successfully completed a 16 weeks program in software development covering Python, Web Technologies, Database Management, Startup Building & Employability and Software Engineering Essentials, with specialization in AI for Software Engineering.",
    aliases: ["Hassan Issack Mohamed", "Hassan Issack"],
    awarded: true,
  },
];
