import { convertLookup, removeHtmlTags } from "@/utils";

/**
 * Parsea i dati delle comunicazioni in una struttura più comoda
 * @param {Array} rawData - Dati grezzi delle comunicazioni presi dall'API di Axios
 * @param {String} alunnoID - ID dell'alunno necessario per richieste di conferma di lettura o risposta
 * @returns {Array} Array contenente tutte le comunicazioni compresi i link ai file allegati
 */
export default function parseComunicazioni(rawData, alunnoID) {

    const tipoNum = ['1', '4', '5'];
    const tipoStr = ['Circolare', 'Scuola/Famiglia', 'Comunicazione'];
    const result = [];

    for (const item of rawData) {

        const allegatiCircolare = [];

        for (const allegato of item.allegati) {

            allegatiCircolare.push({
                nome: allegato.sourceName,
                desc: allegato.desc,
                downloadLink: allegato.URL
            });
        }

        result.push({
            data: item.data,
            titolo: item.titolo,
            testo: removeHtmlTags(item.desc), // Estrae il testo dal codice HTML
            id: item.id,
            idAlunno: alunnoID,
            tipo: convertLookup(item.tipo, tipoNum, tipoStr), // Converte la lettera in un tipo di voto leggibile
            letta: item.letta == "S",
            allegati: allegatiCircolare,
            prevedeRisposta: item.tipo_risposta != "0",
            opzioniRisposta: item.opzioni.split('|'),
        });
    }

    return result;
}