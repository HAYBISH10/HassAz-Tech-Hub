import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/verification-emails.json");
const fromAddress = process.env.SMTP_USER || "hiacditechhub@gmail.com";
const contactEmail = "hiacditechhub@gmail.com";
const contactPhone = "0741 808 582";
const DEFAULT_EMAIL_LOGO_URL = "https://hiacdi.org/brand/logo-email.png?v=4";
const emailLogoPath = join(dirname(fileURLToPath(import.meta.url)), "../assets/logo-email.png");
const EMAIL_LOGO_CID = "hiacdilogo";
let cachedLogoContent = null;

// The logo is embedded as an inline CID attachment so it always displays in the
// recipient's mail client, even before the site is publicly hosted.
function emailLogoContent() {
  if (cachedLogoContent) return cachedLogoContent;
  if (!existsSync(emailLogoPath)) return null;
  cachedLogoContent = readFileSync(emailLogoPath);
  return cachedLogoContent;
}

function hostedLogoUrl() {
  const explicit = String(process.env.EMAIL_LOGO_URL || "").trim();
  if (explicit) return explicit;
  const backend = String(process.env.BACKEND_URL || "").replace(/\/$/, "");
  if (/^https:\/\//i.test(backend)) return `${backend}/api/public/email-logo.png`;
  const site = String(process.env.FRONTEND_URL || "").replace(/\/$/, "");
  if (/^https:\/\//i.test(site)) return `${site}/brand/logo-email.png?v=4`;
  return DEFAULT_EMAIL_LOGO_URL;
}

// A hosted logo URL is always preferred when configured: the email then has no
// attachment part at all, so no mail client can show an attachment chip below the
// message. The CID-embedded copy is only a fallback for local development before
// any public URL exists.
function useEmbeddedLogo() {
  if (String(process.env.EMAIL_LOGO_URL || "").trim()) return false;
  if (/^https:\/\//i.test(String(process.env.BACKEND_URL || ""))) return false;
  if (/^https:\/\//i.test(String(process.env.FRONTEND_URL || ""))) return false;
  return Boolean(emailLogoContent());
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
  const logoSrc = useEmbeddedLogo() ? `cid:${EMAIL_LOGO_CID}` : hostedLogoUrl();
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
          HIACDI <span style="color:#d4af37;">TECH</span> HUB
        </p>
      </div>
      <div style="padding:28px 24px;">
        ${bodyHtml}
      </div>
      <div style="border-top:1px solid #eef0f3; padding:16px 24px; text-align:center; font-size:12px; color:#6b7280;">
        © Copyright ${year} by HIACDI Tech Hub. All rights reserved.
      </div>
    </div>
  </body>
</html>`;
}

export function verifiedResultLetter({ fullName, holderName, program, certificateId }) {
  const subject = "Certificate Verified: HIACDI Tech Hub";
  const text = [
    `Dear ${fullName},`,
    "",
    `This is to confirm the authenticity and validity of the certificate issued by HIACDI Tech Hub. The certificate presented was awarded to ${holderName} upon successful completion of ${program}.`,
    "",
    `We are committed to maintaining the integrity and credibility of our certificates. We are pleased to confirm that the certificate with verification number ${certificateId} is genuine and valid according to our official records.`,
    "",
    "This verification confirms that the certificate was officially issued by HIACDI Tech Hub and belongs to the individual named above.",
    "",
    "If you require any further information or clarification regarding this certificate, please contact us at hiacditechhub@gmail.com. We will be happy to assist you.",
    "",
    "Thank you for taking the time to verify this certificate.",
    "",
    "Best regards,",
    "HIACDI Tech Hub",
    "Humanity, Inclusion & Advancement Community Development Initiative",
    "https://hiacdi.org",
    "hiacditechhub@gmail.com",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: [
      `<p style="margin:0 0 18px; font-size:18px; font-weight:700; color:#166534;">Certificate Verified Successfully ✅</p>`,
      paragraphs([
        `Dear <strong>${fullName}</strong>,`,
        `This is to confirm the authenticity and validity of the certificate issued by <strong>HIACDI Tech Hub</strong>. The certificate presented was awarded to <strong>${holderName}</strong> upon successful completion of <strong>${program}</strong>.`,
        `We are committed to maintaining the integrity and credibility of our certificates. We are pleased to confirm that the certificate with verification number <strong>${certificateId}</strong> is <strong>genuine and valid</strong> according to our official records.`,
        "This verification confirms that the certificate was officially issued by <strong>HIACDI Tech Hub</strong> and belongs to the individual named above.",
        "If you require any further information or clarification regarding this certificate, please contact us at <strong>hiacditechhub@gmail.com</strong>. We will be happy to assist you.",
        "Thank you for taking the time to verify this certificate.",
        "Best regards,<br/><strong>HIACDI Tech Hub</strong><br/>Humanity, Inclusion &amp; Advancement Community Development Initiative<br/>https://hiacdi.org<br/>hiacditechhub@gmail.com",
      ]),
    ].join(""),
  });

  return { subject, text, html };
}

export function notVerifiedResultLetter({ fullName }) {
  const subject = "Certificate Not Verified: HIACDI Tech Hub";
  const text = [
    "Certificate Not Verified",
    "",
    `Dear ${fullName},`,
    "",
    "We regret to inform you that the certificate details provided could not be verified against our official records.",
    "",
    "The certificate number or information submitted does not match any valid certificate issued by HIACDI Tech Hub.",
    "",
    "Please check the certificate number and other details entered and try again. If you believe this certificate is genuine, kindly contact us at hiacditechhub@gmail.com for further assistance.",
    "",
    "Thank you for using our certificate verification service.",
    "",
    "Best regards,",
    "HIACDI Tech Hub",
    "Humanity, Inclusion & Advancement Community Development Initiative",
    "https://hiacdi.org",
    "hiacditechhub@gmail.com",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: [
      `<p style="margin:0 0 18px; font-size:18px; font-weight:700; color:#b91c1c;">Certificate Not Verified ❌</p>`,
      paragraphs([
        `Dear <strong>${fullName}</strong>,`,
        "We regret to inform you that the certificate details provided <strong>could not be verified</strong> against our official records.",
        "The certificate number or information submitted does not match any valid certificate issued by <strong>HIACDI Tech Hub</strong>.",
        "Please check the certificate number and other details entered and try again. If you believe this certificate is genuine, kindly contact us at <strong>hiacditechhub@gmail.com</strong> for further assistance.",
        "<strong>Thank you for using our certificate verification service.</strong>",
        "Best regards,<br/><strong>HIACDI Tech Hub</strong><br/>Humanity, Inclusion &amp; Advancement Community Development Initiative<br/>https://hiacdi.org<br/>hiacditechhub@gmail.com",
      ]),
    ].join(""),
  });

  return { subject, text, html };
}

function saveCopy(record) {
  try {
    const dir = dirname(storePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const current = existsSync(storePath) ? JSON.parse(readFileSync(storePath, "utf8") || "[]") : [];
    current.push({ ...record, sentAt: new Date().toISOString() });
    writeFileSync(storePath, JSON.stringify(current, null, 2));
  } catch (error) {
    console.error("Could not save verification email copy:", error.message);
  }
}

export async function sendMail({ to, subject, text, html, attachments, fromName }) {
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
    const logoContent = useEmbeddedLogo() ? emailLogoContent() : null;
    const allAttachments = [
      // filename:false on purpose: a named inline part makes Gmail show an
      // attachment chip below the message even though the image is embedded.
      ...(logoContent
        ? [{ content: logoContent, contentType: "image/png", filename: false, cid: EMAIL_LOGO_CID, contentDisposition: "inline" }]
        : []),
      ...(attachments || []),
    ];
    await transporter.sendMail({
      from: `${fromName || "HIACDI Tech Hub"} <${fromAddress}>`,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
      ...(allAttachments.length
        ? {
            attachments: allAttachments.map((item) => ({
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

function bookingPageUrl() {
  const configured = String(process.env.PUBLIC_URL || process.env.FRONTEND_URL || "").replace(/\/$/, "");
  const base = configured || "https://hiacdi.org";
  return `${base}/?book=1`;
}

export function applicationReceivedLetter({ fullName, program, applicationNumber, bookUrl }) {
  const first = firstName(fullName);
  const course = program || "your selected program";
  const link = bookUrl || bookingPageUrl();
  const subject = `[HIACDI]: Next Steps in Your ${course} Application`;
  const text = [
    `Hello ${first},`,
    "",
    `Thank you for applying to the ${course} at HIACDI Tech Hub — we’re thrilled to have you take the first step toward an exciting future in technology!`,
    "",
    `Application number: ${applicationNumber}`,
    "",
    "The next stage in your application process is an online discovery call with our Admissions Team. This is an opportunity for us to learn more about your learning goals, your background, and how you fit into the program.",
    "",
    "Please go through the details below and book your discovery call:",
    "",
    "Duration: 45 minutes",
    "Platform: Online (Google Meet link provided upon booking)",
    "Time Zone: East African Time (EAT) — be sure to set your calendar to the correct time zone to avoid confusion.",
    `Book your session here: ${link}`,
    "",
    "Pro Tip: Arrive on time and find a quiet space with a stable internet connection so we can have a smooth conversation!",
    "",
    `For any questions or concerns about your admissions status, please send an email to ${contactEmail} or call / WhatsApp us at ${contactPhone}. We’re here to help!`,
    "",
    "Warmly,",
    "HIACDI Admissions Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: [
      paragraphs([
        `Hello <strong>${first}</strong>,`,
        `Thank you for applying to the <strong>${course}</strong> at HIACDI Tech Hub — we’re thrilled to have you take the first step toward an exciting future in technology!`,
        `<strong>Application number:</strong> ${applicationNumber}`,
        "The next stage in your application process is an online discovery call with our Admissions Team. This is an opportunity for us to learn more about your learning goals, your background, and how you fit into the program.",
        "Please go through the details below and book your discovery call:",
        "<strong>Duration:</strong> 45 minutes<br/><strong>Platform:</strong> Online (Google Meet link provided upon booking)<br/><strong>Time Zone:</strong> East African Time (EAT) — be sure to set your calendar to the correct time zone to avoid confusion.",
      ]),
      `<p style="margin:22px 0 18px; text-align:center;">
        <a href="${escapeHtml(link)}" style="display:inline-block; background:#0a2e6d; color:#ffffff; font-size:14px; font-weight:700; padding:13px 28px; border-radius:999px; text-decoration:none;">Book your session here</a>
      </p>`,
      `<p style="margin:0 0 14px; word-break:break-all; font-size:12px; line-height:1.6; color:#4b5563;">If the button does not open, use this link: <a href="${escapeHtml(link)}" style="color:#0a2e6d;">${escapeHtml(link)}</a></p>`,
      paragraphs([
        "Pro Tip: Arrive on time and find a quiet space with a stable internet connection so we can have a smooth conversation!",
        `For any questions or concerns about your admissions status, please send an email to <strong>${contactEmail}</strong> or call / WhatsApp us at <strong>${contactPhone}</strong>. We’re here to help!`,
        "Warmly,<br/>HIACDI Admissions Team",
      ]),
    ].join(""),
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
    `Congratulations on being selected for the HIACDI Tech Hub ${program}! We are thrilled to have you join us.`,
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
    "HIACDI Tech Hub Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${firstName(fullName)}</strong>,`,
      "We hope this email finds you in good spirits.",
      `Congratulations on being selected for the HIACDI Tech Hub <strong>${program}</strong>! We are thrilled to have you join us.`,
      `<strong>Account Details:</strong><br/>Full Name: ${fullName}<br/>Email: ${email}<br/>Date applied: ${formatDate(appliedAt)}`,
      `Our admissions team will be in touch shortly with the next steps to complete your enrollment. If you have any questions or need further assistance, please do not hesitate to contact us at <a href="mailto:${contactEmail}" style="color:#0a2e6d;">${contactEmail}</a> or ${contactPhone}.`,
      "We are excited to have you on board and look forward to your participation!",
      "Warm regards,<br/>HIACDI Tech Hub Team",
    ]),
  });

  return { subject, text, html };
}

export function applicationRejectedLetter({ fullName, program }) {
  const subject = `Update on your HIACDI Tech Hub application: ${program}`;
  const text = [
    `Dear ${firstName(fullName)},`,
    "",
    `Thank you for applying for the ${program} at HIACDI Tech Hub and for taking the time to share your goals with us.`,
    "",
    "After careful review, we regret to inform you that we are unable to offer you a place in this intake. This decision does not reflect your potential, and we encourage you to apply again in a future intake.",
    "",
    `If you have any questions, please reach out to us at ${contactEmail} or ${contactPhone}.`,
    "",
    "Warm regards,",
    "HIACDI Tech Hub Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${firstName(fullName)}</strong>,`,
      `Thank you for applying for the <strong>${program}</strong> at HIACDI Tech Hub and for taking the time to share your goals with us.`,
      "After careful review, we regret to inform you that we are unable to offer you a place in this intake. This decision does not reflect your potential, and we encourage you to apply again in a future intake.",
      `If you have any questions, please reach out to us at <a href="mailto:${contactEmail}" style="color:#0a2e6d;">${contactEmail}</a> or ${contactPhone}.`,
      "Warm regards,<br/>HIACDI Tech Hub Team",
    ]),
  });

  return { subject, text, html };
}

export async function sendApplicationReceivedEmail({ to, fullName, program, applicationNumber, bookUrl }) {
  const letter = applicationReceivedLetter({ fullName, program, applicationNumber, bookUrl });
  const outcome = await sendMail({ to, fromName: "HIACDI Admissions", ...letter });
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
  const subject = "Your call with HIACDI Tech Hub is booked";
  const text = [
    `Dear ${firstName(name)},`,
    "",
    `This confirms your call with HIACDI Tech Hub is booked for ${formattedDate} at ${time} (${timezone || "Africa/Nairobi"}).`,
    "",
    `Please make sure you are available at this exact day and time. This is a recurring weekly slot, so kindly also keep ${nextWeekDate} at ${time} free for the following session.`,
    "",
    `If you need to reschedule, contact us at ${contactEmail} or ${contactPhone}.`,
    "",
    "Warm regards,",
    "HIACDI Tech Hub Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${firstName(name)}</strong>,`,
      `This confirms your call with HIACDI Tech Hub is booked for <strong>${formattedDate} at ${time} (${
        timezone || "Africa/Nairobi"
      })</strong>.`,
      `Please make sure you are available at this exact day and time. This is a recurring weekly slot, so kindly also keep <strong>${nextWeekDate} at ${time}</strong> free for the following session.`,
      `If you need to reschedule, contact us at <a href="mailto:${contactEmail}" style="color:#0a2e6d;">${contactEmail}</a> or ${contactPhone}.`,
      "Warm regards,<br/>HIACDI Tech Hub Team",
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
  const subject = "Your call with HIACDI Tech Hub is approved!";
  const text = [
    `Dear ${firstName(name)},`,
    "",
    `Congratulations! Your call with HIACDI Tech Hub on ${formattedDate} at ${time} (${
      timezone || "Africa/Nairobi"
    }) has been approved and confirmed.`,
    "",
    "We look forward to speaking with you. Please be online and ready a few minutes before the scheduled time.",
    "",
    `If you have any questions, contact us at ${contactEmail} or ${contactPhone}.`,
    "",
    "Warm regards,",
    "HIACDI Tech Hub Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${firstName(name)}</strong>,`,
      `Congratulations! Your call with HIACDI Tech Hub on <strong>${formattedDate} at ${time} (${
        timezone || "Africa/Nairobi"
      })</strong> has been approved and confirmed.`,
      "We look forward to speaking with you. Please be online and ready a few minutes before the scheduled time.",
      `If you have any questions, contact us at <a href="mailto:${contactEmail}" style="color:#0a2e6d;">${contactEmail}</a> or ${contactPhone}.`,
      "Warm regards,<br/>HIACDI Tech Hub Team",
    ]),
  });

  return { subject, text, html };
}

export function bookingRejectedLetter({ name, date, time, timezone }) {
  const formattedDate = formatBookingDate(date);
  const subject = "Update on your HIACDI Tech Hub call booking";
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
    "HIACDI Tech Hub Team",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${firstName(name)}</strong>,`,
      `We're sorry, we're unable to confirm your call booked for <strong>${formattedDate} at ${time} (${
        timezone || "Africa/Nairobi"
      })</strong> at this time.`,
      "Please book another time that works for you, and our team will be happy to speak with you then.",
      `If you have any questions, contact us at <a href="mailto:${contactEmail}" style="color:#0a2e6d;">${contactEmail}</a> or ${contactPhone}.`,
      "Warm regards,<br/>HIACDI Tech Hub Team",
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

export async function sendVerificationResultEmail({ to, verified, fullName, holderName, program, certificateId }) {
  const letter = verified
    ? verifiedResultLetter({ fullName, holderName, program, certificateId })
    : notVerifiedResultLetter({ fullName });
  const outcome = await sendMail({
    to,
    subject: letter.subject,
    text: letter.text,
    html: letter.html,
  });
  saveCopy({ to, ...letter, fullName, program, verified, kind: "verification-result" });
  return { emailed: outcome.emailed, letter };
}

// Verification emails are sent one at a time in the background. This keeps the
// verification response instant, avoids opening many parallel SMTP connections
// when several certificates are verified at once, and serializes the saved-copy
// file writes. Failures are logged, never thrown back to the visitor.
let verificationEmailQueue = Promise.resolve();

export function queueVerificationResultEmail(payload) {
  verificationEmailQueue = verificationEmailQueue
    .then(() => sendVerificationResultEmail(payload))
    .catch((error) => {
      console.error("Queued verification email failed:", error?.message || error);
    });
  return { emailed: true };
}

export async function sendVerificationAdminEmail({ fullName, email, certificateId, verified, program }) {
  const to = String(process.env.CONTACT_NOTIFY_EMAIL || contactEmail).trim();
  if (!to) return { emailed: false };
  const outcomeLabel = verified ? "VERIFIED" : "NOT VERIFIED";
  const when = new Date().toLocaleString();
  const subject = `Certificate verification: ${outcomeLabel} - ${fullName || email}`;
  const text = [
    "A certificate verification was just submitted on the website.",
    "",
    `Outcome: ${outcomeLabel}`,
    `Name entered: ${fullName || "-"}`,
    `Email entered: ${email || "-"}`,
    certificateId ? `Certificate ID entered: ${certificateId}` : "",
    verified && program ? `Matched program: ${program}` : "",
    `Time: ${when}`,
  ]
    .filter(Boolean)
    .join("\n");
  const html = wrapHtml({
    bodyHtml: paragraphs([
      "A certificate verification was just submitted on the website.",
      `<strong>Outcome:</strong> ${outcomeLabel}`,
      `<strong>Name entered:</strong> ${fullName || "-"}`,
      `<strong>Email entered:</strong> ${email || "-"}`,
      ...(certificateId ? [`<strong>Certificate ID entered:</strong> ${certificateId}`] : []),
      ...(verified && program ? [`<strong>Matched program:</strong> ${program}`] : []),
      `<strong>Time:</strong> ${when}`,
    ]),
  });
  const result = await sendMail({ to, subject, text, html });
  return { emailed: result.emailed };
}

export function verificationLinkLetter({ fullName, verifyUrl }) {
  const subject = "Verify your certificate: HIACDI Tech Hub";
  const text = [
    `Dear ${firstName(fullName)},`,
    "",
    "We received a request to verify a HIACDI Tech Hub certificate using this email address.",
    "",
    "To view the verification result, open this secure link (it expires in 24 hours):",
    verifyUrl,
    "",
    "If you did not request this, you can safely ignore this email.",
    "",
    "Kind regards,",
    "HIACDI Tech Hub",
    "Humanity, Inclusion & Advancement Community Development Initiative",
  ].join("\n");

  const html = wrapHtml({
    bodyHtml: [
      paragraphs([
        `Dear <strong>${firstName(fullName)}</strong>,`,
        "We received a request to verify a <strong>HIACDI Tech Hub</strong> certificate using this email address.",
        "To view the verification result, open the secure link below. It expires in <strong>24 hours</strong>.",
      ]),
      `<p style="margin:22px 0; text-align:center;">
        <a href="${escapeHtml(verifyUrl)}" style="display:inline-block; background:#0a2e6d; color:#ffffff; font-size:14px; font-weight:700; padding:13px 28px; border-radius:999px; text-decoration:none;">View verification result</a>
      </p>`,
      paragraphs([
        "If the button does not work, copy and paste this link into your browser:",
      ]),
      `<p style="margin:0 0 14px; word-break:break-all; font-size:12px; line-height:1.6;"><a href="${escapeHtml(verifyUrl)}" style="color:#0a2e6d;">${escapeHtml(verifyUrl)}</a></p>`,
      paragraphs([
        "If you did not request this, you can safely ignore this email.",
        "Kind regards,<br/><strong>HIACDI Tech Hub</strong><br/>Humanity, Inclusion &amp; Advancement Community Development Initiative",
      ]),
    ].join(""),
  });

  return { subject, text, html };
}

export async function sendVerificationLinkEmail({ to, fullName, verifyUrl }) {
  const letter = verificationLinkLetter({ fullName, verifyUrl });
  const outcome = await sendMail({ to, ...letter });
  saveCopy({ to, ...letter, fullName, kind: "verification-link" });
  return { emailed: outcome.emailed, letter };
}

function brandedLetter({ subject, greeting, lines }) {
  const text = [`Dear ${greeting},`, "", ...lines, "", "Warm regards,", "HIACDI Tech Hub Team"].join("\n");
  const html = wrapHtml({
    bodyHtml: paragraphs([
      `Dear <strong>${greeting}</strong>,`,
      ...lines,
      "Warm regards,<br/>HIACDI Tech Hub Team",
    ]),
  });
  return { subject, text, html };
}

export async function sendWelcomeEmail({ to, fullName }) {
  const letter = brandedLetter({
    subject: "Welcome to HIACDI Tech Hub",
    greeting: firstName(fullName),
    lines: [
      "Your HIACDI Tech Hub account has been created successfully.",
      "You can now log in, browse courses, and register when an intake is open.",
      `If you need help, write to ${contactEmail} or call ${contactPhone}.`,
    ],
  });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed };
}

export async function sendDuplicateApplicationEmail({ to, fullName, applicationNumber, status }) {
  const letter = brandedLetter({
    subject: "Application already exists: HIACDI Tech Hub",
    greeting: firstName(fullName) || "Student",
    lines: [
      "We found a previous HIACDI Tech Hub application linked to this email address or phone number.",
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
    subject: "Reset your HIACDI Tech Hub password",
    greeting: firstName(fullName) || "Student",
    lines: [
      "We received a request to reset the password for this HIACDI Tech Hub account.",
      `Open this link to choose a new password (it expires in 1 hour): ${resetUrl}`,
      "If you did not ask for this, you can ignore this email. Your current password will stay the same.",
    ],
  });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed };
}

export async function sendPasswordChangedEmail({ to, fullName }) {
  const letter = brandedLetter({
    subject: "Your HIACDI Tech Hub password was updated",
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
    subject: `You are registered for ${programTitle}: HIACDI Tech Hub`,
    greeting: firstName(fullName),
    lines: [
      `You have successfully registered for ${programTitle}.`,
      "A confirmation is on file with HIACDI Tech Hub. Our team will share the next steps for this course.",
      `Questions? ${contactEmail} · ${contactPhone}`,
    ],
  });
  const outcome = await sendMail({ to, ...letter });
  return { emailed: outcome.emailed };
}

export async function sendContactAcknowledgementEmail({ to, fullName, subject }) {
  const letter = brandedLetter({
    subject: "We received your message: HIACDI Tech Hub",
    greeting: firstName(fullName) || "there",
    lines: [
      "Thank you for contacting HIACDI Tech Hub. We have received your message and will reply as soon as we can.",
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
      ? "Your message has been approved: HIACDI Tech Hub"
      : "Update on your HIACDI Tech Hub enquiry",
    greeting: firstName(fullName) || "there",
    lines: approved
      ? [
          "Thank you for contacting HIACDI Tech Hub. Your message has been reviewed and approved.",
          subject ? `Subject: ${subject}` : "",
          "Our team will follow up with you shortly.",
          `If you need anything else, write to ${contactEmail} or call ${contactPhone}.`,
        ].filter(Boolean)
      : [
          "Thank you for contacting HIACDI Tech Hub. We have reviewed your message.",
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
  const safeSubject = fill(subject).trim() || "Message from HIACDI Tech Hub";
  const safeText = fill(message).trim();
  const alreadyGreeted = /^\s*dear\s/i.test(safeText);
  const greetingLine = alreadyGreeted ? "" : `Dear ${name},`;
  const courseLine = programTitle ? `This update is for students registered on ${programTitle}.` : "";
  const kindMeta = broadcastKind(kind);
  const text = [kindMeta.label, greetingLine, safeText, courseLine, "Warm regards,", "HIACDI Tech Hub Academic Team"]
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
      paragraphs(["Warm regards,<br/><strong>HIACDI Tech Hub Academic Team</strong>"]),
    ].join(""),
  });
  return sendMail({
    to,
    subject: `${safeSubject}: HIACDI Tech Hub`,
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
