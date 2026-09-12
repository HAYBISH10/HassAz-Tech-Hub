import { catalog } from "../data/catalog.js";

export function flattenApplication(app) {
  const row = {
    "Application Number": app.applicationNumber || "",
    Status: app.status || "",
    State: app.state || "Open",
    "Submitted At": app.submittedAt ? new Date(app.submittedAt).toLocaleString() : "",
  };

  const sections = [
    ["Personal", app.personalInformation],
    ["Contact", app.contactInformation],
    ["Guardian", app.guardianInformation],
    ["Education", app.education],
    ["Program", app.program],
    ["Technology", app.technologyBackground],
    ["Experience", app.experience],
    ["Goals", app.goals],
    ["Training Preferences", app.trainingPreferences],
    ["Documents", app.documents],
  ];

  for (const [label, data] of sections) {
    if (!data || typeof data !== "object") continue;
    for (const [key, value] of Object.entries(data)) {
      row[`${label} - ${key}`] = Array.isArray(value) ? value.join(", ") : value ?? "";
    }
  }

  row.Skills = Array.isArray(app.skills) ? app.skills.join(", ") : "";
  row["Heard About Us"] = app.source || "";

  return row;
}

export async function buildApplicationsWorkbook(
  applications,
  { groupByArea = true, sheetLabel = "Applications" } = {}
) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "HassAz Tech Hub";
  workbook.created = new Date();

  const groups = new Map();
  if (!groupByArea) {
    groups.set(sheetName(sheetLabel || "Applications"), applications);
  } else {
    for (const category of catalog) {
      groups.set(sheetName(category.title), []);
    }
    groups.set("Other", []);
    for (const app of applications) {
      const name = sheetNameForApp(app);
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(app);
    }
    if (!groups.get("Other")?.length) groups.delete("Other");
  }

  for (const [name, apps] of groups) {
    addApplicationSheet(workbook, name, apps);
  }

  return workbook;
}

function sheetName(value) {
  const clean = String(value || "Other")
    .replace(/[\\/?*\[\]:]/g, " ")
    .trim();
  return (clean || "Other").slice(0, 31);
}

function sheetNameForApp(app) {
  const slug = app.program?.categorySlug;
  const bySlug = catalog.find((item) => item.slug === slug);
  if (bySlug) return sheetName(bySlug.title);
  const areaTitle = String(app.program?.category || "").trim();
  const byTitle = catalog.find((item) => item.title.toLowerCase() === areaTitle.toLowerCase());
  if (byTitle) return sheetName(byTitle.title);
  const programTitle = String(app.program?.program || app.program?.title || "")
    .trim()
    .toLowerCase();
  const byProgram = catalog.find((item) =>
    item.programs?.some((program) => String(program.title).toLowerCase() === programTitle)
  );
  if (byProgram) return sheetName(byProgram.title);
  return sheetName(areaTitle || "Other");
}

function addApplicationSheet(workbook, name, applications) {
  const sheet = workbook.addWorksheet(name);
  const rows = applications.map(flattenApplication);
  const columns = [];
  const seen = new Set();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }
  if (!columns.length) {
    sheet.addRow(["No applicants in this program area yet."]);
    return;
  }

  sheet.columns = columns.map((key) => ({
    header: key,
    key,
    width: Math.min(Math.max(key.length + 2, 14), 42),
  }));
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0A2E6D" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  rows.forEach((row) => sheet.addRow(row));
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

export async function streamApplicationsPdf(applications, res) {
  const { default: PDFDocument } = await import("pdfkit");
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.pipe(res);

  doc.fontSize(18).fillColor("#0a2e6d").text("HassAz Tech Hub", { align: "center" });
  doc.fontSize(12).fillColor("#4b5563").text("Course Applications Register", { align: "center" });
  doc.fontSize(9).fillColor("#9ca3af").text(`Generated on ${new Date().toLocaleString()}`, { align: "center" });
  doc.moveDown(1);

  if (!applications.length) {
    doc.fontSize(11).fillColor("#1f2937").text("No applications have been submitted yet.");
  }

  applications.forEach((app, index) => {
    if (index > 0) doc.addPage();
    const row = flattenApplication(app);
    const name = row["Personal - fullName"] || "Unnamed applicant";

    doc.fontSize(15).fillColor("#0a2e6d").text(String(name));
    doc
      .fontSize(10)
      .fillColor("#b8962e")
      .text(`${row["Application Number"]}  •  ${row.Status}  •  ${row.State}`);
    doc.moveDown(0.6);

    Object.entries(row).forEach(([key, value]) => {
      if (key === "Personal - fullName" || key === "Application Number" || key === "Status" || key === "State") {
        return;
      }
      if (value === "" || value === undefined || value === null) return;
      doc
        .fontSize(9)
        .fillColor("#0a2e6d")
        .font("Helvetica-Bold")
        .text(`${key}: `, { continued: true })
        .font("Helvetica")
        .fillColor("#1f2937")
        .text(String(value));
    });
  });

  doc.end();
}
