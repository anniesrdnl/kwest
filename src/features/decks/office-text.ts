/**
 * Turns the XML inside Word (.docx) and PowerPoint (.pptx) files into lines of text.
 * Both formats use the same shapes: paragraphs (p), tables (tbl > tr > tc) and text (t).
 * A table row becomes one tab-separated line, so it goes through parseCardText like a spreadsheet row.
 */

function paragraphText(p: Element): string {
  let out = "";
  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      const name = child.localName;
      if (name === "t") out += child.textContent ?? "";
      else if (name === "tab") out += "\t";
      else if (name === "br" || name === "cr") out += " ";
      else walk(child);
    }
  };
  walk(p);
  return out.replace(/[\r\n]+/g, " ").trim();
}

function cellText(tc: Element): string {
  const parts: string[] = [];
  for (const p of Array.from(tc.getElementsByTagNameNS("*", "p"))) {
    const text = paragraphText(p).replace(/\s+/g, " ");
    if (text) parts.push(text);
  }
  return parts.join(" ");
}

/** Lines of text from one XML part (document.xml or one slide). */
export function officeXmlToLines(xml: string): string[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("bad xml");
  const lines: string[] = [];
  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      const name = child.localName;
      if (name === "tbl") {
        for (const tr of Array.from(child.children).filter((c) => c.localName === "tr")) {
          const cells = Array.from(tr.children)
            .filter((c) => c.localName === "tc")
            .map(cellText);
          if (cells.some(Boolean)) lines.push(cells.join("\t"));
        }
      } else if (name === "p") {
        const text = paragraphText(child);
        if (text) lines.push(text);
      } else walk(child);
    }
  };
  walk(doc.documentElement);
  return lines;
}
