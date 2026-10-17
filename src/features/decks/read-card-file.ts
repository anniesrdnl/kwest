import { csvToTabText } from "./schemas";
import { officeXmlToLines } from "./office-text";

const MB = 1024 * 1024;
// Files are read in the browser and never uploaded, so these only guard the tab's memory. They are generous.
const MAX_FILE_BYTES = 100 * MB;
/** Zipped or formatted files carry extra data, so they get more room. */
const MAX_BIG_BYTES = 500 * MB;
const MAX_PDF_PAGES = 2000;

const tooBig = (bytes: number): Read => ({ error: `That file is too big. Keep it under ${bytes / MB} MB.` });

export const CARD_FILE_ACCEPT = [
  ".txt,.csv,.tsv,.md,.xlsx,.docx,.pptx,.pdf",
  "text/plain",
  "text/csv",
  "text/tab-separated-values",
  "text/markdown",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
].join(",");

type Read = { text: string } | { error: string };

const OLD_FORMATS: Record<string, string> = {
  xls: "Old Excel files (.xls) can't be read. In Excel, choose File > Save As > Excel Workbook (.xlsx), then upload that.",
  doc: "Old Word files (.doc) can't be read. In Word, choose File > Save As > Word Document (.docx), then upload that.",
  ppt: "Old PowerPoint files (.ppt) can't be read. In PowerPoint, choose File > Save As > PowerPoint Presentation (.pptx), then upload that.",
};

/**
 * Reads a card file in the browser. Nothing is uploaded: the cards are added to
 * the editor, and only saved with the deck.
 */
export async function readCardFile(file: File): Promise<Read> {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (ext === "xlsx") return readExcel(file);
  if (ext === "docx") return readOffice(file, "word/document.xml", "Word");
  if (ext === "pptx") return readOffice(file, /^ppt\/slides\/slide\d+\.xml$/, "PowerPoint");
  if (ext === "pdf") return readPdf(file);
  if (!["txt", "csv", "tsv", "md"].includes(ext)) {
    return {
      error:
        OLD_FORMATS[ext] ?? "Use a Word (.docx), PowerPoint (.pptx), PDF, Excel (.xlsx), .csv, .tsv or .txt file.",
    };
  }
  if (file.size > MAX_FILE_BYTES) return tooBig(MAX_FILE_BYTES);

  const bytes = await file.arrayBuffer();
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    // Older Excel saves CSV in the Windows encoding instead of UTF-8.
    text = new TextDecoder("windows-1252").decode(bytes);
  }
  return { text: ext === "csv" ? csvToTabText(text) : text };
}

/** First sheet of an .xlsx file as tab-separated lines, ready for parseCardText. */
async function readExcel(file: File): Promise<Read> {
  if (file.size > MAX_BIG_BYTES) return tooBig(MAX_BIG_BYTES);
  try {
    // Loaded only when someone uploads an Excel file.
    const { readSheet } = await import("read-excel-file/browser");
    const rows = await readSheet(file);
    const cell = (v: unknown) =>
      v == null ? "" : v instanceof Date ? v.toLocaleDateString() : String(v).replace(/\s+/g, " ").trim();
    return { text: rows.map((row) => row.map(cell).join("\t")).join("\n") };
  } catch {
    return { error: "Couldn't read that Excel file. Try saving it again, or save it as CSV and upload that." };
  }
}

/** Word or PowerPoint: unzip, then read the text and tables from the XML parts. */
async function readOffice(file: File, part: string | RegExp, label: string): Promise<Read> {
  if (file.size > MAX_BIG_BYTES) return tooBig(MAX_BIG_BYTES);
  try {
    // Loaded only when someone uploads one of these files.
    const { unzipSync, strFromU8 } = await import("fflate");
    const files = unzipSync(new Uint8Array(await file.arrayBuffer()), {
      filter: (f) => (typeof part === "string" ? f.name === part : part.test(f.name)),
    });
    const names = Object.keys(files);
    // Slides in number order: slide2 before slide10.
    const num = (name: string) => Number(/(\d+)\.xml$/.exec(name)?.[1] ?? 0);
    names.sort((a, b) => num(a) - num(b));
    if (!names.length) throw new Error("no text part");
    return { text: names.flatMap((n) => officeXmlToLines(strFromU8(files[n]))).join("\n") };
  } catch {
    return { error: `Couldn't read that ${label} file. Try saving it again, or copy the text into a .txt file.` };
  }
}

type PdfItem = { str: string; x: number; y: number; w: number };

/** Items within 3 units of height share a line; a wide gap between items on a line becomes a tab. */
function pdfLines(items: PdfItem[]): string[] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: string[] = [];
  let line: PdfItem[] = [];
  const flush = () => {
    line.sort((a, b) => a.x - b.x);
    let text = "";
    line.forEach((it, i) => {
      if (i > 0 && it.x - (line[i - 1].x + line[i - 1].w) > 12) text += "\t";
      text += it.str;
    });
    text = text.replace(/ {2,}/g, " ").trim();
    if (text) lines.push(text);
    line = [];
  };
  for (const it of sorted) {
    if (line.length && Math.abs(line[0].y - it.y) > 3) flush();
    line.push(it);
  }
  flush();
  return lines;
}

/** PDF: read the text page by page. */
async function readPdf(file: File): Promise<Read> {
  if (file.size > MAX_BIG_BYTES) return tooBig(MAX_BIG_BYTES);
  try {
    // Loaded only when someone uploads a PDF.
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const lines: string[] = [];
    for (let n = 1; n <= Math.min(pdf.numPages, MAX_PDF_PAGES); n++) {
      const content = await (await pdf.getPage(n)).getTextContent();
      const items: PdfItem[] = [];
      for (const it of content.items) {
        if ("str" in it && it.str.trim() !== "") items.push({ str: it.str, x: it.transform[4], y: it.transform[5], w: it.width });
      }
      lines.push(...pdfLines(items));
    }
    return { text: lines.join("\n") };
  } catch {
    return { error: "Couldn't read that PDF. It may be locked, or a scan of paper (pictures of text can't be read)." };
  }
}
