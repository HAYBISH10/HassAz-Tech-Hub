/**
 * Certificate program title and details for each HIACDI course,
 * filled from the catalog when staff choose a program area and course.
 */
export function certificateWording(program, categoryTitle) {
  if (!program) {
    return { program: "", details: "" };
  }
  const duration = program.modes?.[0]?.duration || "";
  const topicParts = (program.curriculum || []).flatMap((block) => {
    const items = (block.items || []).join(", ");
    if (block.title && items) return [`${block.title} (${items})`];
    if (block.title) return [block.title];
    return items ? [items] : [];
  });
  const covering = topicParts.length
    ? topicParts.join("; ")
    : program.intro || program.summary || categoryTitle || "applied technology practice";
  const durationBit = duration ? `a ${duration} programme` : "the published programme";
  return {
    program: program.title,
    details: `Successfully completed ${durationBit} in ${program.title} (${categoryTitle}) at HIACDI Tech Hub, covering ${covering}, with live instruction, laboratory practice, mentor reviews, and applied project work.`,
  };
}

export function catalogMatchForProgramTitle(programTitle, catalog = []) {
  const title = String(programTitle || "").trim().toLowerCase();
  if (!title) return null;
  for (const category of catalog) {
    const program = category.programs?.find((item) => String(item.title).toLowerCase() === title);
    if (program) return { category, program };
  }
  for (const category of catalog) {
    const program = category.programs?.find((item) => title.includes(String(item.title).toLowerCase()));
    if (program) return { category, program };
  }
  return null;
}

export function categoryForCertificateProgram(programTitle, catalog = []) {
  return catalogMatchForProgramTitle(programTitle, catalog)?.category.title || "Other";
}

export function graduateAreaTitle(item, catalog = []) {
  if (item?.categorySlug) {
    const found = catalog.find((entry) => entry.slug === item.categorySlug);
    if (found) return found.title;
  }
  return categoryForCertificateProgram(item?.program, catalog);
}

export function graduateMatchesCourse(item, categorySlug, programSlug, catalog = []) {
  const match = catalogMatchForProgramTitle(item.program, catalog);
  const itemCategory = item.categorySlug || match?.category?.slug || "";
  const itemProgram = item.programSlug || match?.program?.slug || "";
  const programText = String(item.program || "").toLowerCase();

  if (categorySlug) {
    if (itemCategory && itemCategory !== categorySlug) return false;
    if (!itemCategory) {
      const category = catalog.find((entry) => entry.slug === categorySlug);
      if (!category) return false;
      const inArea =
        programText.includes(String(category.title).toLowerCase()) ||
        (category.programs || []).some((program) =>
          programText.includes(String(program.title).toLowerCase())
        );
      if (!inArea) return false;
    }
  }

  if (programSlug) {
    if (itemProgram) return itemProgram === programSlug;
    const program = catalog.flatMap((entry) => entry.programs || []).find((entry) => entry.slug === programSlug);
    if (!program) return false;
    const title = String(program.title).toLowerCase();
    return programText === title || programText.includes(title);
  }

  return true;
}
