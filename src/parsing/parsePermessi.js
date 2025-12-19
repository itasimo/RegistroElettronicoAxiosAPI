import { convertLookup, toBool, splitDateTime, removeSeconds } from "@/utils";

// Axios usa un formato di merda per i tipi di uscite, quindi li converto in qualcosa di leggibile
const tipoLett = ['A', 'U', 'E', 'G', 'D'];
const tipoStr = ['Assenza', 'Uscita Anticipata', 'Entrata Posticipata', 'Uscita Didattica', 'DaD (Didattica a distanza)'];

/**
 * Crea la struttura dati per un permesso
 * @param {Object} item - Singolo permesso/richiesta
 * @returns {Object} Struttura dati formattata
 */
function createPermessoStructure(item) {
    return {
        id: item.id,
        data: [
            item.dataInizio,
            item.dataFine
        ],
        tipo: convertLookup(item.tipo, tipoLett, tipoStr),
        ora: item.ora, // se ora è 0 allora è tutto il giorno
        orario: removeSeconds(item.orario),
        motivo: item.motivo,
        note: item.note,
        diClasse: toBool(item.classe, "True"),
        calcolata: toBool(item.calcolo, "True"),
        giustificata: toBool(item.giustificato, "True"),
        info: {
            inseritoDa: item.utenteInserimento,
            rispostoDa: item.utenteAutorizzazione,
            rispostoIl: splitDateTime(item.dataAutorizzazione)
        }
    };
}

/**
 * Parsea i dati dei permessi in una struttura più comoda
 * @param {Object} rawData - Dati grezzi dei permessi presi dall'API di Axios
 * @returns {Object} Oggetto contenente:
 *                  - richiesteDaAutorizzare: richieste di permessi da autorizzare; **+18**
 *                  - richiesteNonAutorizzate: richieste di permessi non autorizzate; **+18**
 *                  - permessiDaAutorizzare: permessi da autorizzare;
 *                  - permessiAutorizzati: permessi autorizzati;
 */
export default function parsePermessi(rawData) {

    const result = {
        richiesteDaAutorizzare: [],
        richiesteNonAutorizzate: [],
        permessiDaAutorizzare: [],
        permessiAutorizzati: []
    };

    // *Richieste Da Autorizzare*
    for (const item of rawData.richiesteDaAutorizzare) {
        result.richiesteDaAutorizzare.push(createPermessoStructure(item));
    }

    // *Richieste Non Autorizzate*
    for (const item of rawData.richiesteNonAutorizzate) {
        result.richiesteNonAutorizzate.push(createPermessoStructure(item));
    }

    // *Permessi Non Autorizzate*
    for (const item of rawData.permessiDaAutorizzare) {
        result.permessiDaAutorizzare.push(createPermessoStructure(item));
    }

    // *Permessi Autorizzati*
    for (const item of rawData.permessiAutorizzati) {
        result.permessiAutorizzati.push(createPermessoStructure(item));
    }

    return result;
}