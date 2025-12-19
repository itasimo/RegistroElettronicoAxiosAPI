import { removeHtmlTags, toBool } from "@/utils";

/**
 * Parsea i dati della pagella in una struttura più comoda
 * @param {Array} rawData - Dati grezzi della pagella presi dall'API di Axios
 * @returns {Array} Array contenente tutti i dati della pagella divisi per quadrimestre
 */
export default function parsePagella(rawData) {

    const result = [];

    for (const quadrimestre of rawData) { // Per ogni quadrimestre (2)
        
        const materie = [];
        const voti = [];

        for (const item of quadrimestre.materie) { // Per ogni materia (n)

            const materiaData = {
                materia: item.descMat,
                voto: item.mediaVoti, // Non è la media dei voti, ma il voto finale
                debito: item.schedaCarenza ? { // Se c'è un debito
                    motivo: item.schedaCarenza.motivo, // Motivo del debito
                    argomenti: item.schedaCarenza.rilevate, // Argomenti su cui si ha il debito
                    modRecupero: item.schedaCarenza.modalitaRecupero, // Modalità di recupero
                    tipoVerifica: item.schedaCarenza.verifica, // Tipo della verifica di recupero
                    dataVerifica: item.schedaCarenza.dataVerifica, // Data della verifica di recupero
                    argVerifica: item.schedaCarenza.verificaArgomenti, // Argomenti della verifica di recupero
                    giudizioVerifica: item.schedaCarenza.verificaGiudizio // Giudizio della verifica di recupero
                } : {},
                giudizio: item.giudizio,
                assenze: Number(item.assenze)
            };

            materie.push(materiaData);
            voti.push(Number(item.mediaVoti));
        }

        result.push({
            quadrimestre: quadrimestre.descFrazione,
            media: Math.floor((voti.reduce((a, b) => a + b, 0) / voti.length) * 100) / 100, // Media dei voti arrotondata a 2 decimali
            esito: quadrimestre.esito,
            giudizio: removeHtmlTags(quadrimestre.giudizio), // Rimuove i tag HTML
            materie: materie,
            dataVisualizzazione: quadrimestre.dataVisualizzazione,
            URL: quadrimestre.URL,
            letta: toBool(quadrimestre.letta, 'S'),
            visibile: toBool(quadrimestre.visibile, 'true')
        });
        
    }

    return result;
}