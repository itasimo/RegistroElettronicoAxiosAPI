import { htmlParser, innerText, querySelectorAll, querySelector, firstAnchorHref } from "../utils";

/**
 * Parse the 'Anagrafico' section HTML and return a structured object.
 * The original HTML lists label/value pairs inside table cells; this parser
 * collects relevant <td> content and maps known labels to keys.
 * Works with both browser `Document` and `node-html-parser` roots.
 *
 * @param {string} htmlString - HTML fragment containing the anagrafico
 * @returns {object} Parsed and normalized anagrafico data
 */
export default function parseAnagrafico(htmlString) {
    const root = htmlParser(htmlString);

    // Collect all <td> elements in document order and normalize values.
    const tdList = querySelectorAll(root, "td");
    const tokens = [];

    tdList.forEach((td) => {
        const txt = innerText(td);

        // If there's no textual content, prefer capturing an anchor's href
        // (covers cases where the anchor contains only an icon)
        if (!txt) {
            const href = firstAnchorHref(td);
            if (href) {
                tokens.push(href);
                return;
            }

            // Skip icon-only cells (e.g., gender icon)
            if (querySelector(td, "i.fa")) return;

            return;
        }

        // Ignore single-letter 'W' link placeholders (Wikipedia links)
        if (txt === "W") return;

        tokens.push(txt);
    });

    // Prepare result object with predictable keys
    const result = {
        codiceAlunno: null,
        codiceSIDI: null,
        nome: null,
        cognome: null,
        dataNascita: null,
        comuneNascita: null,
        statoNascita: null,
        sesso: null,
        codiceFiscale: null,
        cittadinanza: null,
        residenza: { indirizzo: null, gMapsLink: null },
        domicilio: { indirizzo: null, gMapsLink: null },
        telefono: null,
        cellulare: null,
        emailScolastica: null,
        emailMIM: null,
    };

    // Regex helpers
    const emailRe = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
    const phoneRe = /\+?\d[\d\s.\-()]{5,}\d/g;

    // Walk tokens and map known labels to result fields
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        switch (token) {
            case "Codice Alunno":
                result.codiceAlunno = tokens[i + 1] ?? null;
                i++;
                break;
            case "Codice SIDI":
                result.codiceSIDI = tokens[i + 1] ?? null;
                i++;
                break;
            case "Cognome":
                result.cognome = tokens[i + 1] ?? null;
                i++;
                break;
            case "Nome":
                result.nome = tokens[i + 1] ?? null;
                i++;
                break;
            case "Data di nascita":
                result.dataNascita = tokens[i + 1] ?? null;
                i++;
                break;
            case "Comune di nascita":
                result.comuneNascita = tokens[i + 1] ?? null;
                i++;
                break;
            case "Stato":
                result.statoNascita = tokens[i + 1] ?? null;
                i++;
                break;
            case "Sesso":
                result.sesso = tokens[i + 1] ?? null;
                i++;
                break;
            case "Codice fiscale":
                result.codiceFiscale = tokens[i + 1] ?? null;
                i++;
                break;
            case "Cittadinanza":
                result.cittadinanza = tokens[i + 1] ?? null;
                i++;
                break;
            case "Residenza":
                if (tokens[i + 1] && String(tokens[i + 1]).startsWith("http")) {
                    result.residenza.gMapsLink = tokens[i + 1];
                    result.residenza.indirizzo = tokens[i + 2] ?? null;
                    i += 2;
                } else {
                    result.residenza.indirizzo = tokens[i + 1] ?? null;
                    i++;
                }
                break;
            case "Domicilio":
                if (tokens[i + 1] && String(tokens[i + 1]).startsWith("http")) {
                    result.domicilio.gMapsLink = tokens[i + 1];
                    result.domicilio.indirizzo = tokens[i + 2] ?? null;
                    i += 2;
                } else {
                    result.domicilio.indirizzo = tokens[i + 1] ?? null;
                    i++;
                }
                break;
            case "Telefoni ed Email": {
                const blob = tokens[i + 1] ?? "";
                const emails = blob.match(emailRe) || [];
                const phones = blob.match(phoneRe) || [];
                result.emailScolastica = emails[0] ?? null;
                if (emails.length > 1) result.emailMIM = emails.slice(1)[0];
                result.telefono = phones[0] ?? null;
                result.cellulare = phones[1] ?? phones[0] ?? null;
                i++;
                break;
            }
            default:
                // Unknown token — ignore. This makes parsing tolerant to extra cells.
                break;
        }
    }

    return result;
}