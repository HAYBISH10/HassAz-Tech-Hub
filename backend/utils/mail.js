import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/verification-emails.json");
const fromAddress = process.env.SMTP_USER || "hassaztechhub@gmail.com";
const contactEmail = "hassaztechhub@gmail.com";
const contactPhone = "0741 808 582";
const DEFAULT_EMAIL_LOGO_URL = "https://files.catbox.moe/khxe1w.png";

function hostedLogoUrl() {
  const explicit = String(process.env.EMAIL_LOGO_URL || "").trim();
  if (explicit) return explicit;
  const backend = String(process.env.BACKEND_URL || "").replace(/\/$/, "");
  if (/^https:\/\//i.test(backend)) return `${backend}/api/public/email-logo.png`;
  const site = String(process.env.FRONTEND_URL || "").replace(/\/$/, "");
  if (/^https:\/\//i.test(site)) return `${site}/brand/logo-email.png?v=3`;
  return DEFAULT_EMAIL_LOGO_URL;
}

export function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firstName(fullName) {
  return String(fullName || "").trim().split(/\s+/)[0] || "there";
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function paragraphs(lines) {
  return lines
    .map((line) => {
      const html = escapeHtml(line)
        .replace(/&lt;strong&gt;/gi, "<strong>")
        .replace(/&lt;\/strong&gt;/gi, "</strong>")
        .replace(/&lt;br\s*\/?&gt;/gi, "<br/>");
      return `<p style="margin:0 0 14px; color:#1f2937; font-size:14px; line-height:1.7;">${html}</p>`;
    })
    .join("");
}

function wrapHtml({ bodyHtml }) {
  const year = new Date().getFullYear();
  const logoSrc = hostedLogoUrl();
  const preheader = String(bodyHtml || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
  const logoImg = logoSrc
    ? `<img src="${escapeHtml(logoSrc)}" alt="" width="72" height="72" style="display:block; margin:0 auto; height:72px; width:auto; border:0;" />`
    : "";
  return `<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#f5f7fa;">
    <div style="display:none; font-size:1px; color:#f5f7fa; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${preheader}</div>
    <div style="max-width:600px; margin:0 auto; font-family:Arial, Helvetica, sans-serif; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
      <div style="background:#f4efe4; padding:28px 24px; text-align:center;">
        ${logoImg}
        <p style="margin:10px 0 0; font-weight:700; font-size:16px; color:#0a2e6d;">
          HassAz <span style="color:#d4af37;">TECH</span> HUB
        </p>
      </div>
      <div style="padding:28px 24px;">
        ${bodyHtml}
      </div>
      <div style="border-top:1px solid #eef0f3; padding:16px 24px; text-align:center; font-size:12px; color:#6b7280;">
        © Copyright ${year} by HassAz Tech Hub. All rights reserved.
      </div>
    </div>
  </body>
</html>`;
}

export function verifiedResultLetter() {
  const subject = "Certificate Verification Result";
  const text = [
    "Dear Student,",
    "",
    "We are pleased to confirm that, following verification by the Academic Director, the certificate/details presented have been officially verified and authenticated by HassAz Tech Hub.",
    "",
    "The certificate is therefore recognized as a valid record issued by HassAz Tech Hub.",
    "",
    "Thank you for your cooperation and patience throughout the verification process.",
    "",
    "Kind regards,",
    "HassAz Tech Hub",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      "Dear Student,",
      "We are pleased to confirm that, following verification by the <strong>Academic Director</strong>, the certificate/details presented have been <strong>officially verified and authenticated by HassAz Tech Hub</strong>.",
      "The certificate is therefore recognized as a valid record issued by HassAz Tech Hub.",
      "Thank you for your cooperation and patience throughout the verification process.",
      "Kind regards,<br/><strong>HassAz Tech Hub</strong>",
    ]),
  });

  return { subject, text, html };
}

export function notVerifiedResultLetter() {
  const subject = "Certificate Verification Result";
  const text = [
    "Dear Student,",
    "",
    "Please be informed that the certificate/details presented have not been verified or authenticated by HassAz Tech Hub and are not recognized as an officially verified record by our institution.",
    "",
    "HassAz Tech Hub takes the authenticity and integrity of its academic certificates and records very seriously. Any certificate or document presented as having been issued by the institution must be verified through the appropriate official channels.",
    "",
    "Kindly contact our Academic Director for official verification and further assistance. Until verification is completed, the authenticity of the document cannot be confirmed or recognized by HassAz Tech Hub.",
    "",
    "Thank you for your cooperation.",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      "Dear Student,",
      "Please be informed that the certificate/details presented have <strong>not been verified or authenticated by HassAz Tech Hub</strong> and are not recognized as an officially verified record by our institution.",
      "HassAz Tech Hub takes the authenticity and integrity of its academic certificates and records very seriously. Any certificate or document presented as having been issued by the institution must be verified through the appropriate official channels.",
      "Kindly contact our <strong>Academic Director</strong> for official verification and further assistance. Until verification is completed, the authenticity of the document cannot be confirmed or recognized by HassAz Tech Hub.",
      "Thank you for your cooperation.",
    ]),
  });

  return { subject, text, html };
}

function saveCopy(record) {
  const dir = dirname(storePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const current = existsSync(storePath) ? JSON.parse(readFileSync(storePath, "utf8") || "[]") : [];
  current.push({ ...record, sentAt: new Date().toISOString() });
  writeFileSync(storePath, JSON.stringify(current, null, 2));
}

export async function sendMail({ to, subject, text, html, attachments }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    return { emailed: false };
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user, pass },
      tls: { minVersion: "TLSv1.2" },
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    await transporter.sendMail({
      from: `HassAz Tech Hub <${fromAddress}>`,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
      ...(attachments?.length
        ? {
            attachments: attachments.map((item) => ({
              ...item,
              contentDisposition: item.contentDisposition || "attachment",
            })),
          }
        : {}),
    });
    return { emailed: true };
  } catch (error) {
    console.error("Email failed:", error.message);
    return { emailed: false };
  }
}

export function applicationReceivedLetter({ fullName, program, applicationNumber }) {
  const subject = `We've received your application for ${program}: HassAz Tech Hub`;
  const text = [
    `Dear ${firstName(fullName)},`,
    "",
    `Thank you for applying to HassAz Tech Hub! We're glad to confirm we have received your application for the ${program}.`,
    "",
    `Application number: ${applicationNumber}`,
    "",
    "Our admissions team will review your application and get back to you soon with the outcome.",
    "",
    `If you have any questions, feel free to reach us at ${contactEmail} or ${contactPhone}.`,
    "",
    "Warm regards,",
    "HassAz Tech Hub Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${firstName(fullName)}</strong>,`,
      "Thank you for applying to HassAz Tech Hub! We're glad to confirm we have received your application for the <strong>" +
        program +
        "</strong>.",
      `<strong>Application number:</strong> ${applicationNumber}`,
      "Our admissions team will review your application and get back to you soon with the outcome.",
      `If you have any questions, feel free to reach us at <a href="mailto:${contactEmail}" style="color:#0a2e6d;">${contactEmail}</a> or ${contactPhone}.`,
      "Warm regards,<br/>HassAz Tech Hub Team",
    ]),
  });

  return { subject, text, html };
}

export function applicationApprovedLetter({ fullName, email, program, appliedAt }) {
  const subject = `Congratulations, You've Been Selected for the ${program}!`;
  const text = [
    `Dear ${firstName(fullName)},`,
    "",
    "We hope this email finds you in good spirits.",
    "",
    `Congratulations on being selected for the HassAz Tech Hub ${program}! We are thrilled to have you join us.`,
    "",
    "Account Details:",
    `Full Name: ${fullName}`,
    `Email: ${email}`,
    `Date applied: ${formatDate(appliedAt)}`,
    "",
    `Our admissions team will be in touch shortly with the next steps to complete your enrollment. If you have any questions or need further assistance, please do not hesitate to contact us at ${contactEmail} or ${contactPhone}.`,
    "",
    "We are excited to have you on board and look forward to your participation!",
    "",
    "Warm regards,",
    "HassAz Tech Hub Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${firstName(fullName)}</strong>,`,
      "We hope this email finds you in good spirits.",
      `Congratulations on being selected for the HassAz Tech Hub <strong>${program}</strong>! We are thrilled to have you join us.`,
      `<strong>Account Details:</strong><br/>Full Name: ${fullName}<br/>Email: ${email}<br/>Date applied: ${formatDate(appliedAt)}`,
      `Our admissions team will be in touch shortly with the next steps to complete your enrollment. If you have any questions or need further assistance, please do not hesitate to contact us at <a href="mailto:${contactEmail}" style="color:#0a2e6d;">${contactEmail}</a> or ${contactPhone}.`,
      "We are excited to have you on board and look forward to your participation!",
      "Warm regards,<br/>HassAz Tech Hub Team",
    ]),
  });

  return { subject, text, html };
}

export function applicationRejectedLetter({ fullName, program }) {
  const subject = `Update on your HassAz Tech Hub application: ${program}`;
  const text = [
    `Dear ${firstName(fullName)},`,
    "",
    `Thank you for applying for the ${program} at HassAz Tech Hub and for taking the time to share your goals with us.`,
    "",
    "After careful review, we regret to inform you that we are unable to offer you a place in this intake. This decision does not reflect your potential, and we encourage you to apply again in a future intake.",
    "",
    `If you have any questions, please reach out to us at ${contactEmail} or ${contactPhone}.`,
    "",
    "Warm regards,",
    "HassAz Tech Hub Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${firstName(fullName)}</strong>,`,
      `Thank you for applying for the <strong>${program}</strong> at HassAz Tech Hub and for taking the time to share your goals with us.`,
      "After careful review, we regret to inform you that we are unable to offer you a place in this intake. This decision does not reflect your potential, and we encourage you to apply again in a future intake.",
      `If you have any questions, please reach out to us at <a href="mailto:${contactEmail}" style="color:#0a2e6d;">${contactEmail}</a> or ${contactPhone}.`,
      "Warm regards,<br/>HassAz Tech Hub Team",
    ]),
  });

  return { subject, text, html };
}

export async function sendApplicationReceivedEmail({ to, fullName, program, applicationNumber }) {
  const letter = applicationReceivedLetter({ fullName, program, applicationNumber });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed, letter };
}

export async function sendApplicationApprovedEmail({ to, fullName, program, appliedAt }) {
  const letter = applicationApprovedLetter({ fullName, email: to, program, appliedAt });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed, letter };
}

export async function sendApplicationRejectedEmail({ to, fullName, program }) {
  const letter = applicationRejectedLetter({ fullName, program });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed, letter };
}

function formatBookingDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function addDaysToBookingDate(dateStr, days) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export function bookingConfirmedLetter({ name, date, time, timezone }) {
  const formattedDate = formatBookingDate(date);
  const nextWeekDate = addDaysToBookingDate(date, 7);
  const subject = "Your call with HassAz Tech Hub is booked";
  const text = [
    `Dear ${firstName(name)},`,
    "",
    `This confirms your call with HassAz Tech Hub is booked for ${formattedDate} at ${time} (${timezone || "Africa/Nairobi"}).`,
    "",
    `Please make sure you are available at this exact day and time. This is a recurring weekly slot, so kindly also keep ${nextWeekDate} at ${time} free for the following session.`,
    "",
    `If you need to reschedule, contact us at ${contactEmail} or ${contactPhone}.`,
    "",
    "Warm regards,",
    "HassAz Tech Hub Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${firstName(name)}</strong>,`,
      `This confirms your call with HassAz Tech Hub is booked for <strong>${formattedDate} at ${time} (${
        timezone || "Africa/Nairobi"
      })</strong>.`,
      `Please make sure you are available at this exact day and time. This is a recurring weekly slot, so kindly also keep <strong>${nextWeekDate} at ${time}</strong> free for the following session.`,
      `If you need to reschedule, contact us at <a href="mailto:${contactEmail}" style="color:#0a2e6d;">${contactEmail}</a> or ${contactPhone}.`,
      "Warm regards,<br/>HassAz Tech Hub Team",
    ]),
  });

  return { subject, text, html, formattedDate, nextWeekDate };
}

export async function sendBookingConfirmationEmail({ to, name, date, time, timezone }) {
  const letter = bookingConfirmedLetter({ name, date, time, timezone });
  const outcome = await sendMail({ to, subject: letter.subject, text: letter.text, html: letter.html });
  return { emailed: outcome.emailed, letter };
}

export function bookingApprovedLetter({ name, date, time, timezone }) {
  const formattedDate = formatBookingDate(date);
  const subject = "Your call with HassAz Tech Hub is approved!";
  const text = [
    `Dear ${firstName(name)},`,
    "",
    `Congratulations! Your call with HassAz Tech Hub on ${formattedDate} at ${time} (${
      timezone || "Africa/Nairobi"
    }) has been approved and confirmed.`,
    "",
    "We look forward to speaking with you. Please be online and ready a few minutes before the scheduled time.",
    "",
    `If you have any questions, contact us at ${contactEmail} or ${contactPhone}.`,
    "",
    "Warm regards,",
    "HassAz Tech Hub Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${firstName(name)}</strong>,`,
      `Congratulations! Your call with HassAz Tech Hub on <strong>${formattedDate} at ${time} (${
        timezone || "Africa/Nairobi"
      })</strong> has been approved and confirmed.`,
      "We look forward to speaking with you. Please be online and ready a few minutes before the scheduled time.",
      `If you have any questions, contact us at <a href="mailto:${contactEmail}" style="color:#0a2e6d;">${contactEmail}</a> or ${contactPhone}.`,
      "Warm regards,<br/>HassAz Tech Hub Team",
    ]),
  });

  return { subject, text, html };
}

export function bookingRejectedLetter({ name, date, time, timezone }) {
  const formattedDate = formatBookingDate(date);
  const subject = "Update on your HassAz Tech Hub call booking";
  const text = [
    `Dear ${firstName(name)},`,
    "",
    `We're sorry, we're unable to confirm your call booked for ${formattedDate} at ${time} (${
      timezone || "Africa/Nairobi"
    }) at this time.`,
    "",
    "Please book another time that works for you, and our team will be happy to speak with you then.",
    "",
    `If you have any questions, contact us at ${contactEmail} or ${contactPhone}.`,
    "",
    "Warm regards,",
    "HassAz Tech Hub Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${firstName(name)}</strong>,`,
      `We're sorry, we're unable to confirm your call booked for <strong>${formattedDate} at ${time} (${
        timezone || "Africa/Nairobi"
      })</strong> at this time.`,
      "Please book another time that works for you, and our team will be happy to speak with you then.",
      `If you have any questions, contact us at <a href="mailto:${contactEmail}" style="color:#0a2e6d;">${contactEmail}</a> or ${contactPhone}.`,
      "Warm regards,<br/>HassAz Tech Hub Team",
    ]),
  });

  return { subject, text, html };
}

export async function sendBookingApprovedEmail({ to, name, date, time, timezone }) {
  const letter = bookingApprovedLetter({ name, date, time, timezone });
  const outcome = await sendMail({ to, subject: letter.subject, text: letter.text, html: letter.html });
  return { emailed: outcome.emailed, letter };
}

export async function sendBookingRejectedEmail({ to, name, date, time, timezone }) {
  const letter = bookingRejectedLetter({ name, date, time, timezone });
  const outcome = await sendMail({ to, subject: letter.subject, text: letter.text, html: letter.html });
  return { emailed: outcome.emailed, letter };
}

export async function sendVerificationResultEmail({ to, verified, fullName, program }) {
  const letter = verified ? verifiedResultLetter() : notVerifiedResultLetter();
  const outcome = await sendMail({
    to,
    subject: letter.subject,
    text: letter.text,
    html: letter.html,
  });
  saveCopy({ to, ...letter, fullName, program, verified });
  return { emailed: outcome.emailed, letter };
}

function brandedLetter({ subject, greeting, lines }) {
  const text = [`Dear ${greeting},`, "", ...lines, "", "Warm regards,", "HassAz Tech Hub Team"].join("\n");
  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${greeting}</strong>,`,
      ...lines,
      "Warm regards,<br/>HassAz Tech Hub Team",
    ]),
  });
  return { subject, text, html };
}

export async function sendWelcomeEmail({ to, fullName }) {
  const letter = brandedLetter({
    subject: "Welcome to HassAz Tech Hub",
    greeting: firstName(fullName),
    lines: [
      "Your HassAz Tech Hub account has been created successfully.",
      "You can now log in, browse courses, and register when an intake is open.",
      `If you need help, write to ${contactEmail} or call ${contactPhone}.`,
    ],
  });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed };
}

export async function sendDuplicateApplicationEmail({ to, fullName, applicationNumber, status }) {
  const letter = brandedLetter({
    subject: "Application already exists: HassAz Tech Hub",
    greeting: firstName(fullName) || "Student",
    lines: [
      "We found a previous HassAz Tech Hub application linked to this email address or phone number.",
      applicationNumber ? `Your existing application number is ${applicationNumber}.` : "Your previous application is still on file.",
      status ? `Current status: ${status}.` : "",
      "A new application was not created.",
      "Kindly wait for a response regarding your previous application. Our admissions team will contact you.",
      `For assistance, contact the Academic Director at ${contactEmail} or ${contactPhone}.`,
    ].filter(Boolean),
  });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed };
}

export async function sendPasswordResetEmail({ to, fullName, resetUrl }) {
  const letter = brandedLetter({
    subject: "Reset your HassAz Tech Hub password",
    greeting: firstName(fullName) || "Student",
    lines: [
      "We received a request to reset the password for this HassAz Tech Hub account.",
      `Open this link to choose a new password (it expires in 1 hour): ${resetUrl}`,
      "If you did not ask for this, you can ignore this email. Your current password will stay the same.",
    ],
  });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed };
}

export async function sendPasswordChangedEmail({ to, fullName }) {
  const letter = brandedLetter({
    subject: "Your HassAz Tech Hub password was updated",
    greeting: firstName(fullName) || "Student",
    lines: [
      "Your password has been updated successfully.",
      "If you did not make this change, contact us immediately so we can secure your account.",
      `Support: ${contactEmail} · ${contactPhone}`,
    ],
  });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed };
}

export async function sendEnrollmentEmail({ to, fullName, programTitle }) {
  const letter = brandedLetter({
    subject: `You are registered for ${programTitle}: HassAz Tech Hub`,
    greeting: firstName(fullName),
    lines: [
      `You have successfully registered for ${programTitle}.`,
      "A confirmation is on file with HassAz Tech Hub. Our team will share the next steps for this course.",
      `Questions? ${contactEmail} · ${contactPhone}`,
    ],
  });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed };
}

export async function sendContactAcknowledgementEmail({ to, fullName, subject }) {
  const letter = brandedLetter({
    subject: "We received your message: HassAz Tech Hub",
    greeting: firstName(fullName) || "there",
    lines: [
      "Thank you for contacting HassAz Tech Hub. We have received your message and will reply as soon as we can.",
      subject ? `Subject: ${subject}` : "",
      `You can also reach us at ${contactEmail} or ${contactPhone}.`,
    ].filter(Boolean),
  });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed };
}

export async function sendContactDecisionEmail({ to, fullName, subject, approved }) {
  const letter = brandedLetter({
    subject: approved
      ? "Your message has been approved: HassAz Tech Hub"
      : "Update on your HassAz Tech Hub enquiry",
    greeting: firstName(fullName) || "there",
    lines: approved
      ? [
          "Thank you for contacting HassAz Tech Hub. Your message has been reviewed and approved.",
          subject ? `Subject: ${subject}` : "",
          "Our team will follow up with you shortly.",
          `If you need anything else, write to ${contactEmail} or call ${contactPhone}.`,
        ].filter(Boolean)
      : [
          "Thank you for contacting HassAz Tech Hub. We have reviewed your message.",
          subject ? `Subject: ${subject}` : "",
          "After review, we are unable to proceed with this enquiry at this time.",
          `If you have questions, contact us at ${contactEmail} or ${contactPhone}.`,
        ].filter(Boolean),
  });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed };
}

export async function sendBroadcastEmail({ to, fullName, subject, message, flyer, programTitle, kind }) {
  const name = String(fullName || "").trim() || "Student";
  const first = firstName(name) === "there" ? "Student" : firstName(name);
  const fill = (value) =>
    String(value || "")
      .replace(/\{\{\s*fullName\s*\}\}/gi, name)
      .replace(/\{\{\s*firstName\s*\}\}/gi, first);
  const safeSubject = fill(subject).trim() || "Message from HassAz Tech Hub";
  const safeText = fill(message).trim();
  const alreadyGreeted = /^\s*dear\s/i.test(safeText);
  const greetingLine = alreadyGreeted ? "" : `Dear ${name},`;
  const courseLine = programTitle ? `This update is for students registered on ${programTitle}.` : "";
  const kindMeta = broadcastKind(kind);
  const text = [kindMeta.label, greetingLine, safeText, courseLine, "Warm regards,", "HassAz Tech Hub Academic Team"]
    .filter(Boolean)
    .join("\n\n");
  const flyerHtml = flyer?.cid
    ? `<img src="cid:${flyer.cid}" alt="" width="520" style="display:block; margin:18px auto 8px; max-width:100%; height:auto; border-radius:12px; border:0;" />`
    : "";
  const html = wrapHtml({
    bodyHtml: [
      `<p style="margin:0 0 16px;"><span style="display:inline-block; background:${kindMeta.color}; color:#ffffff; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; font-weight:700; padding:6px 10px; border-radius:999px;">${escapeHtml(
        kindMeta.label
      )}</span></p>`,
      greetingLine
        ? `<p style="margin:0 0 16px; color:#0a2e6d; font-size:16px; line-height:1.6;">Dear <strong>${escapeHtml(
            name
          )}</strong>,</p>`
        : "",
      formatAnnouncementHtml(safeText),
      flyerHtml,
      programTitle
        ? `<p style="margin:18px 0 12px; color:#6b7280; font-size:12px; line-height:1.6;">Sent to students registered for <strong>${escapeHtml(
            programTitle
          )}</strong>.</p>`
        : "",
      paragraphs(["Warm regards,<br/><strong>HassAz Tech Hub Academic Team</strong>"]),
    ].join(""),
  });
  return sendMail({
    to,
    subject: `${safeSubject}: HassAz Tech Hub`,
    text,
    html,
    attachments: flyer?.content ? [flyer] : undefined,
  });
}

function broadcastKind(kind) {
  const key = String(kind || "announcement").toLowerCase();
  if (key === "class") return { label: "Class update", color: "#0a2e6d" };
  if (key === "event") return { label: "Event", color: "#b8962e" };
  if (key === "reminder") return { label: "Reminder", color: "#0a2e6d" };
  if (key === "general") return { label: "Message", color: "#0a2e6d" };
  return { label: "Announcement", color: "#0a2e6d" };
}

function formatAnnouncementHtml(text) {
  const escaped = escapeHtml(text).replace(/\r\n/g, "\n").trim();
  if (!escaped) return "";
  return escaped
    .split(/\n{2,}/)
    .map((block) => {
      const html = block.replace(/\n/g, "<br/>");
      const single = !block.includes("\n");
      const heading =
        single &&
        (block.endsWith("!") ||
          block.endsWith(":") ||
          /^(📢|🕒|📌|📅|⚠️)/.test(block) ||
          (block.length > 0 && block.length < 88 && /^[A-Z0-9].*[a-zA-Z]/.test(block) && !block.includes(".")));
      if (heading) {
        return `<p style="margin:0 0 14px; color:#0a2e6d; font-size:16px; line-height:1.6; font-weight:700;">${html}</p>`;
      }
      return `<p style="margin:0 0 14px; color:#1f2937; font-size:14px; line-height:1.75;">${html}</p>`;
    })
    .join("");
}
