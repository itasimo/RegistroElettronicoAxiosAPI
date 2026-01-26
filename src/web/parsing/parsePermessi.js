import { htmlParser, querySelector, getRowsFromTable } from "../utils";
import { splitDateTime } from "@/utils";

export default async function parsePermessi(htmlString) {
    const root = htmlParser(htmlString);

    // Richieste in attesa di autorizzazione
    // Richieste non autorizzate
    // Permessi da autorizzare
    // Permessi Autorizzati
    const richiesteInAttesaAutorizzazione = parseRichieste_Pending(root);
    const richiesteNonAutorizzate = parseRichieste_Unauthorized(root);
    const permessiDaAutorizzare = parsePermessi_Pending(root);
    const permessiAutorizzati = parsePermessi_Authorized(root);

    return {
        richiesteInAttesaAutorizzazione,
        richiesteNonAutorizzate,
        permessiDaAutorizzare,
        permessiAutorizzati,
    };
}

function parseRichieste_Pending(root) {
    const results = [];

    const panel = querySelector(
        root,
        'div.panel.panel-warning:has(div.panel-heading:contains("Richieste in attesa di autorizzazione"))',
    );

    // if panel-body is present then the table is empty
    const isEmpty = querySelector(panel, "div.panel-body") !== null;
    if (isEmpty) {
        return results; // empty array
    } else {
        return results; // TODO: implement actual parsing
    }
}

function parseRichieste_Unauthorized(root) {
    const results = [];

    const panel = querySelector(
        root,
        'div.panel.panel-danger:has(div.panel-heading:contains("Richieste non autorizzate"))',
    );

    // if panel-body is present then the table is empty
    const isEmpty = querySelector(panel, "div.panel-body") !== null;

    if (isEmpty) {
        return results; // empty array
    } else {
        const table = querySelector(panel, "table.table");
        const rows = getRowsFromTable(table);

        for (const row of rows) {
            const cells = row.querySelectorAll("td");

            const insertedByLength = "Inserito da: ".length;

            // 30/10/2025
            // 30/10/2025
            // Entrata/Ritardo
            // 3 11:00
            // Visita medica
            // Come da regolamento non è consentito l'ingresso posticipato oltre 1 ora dall'inizio delle lezioni
            // DE SANTIS PATRIZIA - 29/10/2025 12:58:24"

            let i = 0;
            const dataInizio = cells[i++].textContent.trim();
            const dataFine = cells[i++].textContent.trim();

            const tipo = cells[i].textContent.trim();

            const inseritaDa = cells[i++]
                .getAttribute("title")
                .substring(insertedByLength); // who requested the permission

            const oraRaw = cells[i++].textContent.trim();
            const ora = oraRaw === "" ? null : oraRaw.split(" "); // extract hour before any space

            const motivo = cells[i++].textContent.trim();

            const note = cells[i++].textContent.trim();

            const negataRaw = cells[i++].textContent.trim();
            const negataDa = negataRaw.split(" - ")[0]
            const negataData = negataRaw.split(" - ")[1];

            results.push({
                data: [
                    dataInizio,
                    dataFine
                ],
                tipo,
                ora,
                motivo,
                note,
                info: {
                    inseritoDa: inseritaDa,
                    rispostoDa: negataDa,
                    rispostoIl: splitDateTime(negataData)
                }
            });
        }

        return results;
    }
}

function parsePermessi_Pending(root) {
    const results = [];

    const panel = querySelector(
        root,
        'div.panel.panel-info:has(div.panel-heading:contains("Permessi da autorizzare"))',
    );

    // if panel-body is present then the table is empty
    const isEmpty = querySelector(panel, "div.panel-body") !== null;
    if (isEmpty) {
        return results; // empty array
    } else {
        return results; // TODO: implement actual parsing
    }
}

function parsePermessi_Authorized(root) {
    const results = [];

    const panel = querySelector(
        root,
        'div.panel.panel-success:has(div.panel-heading:contains("Permessi Autorizzati"))',
    );
    // if panel-body is present then the table is empty
    const isEmpty = querySelector(panel, "div.panel-body") !== null;
    if (isEmpty) {
        return results; // empty array
    } else {
        const table = querySelector(panel, "table.table");
        const rows = getRowsFromTable(table);

        for (const row of rows) {
            const cells = row.querySelectorAll("td");

            // 23/10/2025
            // 23/10/2025
            // Uscita
            // 6 13:10
            //
            // Motivi familiari
            //
            // sì
            // sì
            // no
            // DACCO' ANTONELLA - 22/10/2025 23:13:12

            let i = 0;
            const dataInizio = cells[i++].textContent.trim();
            const dataFine = cells[i++].textContent.trim();

            const tipo = cells[i].textContent.trim();

            const inseritoDa = cells[i++]
                .getAttribute("title")
                .substring("Inserito da: ".length); // who inserted the permission

            const oraRaw = cells[i++].textContent.trim();
            const ora = oraRaw === "" ? null : oraRaw.split(" ");

            i++; // the days duration cell is ignored, we calculate it ourselves
            
            // Calculate duration in days: (difference in milliseconds between end and start) / (1000*60*60*24) + 1 to count both start and end dates (inclusive)
            // Parse Italian date format (DD/MM/YYYY) to avoid NaN when creating Date objects
            const parseItalianDate = (dateStr) => {
                const [day, month, year] = dateStr.split('/');
                return new Date(year, month - 1, day); // month is 0-indexed
            };
            
            const durataGiorni =
                (parseItalianDate(dataFine) - parseItalianDate(dataInizio)) /
                    (1000 * 60 * 60 * 24) +
                1;

            const motivo = cells[i++].textContent.trim();

            const note = cells[i++].textContent.trim();

            const calcolato = cells[i++].textContent.trim() === "sì";
            const giustificato = cells[i++].textContent.trim() === "sì";
            const diClasse = cells[i++].textContent.trim() === "sì";

            const autorizzatoRaw = cells[i++].textContent.trim();
            const autorizzatoDa = autorizzatoRaw.split(" - ")[0];
            const autorizzatoData = autorizzatoRaw.split(" - ")[1];

            results.push({
                data: [
                    dataInizio,
                    dataFine
                ],
                tipo,
                ora,
                durataGiorni,
                motivo,
                note,
                calcolato,
                giustificato,
                diClasse,
                info: {
                    inseritoDa: inseritoDa,
                    rispostoDa: autorizzatoDa,
                    rispostoIl: splitDateTime(autorizzatoData)
                }
            });
        }

        return results;
    }
}
