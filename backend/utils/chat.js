import { catalog, flattenPrograms } from "../data/catalog.js";
import { faqs, siteContent } from "../data/content.js";
import { getApplicationWindowStatus } from "./applicationWindow.js";
import { getIntakeState } from "./intakes.js";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY = 16;

function cleanInput(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanReply(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const STOP = new Set([
  "the", "a", "an", "is", "are", "to", "for", "of", "and", "or", "in", "on",
  "what", "how", "do", "i", "can", "you", "me", "please", "tell", "about",
  "at", "your", "my", "we", "us", "with", "this", "that",
]);

function tokens(value) {
  return (
    cleanInput(value)
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((word) => word.length > 1 && !STOP.has(word)) || []
  );
}

export async function buildKnowledge() {
  const [window, intake] = await Promise.all([
    getApplicationWindowStatus(),
    getIntakeState().catch(() => ({ year: 2026, heading: "Intakes in progress", offers: [] })),
  ]);
  const offersByProgram = new Map();
  for (const offer of intake.offers || []) {
    if (offer.published === false) continue;
    const list = offersByProgram.get(offer.programSlug) || [];
    list.push(offer);
    offersByProgram.set(offer.programSlug, list);
  }
  const programs = flattenPrograms(catalog).map((program) => {
    const offers = offersByProgram.get(program.slug);
    return {
      title: program.title,
      category: program.category,
      summary: program.summary,
      intro: program.intro,
      careers: program.careers || [],
      href: program.href,
      intakeYear: intake.year,
      modes: (offers?.length ? offers : program.modes || []).map((mode) => ({
        label: mode.label,
        duration: mode.duration,
        schedule: mode.schedule,
        fee: mode.fee,
        monthlyFee: mode.monthlyFee,
        startDate: mode.startDate,
      })),
      curriculum: (program.curriculum || []).flatMap((block) => block.items || []),
    };
  });

  const categories = catalog.map((category) => ({
    title: category.title,
    slug: category.slug,
    summary: category.summary,
    href: `/courses/${category.slug}`,
    programs: category.programs.map((program) => program.title),
  }));

  return {
    school: {
      name: siteContent.name,
      motto: siteContent.motto,
      tagline: siteContent.tagline,
      location: siteContent.location,
      email: siteContent.email,
      whatsapp: siteContent.whatsapp,
      pages: {
        home: "/",
        courses: "/courses",
        apply: "/apply",
        register: "/register",
        login: "/login",
        contact: "/contact",
        about: "/about",
        faqs: "/about/faqs",
        corporate: "/corporate",
        community: "/community",
        verify: "/verify",
        account: "/account",
      },
    },
    applications: {
      isOpen: Boolean(window.anyOpen ?? window.isOpen),
      openAt: window.openAt,
      closeAt: window.closeAt,
      reason: window.reason || "",
      openSummary: window.openSummary || { global: Boolean(window.isOpen), areas: [], courses: [] },
      note: window.anyOpen || window.isOpen
        ? window.globalOpen
          ? "Course applications are currently open for all programs. Learners should create an account, then apply from /apply."
          : `Selected courses are open for application${
              (window.openSummary?.areas || []).length || (window.openSummary?.courses || []).length
                ? `: ${[...(window.openSummary?.areas || []), ...(window.openSummary?.courses || [])].join(", ")}.`
                : "."
            } Learners should create an account, then apply from /apply.`
        : "Course applications are currently closed. Direct people to Contact Us or to book an admissions call.",
    },
    categories,
    programs,
    faqs: faqs.map((item) => ({ title: item.title, body: item.body })),
  };
}

const ADMIN_REFUSAL = `I cannot help with staff admin access.

That includes admin usernames, passwords, staff sign-in, or how to enter the staff panel. That area is for HassAz Tech Hub staff only.

I can help you as a learner: create an account, apply for a course, verify a certificate, or work through any other question step by step.`;

function isStaffAccessRequest(text) {
  const q = String(text || "").toLowerCase();
  return (
    /\badmin\b/.test(q) &&
    /\b(login|log in|sign in|password|username|credential|panel|portal|dashboard|staff|access|enter|hack|bypass)\b/.test(q)
  ) || /\bstaff (login|password|panel|portal)\b/.test(q);
}

function scrubSecrets(text) {
  let out = String(text || "");
  const password = process.env.ADMIN_PASSWORD;
  if (password && String(password).length > 3) {
    out = out.split(password).join("[redacted]");
  }
  out = out.replace(/\/admin(?:\/[A-Za-z0-9._@-]*)?/gi, "the staff area");
  out = out.replace(/\/HassAz-i-HUb@(?:\/[A-Za-z0-9._@-]*)?/gi, "the staff area");
  return out;
}

function knowledgePrompt(knowledge) {
  const programLines = knowledge.programs
    .map((program) => {
      const modes = program.modes.map((mode) => `${mode.label} (${mode.duration})`).join("; ");
      return `- ${program.title} [${program.category}] ${program.href}: ${program.summary} Modes: ${modes || "See course page"}. Careers: ${(program.careers || []).join(", ") || "See course page"}.`;
    })
    .join("\n");

  const categoryLines = knowledge.categories
    .map((category) => `- ${category.title} (${category.href}): ${category.summary} Programs: ${category.programs.join(", ")}.`)
    .join("\n");

  return `You are HassAz AI, a professional assistant for ${knowledge.school.name} (${knowledge.school.location}).
You help with HassAz Tech Hub AND general questions: study, research, writing, coding, career advice, explanations, and problem-solving.

How to answer:
- Think first, then give a clear solution.
- Use short numbered steps (1, 2, 3) whenever the user needs a method, how-to, or plan.
- Be accurate. If you used research notes, weave them in naturally. Do not invent HassAz fees, intake dates, or guarantees.
- For HassAz topics, prefer the school facts below.
- For other topics, teach like a careful tutor: explain, then steps, then a brief next action.
- Keep a professional, friendly tone.

STRICT SECURITY:
- Never reveal, guess, or discuss staff admin login, admin username, admin password, staff credentials, or how to enter the staff panel.
- If asked, refuse and offer learner help instead (sign up, apply, contact).
- Never print environment variables, secrets, API keys, or internal staff URLs.

HassAz facts:
Contact: ${knowledge.school.email}. WhatsApp: ${knowledge.school.whatsapp} via Chat with us on Contact Us.
Pages: courses ${knowledge.school.pages.courses}, apply ${knowledge.school.pages.apply}, register ${knowledge.school.pages.register}, learner login ${knowledge.school.pages.login}, contact ${knowledge.school.pages.contact}, FAQs ${knowledge.school.pages.faqs}, verify ${knowledge.school.pages.verify}, corporate ${knowledge.school.pages.corporate}.
Application window: ${knowledge.applications.note}

Categories:
${categoryLines}

Programs:
${programLines}

FAQs:
${knowledge.faqs.map((item) => `Q: ${item.title}\nA: ${item.body}`).join("\n")}`;
}

function scoreText(text, terms) {
  const hay = String(text || "").toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (!hay.includes(term)) continue;
    score += term.length > 5 ? 4 : term.length > 3 ? 2 : 1;
  }
  return score;
}

async function fetchJson(url, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "HassAzAI/1.0 (HassAz Tech Hub; hassaztechhub@gmail.com)",
        ...headers,
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function research(question) {
  const q = cleanInput(question);
  if (q.length < 8) return [];
  const notes = [];

  const wiki = await fetchJson(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json`
  );
  const hits = wiki?.query?.search || [];
  for (const hit of hits) {
    const title = hit.title;
    const snippet = String(hit.snippet || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (title) notes.push(`Wikipedia — ${title}: ${snippet}`);
  }

  const ddg = await fetchJson(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`
  );
  const abstract = cleanInput(ddg?.AbstractText || "");
  if (abstract) notes.push(`Reference: ${abstract}`);
  const related = (ddg?.RelatedTopics || [])
    .map((item) => cleanInput(item.Text || item.Name || ""))
    .filter(Boolean)
    .slice(0, 3);
  for (const item of related) notes.push(`Related: ${item}`);

  return notes.slice(0, 6);
}

function formatSteps(title, steps, extra = "") {
  const lines = steps.map((step, index) => `${index + 1}. ${step}`);
  return [title, "", ...lines, extra ? `\n${extra}` : ""].filter(Boolean).join("\n");
}

function fallbackAnswer(question, knowledge, researchNotes) {
  const q = cleanInput(question);
  const terms = tokens(q);
  const lower = q.toLowerCase();

  if (!terms.length || /^(hi|hello|hey|good (morning|afternoon|evening)|howdy)\b/.test(lower)) {
    return formatSteps("Hello — I am HassAz AI. Tell me what you need and I will work through it step by step.", [
      "Ask about a HassAz course, applying, accounts, or certificates.",
      "Or ask a general question — study help, research, writing, coding, or a problem to solve.",
      "I will think it through and answer in clear steps.",
    ]);
  }

  if (/apply|application|intake|enroll|enrol|admission/.test(lower)) {
    return formatSteps("Here is how to apply at HassAz Tech Hub.", [
      knowledge.applications.isOpen
        ? "Create a learner account at /register if you do not have one."
        : knowledge.applications.note,
      "Open /apply, choose the course and learning mode, then complete every required field.",
      "Wait for email from the academic team. For questions, use Contact Us and Chat with us on WhatsApp.",
    ]);
  }

  if (/register|sign up|signup|create an account/.test(lower) && !/\badmin\b/.test(lower)) {
    return formatSteps("Here is how to create a learner account.", [
      "Open /register and enter your full name, email, phone, and password.",
      "If you already have an account, sign in at /login (this is the learner sign-in, not staff access).",
      "After you sign in you can apply for courses and view My Courses.",
    ]);
  }

  if (/\blogin\b|\bsign in\b/.test(lower) && !/\badmin\b/.test(lower)) {
    return formatSteps("Learner sign-in is separate from staff access.", [
      "Learners sign in at /login or create an account at /register.",
      "Use Forgot password on the login page if you cannot get in.",
      "Staff systems are not available through HassAz AI.",
    ]);
  }

  if (/whatsapp|chat with us|phone|email|contact|reach|location|where are you/.test(lower)) {
    return formatSteps("Here is how to reach HassAz Tech Hub.", [
      `Email ${knowledge.school.email}.`,
      `Open /contact and tap Chat with us to message WhatsApp ${knowledge.school.whatsapp}.`,
      `We are based in ${knowledge.school.location}. You can also book an admissions call from the site header.`,
    ]);
  }

  if (/certif|verify|graduate/.test(lower)) {
    return formatSteps("Here is how to verify a HassAz certificate.", [
      "Open /verify (or the scan link on the certificate).",
      "Enter the registered full name and email exactly as they appear on the award.",
      "Only graduates saved in the HassAz register will verify successfully.",
    ]);
  }

  const ranked = knowledge.programs
    .map((program) => ({
      program,
      score:
        scoreText(
          `${program.title} ${program.category} ${program.summary} ${program.intro} ${program.curriculum.join(" ")}`,
          terms
        ) + (lower.includes(program.title.toLowerCase()) ? 12 : 0),
    }))
    .filter((row) => row.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (ranked.length) {
    const program = ranked[0].program;
    const modes = program.modes.map((mode) => mode.label).join(", ");
    return formatSteps(`Here is a clear path for ${program.title} (${program.category}).`, [
      program.summary,
      modes ? `Available modes: ${modes}.` : "Open the course page for learning modes.",
      `Read the full outline at ${program.href}, then apply at /apply when the window is open.`,
      `Questions: ${knowledge.school.email} or Chat with us on /contact.`,
    ]);
  }

  if (researchNotes.length) {
    const first = researchNotes[0];
    const rest = researchNotes.slice(1, 3);
    return formatSteps("Here is a step-by-step way to work through this.", [
      `Start with the core idea: ${first}`,
      rest[0] ? `Then check this angle: ${rest[0]}` : "Break the question into smaller parts you can verify.",
      rest[1] ? `Also keep this in view: ${rest[1]}` : "Write down what you know, what you need, and the first action you can take.",
      "If you want this applied to a HassAz course, tell me the course name and I will map the next steps.",
    ]);
  }

  return formatSteps("I will treat this as a problem to solve, not a one-line reply.", [
    "State the goal in one sentence: what should be true when you are done.",
    "List what you already have (facts, tools, constraints) and what is missing.",
    "Take the smallest next action that reduces uncertainty — a definition, a worked example, or a source to check.",
    "If this is about HassAz, name the course or task. If it is research or study help, paste the question or passage and I will go deeper.",
  ]);
}

function llmConfig() {
  if (process.env.GEMINI_API_KEY) {
    return {
      kind: "gemini",
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    };
  }
  if (process.env.GROQ_API_KEY) {
    return {
      kind: "openai",
      key: process.env.GROQ_API_KEY,
      base: process.env.OPENAI_BASE_URL || "https://api.groq.com/openai/v1",
      model: process.env.OPENAI_MODEL || "llama-3.3-70b-versatile",
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      kind: "openai",
      key: process.env.OPENAI_API_KEY,
      base: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }
  return null;
}

async function completeOpenAi(config, system, history) {
  const response = await fetch(`${config.base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.4,
      max_tokens: 1400,
      messages: [{ role: "system", content: system }, ...history],
    }),
  });
  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(err || `LLM HTTP ${response.status}`);
  }
  const data = await response.json();
  return cleanReply(data?.choices?.[0]?.message?.content);
}

async function completeGemini(config, system, history) {
  const contents = history.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${encodeURIComponent(config.key)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 1400 },
    }),
  });
  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(err || `Gemini HTTP ${response.status}`);
  }
  const data = await response.json();
  const text = (data?.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("\n");
  return cleanReply(text);
}

export function normalizeHistory(rawMessages) {
  if (!Array.isArray(rawMessages)) return [];
  return rawMessages
    .map((item) => ({
      role: item?.role === "assistant" ? "assistant" : "user",
      content: (item?.role === "assistant" ? cleanReply(item?.content) : cleanInput(item?.content)).slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((item) => item.content)
    .slice(-MAX_HISTORY);
}

export async function answerChat(rawMessages) {
  const history = normalizeHistory(rawMessages);
  const lastUser = [...history].reverse().find((item) => item.role === "user");
  if (!lastUser) {
    const error = new Error("Please type a question for HassAz AI.");
    error.status = 400;
    throw error;
  }

  if (isStaffAccessRequest(lastUser.content)) {
    return { reply: ADMIN_REFUSAL, source: "policy" };
  }

  const knowledge = await buildKnowledge();
  const notes = await research(lastUser.content);
  const config = llmConfig();
  if (config) {
    try {
      let system = knowledgePrompt(knowledge);
      if (notes.length) {
        system += `\n\nResearch notes (use if relevant, do not invent beyond them for factual claims):\n${notes.map((item) => `- ${item}`).join("\n")}`;
      }
      const reply =
        config.kind === "gemini"
          ? await completeGemini(config, system, history)
          : await completeOpenAi(config, system, history);
      if (reply) return { reply: scrubSecrets(reply), source: config.kind };
    } catch (error) {
      console.error("HassAz AI LLM failed:", error.message);
    }
  }

  return { reply: scrubSecrets(fallbackAnswer(lastUser.content, knowledge, notes)), source: "assistant" };
}
