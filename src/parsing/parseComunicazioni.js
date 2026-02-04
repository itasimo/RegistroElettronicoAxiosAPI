import { convertLookup, removeHtmlTags, toBool } from "@/utils";

/**
 * Parsea i dati delle comunicazioni in una struttura più comoda
 * @param {Array} rawData - Dati grezzi delle comunicazioni presi dall'API di Axios
 * @param {String} alunnoID - ID dell'alunno necessario per richieste di conferma di lettura o risposta
 * @returns {Array} Array contenente tutte le comunicazioni compresi i link ai file allegati
 */
export default function parseComunicazioni(rawData, alunnoID) {

    const tipoNum = ['1', '2', '3', '4', '5'];
    const tipoStr = ['Scuola/Famiglia', 'Avviso', 'Modulistica', 'Circolare', 'Comunicazione'];
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
            autore: item.ownerName,
            testo: removeHtmlTags(item.desc), // Estrae il testo dal codice HTML
            id: item.id,
            idAlunno: alunnoID,
            tipo: convertLookup(item.tipo, tipoNum, tipoStr), // Converte la lettera in un tipo di voto leggibile
            letta: toBool(item.letta, "S"),
            obbligatoria: toBool(item.flgObbl, "S"),
            pin: item.pin,
            modificabile: toBool(item.modificabile, "1"),
            allegati: allegatiCircolare,
            risposta: {
                prevedeRisposta: toBool(item.tipo_risposta, "1"),
                opzioniRisposta: item.opzioni.split('|'),
                isRisposta: toBool(item.risposta, 1),
                rispostaTesto: item.risposta_testo || null,
            }
        });
    }

    return result;
}