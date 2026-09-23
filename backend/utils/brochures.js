import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import { installmentOptions } from "./intakes.js";

const root = dirname(fileURLToPath(import.meta.url));
const logoCandidates = [
  join(root, "../../Frontend/public/brand/logo-mark.png"),
  join(root, "../../Frontend/public/brand/logo-icon.png"),
];

const NAVY = "#0a2e6d";
const GOLD = "#d4af37";
const MUTED = "#4b5563";
const INK = "#1f2937";

function logoPath() {
  return logoCandidates.find((item) => existsSync(item)) || null;
}

function drawHeader(doc, subtitle) {
  const logo = logoPath();
  if (logo) {
    try {
      doc.image(logo, 50, 36, { height: 42 });
    } catch {
      // continue without logo if the file cannot be embedded
    }
  }
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14).text("HassAz TECH HUB", logo ? 100 : 50, 42, { width: 400 });
  doc.fillColor(GOLD).font("Helvetica").fontSize(9).text("Learn. Build. Innovate.", logo ? 100 : 50, 60, { width: 400 });
  if (subtitle) {
    doc.fillColor(MUTED).fontSize(9).text(subtitle, 50, 78, { width: 500 });
  }
  doc.moveTo(50, 96).lineTo(545, 96).strokeColor(GOLD).lineWidth(1).stroke();
}

function drawFooter(doc) {
  const y = 780;
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#e5e7eb").lineWidth(0.6).stroke();
  doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(
    "HassAz Tech Hub  ·  Kenya  ·  hassaztechhub@gmail.com  ·  WhatsApp 0741808582",
    50,
    y + 8,
    { width: 500, align: "center" }
  );
}

function ensureSpace(doc, needed = 80) {
  if (doc.y > 720 - needed) {
    doc.addPage();
    drawHeader(doc);
    drawFooter(doc);
    doc.y = 112;
  }
}

function sectionTitle(doc, text) {
  ensureSpace(doc, 40);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text(text, 50, doc.y + 8, { width: 500 });
  doc.moveDown(0.4);
}

function body(doc, text) {
  doc.fillColor(INK).font("Helvetica").fontSize(10).text(text, 50, doc.y, { width: 500, lineGap: 2 });
  doc.moveDown(0.4);
}

function kvRow(doc, label, value) {
  if (!value) return;
  ensureSpace(doc, 22);
  const y = doc.y;
  doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(label, 50, y, { width: 150 });
  const afterLabel = doc.y;
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(value, 210, y, { width: 330 });
  doc.y = Math.max(doc.y, afterLabel) + 6;
}

function bullets(doc, items) {
  for (const item of items || []) {
    ensureSpace(doc, 24);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10).text("•", 50, doc.y, { continued: true });
    doc.fillColor(INK).font("Helvetica").text(`  ${item}`, { width: 480 });
  }
  doc.moveDown(0.3);
}

export function streamBrochurePdf({ program, categoryTitle, offer, year }, res) {
  const filename = `${program.slug || "course"}-hassaz-brochure.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);
  drawHeader(doc, "Course brochure");
  drawFooter(doc);
  doc.y = 112;

  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(11).text((categoryTitle || "Course").toUpperCase(), 50, doc.y);
  doc.moveDown(0.2);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(22).text(program.title || offer.label, { width: 500 });
  doc.moveDown(0.3);
  body(doc, program.intro || program.summary || "Practical, mentor-led training at HassAz Tech Hub.");

  if (program.careers?.length) {
    sectionTitle(doc, "Career paths");
    body(doc, program.careers.join(", "));
  }

  sectionTitle(doc, year ? `${year} intake` : "This intake");
  kvRow(doc, "Learning mode", offer.label);
  kvRow(doc, "Start date", offer.startDate);
  kvRow(doc, "Course duration", offer.duration);
  kvRow(doc, "Mode of learning", offer.schedule);
  kvRow(doc, "Tuition fee", offer.fee);
  kvRow(doc, "Monthly installment", offer.monthlyFee ? `${offer.monthlyFee} per month` : "");
  doc.moveDown(0.4);

  for (const detail of program.details || []) {
    sectionTitle(doc, detail.title);
    body(doc, detail.body);
  }

  if (program.curriculum?.length) {
    sectionTitle(doc, "Curriculum overview");
    for (const block of program.curriculum) {
      ensureSpace(doc, 36);
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11).text(block.title, 50, doc.y, { width: 500 });
      doc.moveDown(0.2);
      bullets(doc, block.items || []);
    }
  }

  sectionTitle(doc, "Why HassAz Tech Hub");
  bullets(doc, [
    "Live mentoring and instructor-led classes",
    "Project-based labs you can put in a portfolio",
    "Full-time, part-time, remote, and in-person options depending on the programme",
    "Admissions support via email and WhatsApp",
  ]);

  sectionTitle(doc, "How to apply");
  body(
    doc,
    "Open Apply on the HassAz Tech Hub website, choose this programme and learning mode, and complete the application. For questions write to hassaztechhub@gmail.com or use Chat with us on Contact Us."
  );

  doc.end();
}

export function streamInstallmentsPdf({ program, offer }, res) {
  const filename = `${program.slug || "course"}-hassaz-tuition-plan.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);
  drawHeader(doc, "Tuition financing guide");
  drawFooter(doc);
  doc.y = 112;

  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(18).text("Tuition Payment Options", { width: 500 });
  doc.moveDown(0.3);
  body(
    doc,
    "This guide shows how to pay HassAz Tech Hub tuition in full or in monthly installments. Amounts follow the total fee and monthly installment set for this intake."
  );

  sectionTitle(doc, "Key information");
  kvRow(doc, "Programme", `${program.title}: ${offer.label}`);
  kvRow(doc, "Class start date", offer.startDate || "Set at admissions");
  kvRow(doc, "Total tuition", offer.fee || "Confirmed during admissions");
  kvRow(doc, "Monthly installment", offer.monthlyFee ? `${offer.monthlyFee} per month` : "Ksh 3,500 per month");

  for (const plan of installmentOptions(offer)) {
    sectionTitle(doc, plan.name);
    if (plan.total) body(doc, `Total payable: ${plan.total}`);
    if (plan.note) body(doc, plan.note);
    for (const row of plan.rows || []) {
      ensureSpace(doc, 16);
      doc.fillColor(INK).font("Helvetica").fontSize(10).text(`${row.payment}  ·  ${row.due}  ·  ${row.amount}`, 50, doc.y, {
        width: 500,
      });
    }
  }

  sectionTitle(doc, "Payment terms");
  bullets(doc, [
    "Your place is confirmed when HassAz receives the full tuition or the first monthly installment.",
    "Pay on or before each due date. Late payment may pause access to class materials until the balance is cleared.",
    "Tuition terms for the active intake are confirmed in writing by admissions.",
    "Pay via the instructions sent after your application is accepted, or ask hassaztechhub@gmail.com / WhatsApp 0741808582.",
  ]);

  doc.end();
}
