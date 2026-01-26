import { htmlParser, querySelector, getRowsFromTable } from "../utils";

/**
 * Parse the 'Assenze' section HTML and return a structured array of absence records.
 * Each record includes date, type, reason, time (if applicable), and justification status.
 * Works with both browser `Document` and `node-html-parser` roots.
 *
 * @param {string} htmlString - HTML fragment containing the assenze table
 * @returns {Array} Parsed array of absence records
 */
export default function parseAssenze(htmlString) {
    const results = [];
    const root = htmlParser(htmlString);

    // Locate the table and extract its rows using utility helpers
    const table = querySelector(root, 'table.table');
    const rows = getRowsFromTable(table);

    for (const row of rows) {

        // Work with the trimmed text of the row for simple substring parsing
        const rowText = row.textContent.trim();

        // Fixed lengths / tokens used by the parsing logic
        const dateLength = 10; // expected length of the date at the start (e.g. "dd/mm/yyyy")
        const AssenteLength = 'Assente'.length; // length of the full-day marker
        const SIlength = ' SI'.length; // trailing marker indicating justification: 'SI' for justified or 'NO' for not justified (same length, so it doesn't matter)
        
        // If the text contains "Assente" it's a full-day absence
        const isAssenza = rowText.includes('Assente');

        // Date is always at the very start of the row text
        const data = rowText.substring(0, dateLength).trim();

        let tipo = null;
        let motivo = null;
        let ora = null;

        if (isAssenza) {

            // Example full-day absence row:
            // 15/12/2025Assente Visita medica SI

            // Full-day absence: `tipo` is the fixed value and `motivo` follows the word "Assente"
            tipo = 'Assenza';

            const motivoStart = dateLength + AssenteLength;
            const motivoEnd = rowText.length - SIlength; // exclude trailing " SI"
            motivo = rowText.substring(motivoStart, motivoEnd).trim();
        } else {

            // Example partial-day absence row:
            // 14/10/2025Uscita [12:15] Assenza docente NO

            // Partial-day entry: `tipo` is the text between the date and the '['
            const tipoStart = dateLength;
            const tipoEnd = rowText.indexOf('[');
            tipo = rowText.substring(tipoStart, tipoEnd).trim();

            // Time (ora) is expected inside square brackets
            const oraStart = rowText.indexOf('[') + 1;;
            const oraEnd = rowText.indexOf(']');
            ora = rowText.substring(oraStart, oraEnd).trim();

            // Motivo comes after the closing bracket and before the trailing " SI"
            const motivoStart = rowText.indexOf(']') + 1;;
            const motivoEnd = rowText.length - SIlength;
            motivo = rowText.substring(motivoStart, motivoEnd).trim();
        }

        // Determine whether the absence is justified by checking the final token ("SI")
        const isGiustificataRaw = rowText.substring(rowText.length - SIlength).trim();
        const isGiustificata = isGiustificataRaw === 'SI' ? true : false;

        // Collect the parsed entry
        results.push({
            data,
            tipo,
            ora,
            motivo,
            isGiustificata,
        });

    }

    return results;
}