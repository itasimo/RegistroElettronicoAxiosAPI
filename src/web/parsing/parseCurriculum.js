import { htmlParser, querySelector, querySelectorAll, innerHTML, innerText } from "../utils";

export default function parseCurriculum(htmlString) {
    // Parse HTML and locate the curriculum container
    const root = htmlParser(htmlString);
    const curriculumEl = querySelector(root, "div#curriculum");

    // Collect all <td> elements (table cells) in document order
    const cellNodes = querySelectorAll(curriculumEl, "td");
    const cellsHtml = [];

    // Extract raw inner HTML for each cell — some cells may contain markup
    cellNodes.forEach((td) => {
        const html = innerHTML(td).trim();
        cellsHtml.push(html);
    });

    const records = [];
    // Template for a single curriculum record (one table row)
    const recordTemplate = {
        annoScolastico: null,
        scuola: null,
        indirizzo: null,
        classe: null,
        sezione: null,
        esito: null,
        creditoScolastico: null,
        creditiFormativi: null,
    };

    // Each row is represented by 8 consecutive cells in `cellsHtml`.
    for (let i = 0; i < cellsHtml.length; ) {
        const row = { ...recordTemplate };

        // Assign fields in the documented table order
        row.annoScolastico = cellsHtml[i++] || null;
        row.scuola = cellsHtml[i++] || null;
        row.indirizzo = cellsHtml[i++] || null;
        row.classe = cellsHtml[i++] || null;
        row.sezione = cellsHtml[i++] || null;

        // `esito` cell may contain nested mark up; parse it and extract inner text
        row.esito = innerText(cellsHtml[i++]) || null;

        row.creditoScolastico = cellsHtml[i++] || null;
        row.creditiFormativi = cellsHtml[i++] || null;

        records.push(row);
    }

    return records;
}