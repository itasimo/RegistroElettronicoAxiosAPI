import { convertLookup, toBool, splitDateTime } from "@/utils";

/**
 * Parsea i dati delle note in una struttura più comoda
 * @param {Array} rawData - Dati grezzi delle note presi dall'API di Axios
 * @returns {Array} Array contenente tutte le note disciplinari divise per quadrimestre
 */
export default function parseNote(rawData) {

    const tipoLett = ['C', 'S']; // Axios usa un formato di merda per segnare note/ritardi/..., quindi li converto in qualcosa di leggibile
    const tipoStr = ['Classe', 'Studente'];

    const result = [];

    for (const quadrimestre of rawData) { // Per ogni quadrimestre (2)

        const note = [];

        for (const item of quadrimestre.note) { // Per ogni nota

            note.push({
                data: item.data,
                tipo: convertLookup(item.tipo, tipoLett, tipoStr),
                tipoNota: new RegExp("<b>(.*?)<\/b>", "gm").exec(item.descNota)[1], // Estrae il tipo di nota, prende il testo tra <b> e </b> cioè il gruppo matchato dal regex
                docente: item.descDoc,
                nota: item.descNota.split('</span>&nbsp;')[1].trim(), // Estrae la nota, prende il testo dopo </span>&nbsp; e toglie gli spazi iniziali e finali
                letta: toBool(item.isLetta, 'True'),
                lettaDa: item.vistatoUtente,
                lettaIl: splitDateTime(item.vistatoData),
            });

        }

        result.push({
            quadrimestre: quadrimestre.descFrazione,
            note: note
        });

    }

    return result;
}