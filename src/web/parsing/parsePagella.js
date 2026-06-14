import { convertLookup, commonConvertLookups } from "@/utils";
import { dataset, getRowsFromTable, htmlParser, querySelector } from "../utils";

export default async function parsePagella(
    pagesArray,
    quadrimestriTokens,
    webclient,
) {
    const result = [];

    function getPageFromToken(token) {
        // Convert quadrimestre token to index
        const index = Object.values(quadrimestriTokens).indexOf(token);
        if (index !== -1) {
            return pagesArray[index];
        }
        return null;
    }

    for (const [quadrimestre, token] of Object.entries(quadrimestriTokens)) {
        const page = getPageFromToken(token);
        if (!page) {
            continue; // Skip if no page found for this quadrimestre
        }
        // Check if pagella is NOT available (errorcode property exists and equals "0")
        // When pagella is unavailable, extract the date it will become available from the HTML alert message
        if (page.errorcode !== undefined && page.errorcode === "0") {
            // Pagella not yet available - create a placeholder structure with the expected visibility date
            const struct = {
                quadrimestre: quadrimestre,
                media: null,
                esito: null, // Vuoto il primo quadrimestre
                giudizio: null, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
                crediti: null,
                materie: [],
                dataVisualizzazione: null, // Data di quando sarà visibile la pagella
                URL: null, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
                letta: false, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
                visibile: false, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            };

            // Parse HTML to extract the visibility date from the alert message
            const root = htmlParser(page.html);
            const alertDiv = querySelector(root, "div.alert-danger");
            const alertText = alertDiv ? alertDiv.textContent.trim() : "";

            // Extract date from message like "Lo sarà a partire dal 15/02/2026"
            const dateMatch = alertText.match(
                /Lo sarà a partire dal (\d{2}\/\d{2}\/\d{4})/,
            );
            if (dateMatch && dateMatch[1]) {
                struct.dataVisualizzazione = dateMatch[1];
            } else {
                // Fallback if date pattern not found
                struct.dataVisualizzazione = "**/**/****";
            }

            const table = querySelector(root, "table#table-voti");

            if (!table) {
                result.push(struct);
                continue; // No table found, skip to next quadrimestre
            }

            const rows = getRowsFromTable(table);

            const votiStr = [
                "ZERO",
                "UNO",
                "DUE",
                "TRE",
                "QUATTRO",
                "CINQUE",
                "SEX",
                "SETTE",
                "OTTO",
                "NOVE",
                "DIECI",
            ];
            const votiNum = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            let votoCont = 0,
                votiTot = 0;

            for (const row of rows) {
                // Estratto da HTML di esempio:
                // Senza debito:
                //          <tr >
                //  1           <td ><strong>FILOSOFIA</strong></td>
                //  -2        { <td  class='text-center' ></td>
                //  -3          <td  class='text-center' ></td>
                //  -4          <td  class='text-center' ></td>
                //  -5          <td  class='text-center' ></td> } || ''
                //  2-6         <td  class='text-center' ><span class='label bg-green bg-font-green'>OTTO</span></td>
                //  3-7         <td  class='text-center' >6</td>
                //  4-8         <td  class='text-center' ></td>
                //  5-9         <td  class='text-center'  colspan='2' ></td>
                //  6-10        <td ></td>
                //          <tr>
                //
                // Con debito:
                //          <tr >
                //  1           <td ><strong>MATEMATICA</strong></td>
                //  -2        { <td  class='text-center' ></td>
                //  -3          <td  class='text-center' ></td>
                //  -4          <td  class='text-center' ></td>
                //  -5          <td  class='text-center' ></td> } || ''
                //  2-6         <td  class='text-center' ><span class='label bg-red bg-font-red'>CINQUE</span></td>
                //  3-7         <td  class='text-center' >8</td>
                //  4-8         <td  class='text-center' >Sportello didattico obbligatorio</td>
                //  5-9         <td  class='text-center' ><span class='badge badge-warning'>Parzialmente</span></td>
                //  6-10        <td  class='text-center' ><button title='Cliccare qui per visualizzare la scheda carenza' class='btn btn-sm btn-primary family-pagella-scheda-carenze' data-action='FAMILY_PAGELLA_SCHEDA_CARENZE' href='../../Pages/APP/APP_Ajax_Get.aspx' data-others='u9aWwOdJqADfUhTz2n6fT5N2gX8='><i class='far fa-frown fa-lg'></i> Scheda</button></td>
                //  7-11        <td ></td>
                //          </tr>

                const cells = row.querySelectorAll("td");

                let materia, voto, modRecupero, debito, giudizio, assenze;

                const isDebito = cells.length == 7 || cells.length == 11;

                if (cells.length == 6 || cells.length == 7) {
                    materia = cells[0].textContent.trim();

                    voto = convertLookup(
                        cells[1].textContent.trim() || null,
                        votiStr,
                        votiNum,
                    );
                    votoCont++;
                    votiTot += voto;

                    assenze = Number(cells[2].textContent.trim() || 0);

                    modRecupero = cells[3].textContent.trim() || null;

                    // Se c'è il debito, prendi la scheda carenza
                    debito = null;
                    if (isDebito) {
                        const schedaButton = cells[5].querySelector("button");
                        if (!schedaButton) {
                            // Se non troviamo il button, non possiamo procedere con la fetch della scheda carenza, quindi saltiamo questa parte
                            continue;
                        }
                        const schedaAttrs = dataset(schedaButton);
                        const schedaId = schedaAttrs["others"];
                        const action = schedaAttrs["action"];
                        debito = await fetchSchedaCarenza(
                            webclient,
                            action,
                            schedaId,
                        );
                    }

                    giudizio =
                        cells[isDebito ? 6 : 5].textContent.trim() || null;
                } else if (cells.length == 10 || cells.length == 11) {
                    materia = cells[0].textContent.trim();

                    voto = convertLookup(
                        cells[5].textContent.trim() || null,
                        votiStr,
                        votiNum,
                    );
                    votoCont++;
                    votiTot += voto;

                    assenze = Number(cells[6].textContent.trim() || 0);

                    modRecupero = cells[7].textContent.trim() || null;

                    // Se c'è il debito, prendi la scheda carenza
                    debito = null;
                    if (isDebito) {
                        const schedaButton = cells[9].querySelector("button");
                        const schedaAttrs = dataset(schedaButton);
                        const schedaId = schedaAttrs["others"];
                        const action = schedaAttrs["action"];
                        debito = await fetchSchedaCarenza(
                            webclient,
                            action,
                            schedaId,
                        );
                    }

                    giudizio =
                        cells[isDebito ? 10 : 9].textContent.trim() || null;
                }

                struct.materie.push({
                    materia,
                    voto,
                    debito: isDebito ? debito : null,
                    giudizio,
                    assenze,
                });
            }

            // Se è l'ultimo quadrimestre prendi l'esito
            if (quadrimestre === Object.keys(quadrimestriTokens).pop()) {

                const esitoBox = querySelector(root, "div.alert-info");
                const esitoHTML = esitoBox ? esitoBox.innerHTML.trim() : "";
                const creditoSearchStr = "credito scolastico pari a punti:";

                // Rimuovi il testo tra i tag <strong> e i tag HTML
                const esitoText = esitoHTML
                    .replace(/<strong>[\s\S]*?<\/strong>/g, "")
                    .replace(/<br\s*\/?>/g, "\n")
                    .replace(/\n\s*\n/g, "\n")
                    .trim();

                const esitoLines = esitoText
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0);

                // Estrai l'esito (prima riga con testo in UPPERCASE)
                // Cerca il pattern "L'alunno è stato [ESITO]" o testo simile
                const esitoMatch = esitoLines[0]?.match(
                    /[A-ZÀ-ÖØ-Ý][A-ZÀ-ÖØ-Ý\s.]+(?=\s*$|\s*\w)/,
                );
                struct.esito = esitoMatch ? esitoMatch[0].trim() : null;

                // Cerca la riga con "credito" e estrai il numero
                // Se non presente, imposta a 0 (per biennio o bocciature)
                const creditoLine = esitoLines.find((line) =>
                    line.toLowerCase().includes(creditoSearchStr),
                );

                if (creditoLine) {
                    const creditoMatch = creditoLine.match(/(\d+)/);
                    struct.crediti = creditoMatch ? Number(creditoMatch[1]) : 0;
                } else {
                    struct.crediti = 0;
                }

                // Estrai il giudizio: tutte le righe dopo l'esito e i crediti
                // Filtra le righe che non contengono l'esito o i crediti
                const giudizioLines = esitoLines
                    .slice(1)
                    .filter(
                        (line) =>
                            !line.toLowerCase().includes(creditoSearchStr),
                    );

                struct.giudizio =
                    giudizioLines.length > 0
                        ? giudizioLines.join(" ").trim()
                        : null;
            }

            // Media dei voti arrotondata a 2 decimali
            if (votoCont > 0) {
                struct.media = Math.floor((votiTot / votoCont) * 100) / 100;
            }

            result.push(struct);
        }
    }
    return result;
}

async function fetchSchedaCarenza(webclient, action, schedaId) {
    // Invio della richiesta POST per ottenere i dati della scheda carenza
    // action: "FAMILY_PAGELLA_SCHEDA_CARENZE"
    // body: {"schedaId":"u9a...X8="}
    // urlEncodeBody: false
    // rawResponse: true
    const response = await webclient.post(
        action,
        JSON.stringify({ schedaId: schedaId }),
        false,
        true,
    );

    // Parse dell'HTML della scheda carenza
    const root = htmlParser(response);

    // Helper per estrarre il testo da un campo basato sulla label
    const getFieldByLabel = (labelText) => {
        const labels = root.querySelectorAll("label.control-label");
        for (const label of labels) {
            if (label.textContent.trim() === labelText) {
                // Trova il parent form-group e poi cerca il p.form-control-static
                let parent = label.parentNode;
                if (parent) {
                    const textElement = querySelector(
                        parent,
                        "p.form-control-static",
                    );
                    if (textElement) {
                        return textElement.textContent.trim() || null;
                    }
                }
            }
        }
        return null;
    };

    // Estrai i campi
    const argomenti = getFieldByLabel(
        "Contenuti da Consolidare/Carenze rilevate",
    );
    const motivo = getFieldByLabel("Motivazione della carenza");
    const modRecupero = getFieldByLabel("Modalità di recupero");
    const tipoVerifica = getFieldByLabel("Modalità di verifica");
    let dataVerifica = getFieldByLabel("Data verifica");
    const argVerifica = getFieldByLabel("Argomenti verifica");
    const giudizioVerifica = getFieldByLabel("Giudizio verifica");

    // Converti la data da formato "28/febbraio/2025" a "28/02/2025"
    if (dataVerifica) {

        // Estrai le parti della data (giorno/mese/anno)
        const dateParts = dataVerifica.split("/");
        if (dateParts.length === 3) {
            const giorno = dateParts[0];
            const meseNome = dateParts[1].toLowerCase();
            const anno = dateParts[2];

            // Converti il nome del mese in numero
            const meseNum = convertLookup(meseNome, commonConvertLookups.mesi.mesiStr, commonConvertLookups.mesi.mesiNum);
            if (meseNum) {
                dataVerifica = `${giorno}/${meseNum}/${anno}`;
            }
        }
    }

    // Estrai l'esito del recupero dalla badge (Sì, Parzialmente, No)
    let esitoRecupero = null;
    const labels = root.querySelectorAll("label.control-label");
    for (const label of labels) {
        if (label.textContent.trim() === "Carenza recuperata") {
            let parent = label.parentNode;
            if (parent) {
                const badge = querySelector(parent, "span.badge");
                if (badge) {
                    esitoRecupero = badge.textContent.trim() || null;
                }
            }
            break;
        }
    }
    if (esitoRecupero) {
        esitoRecupero = convertLookup(
            esitoRecupero,
            ["Sì", "Parzialmente", "No"],
            ["Recuperato", "Recuperato parzialmente", "Non recuperato"],
        );
    }

    return {
        motivo,
        argomenti,
        modRecupero,
        tipoVerifica,
        dataVerifica,
        argVerifica,
        giudizioVerifica,
        esitoRecupero,
    };
}
