import { convertLookup, toBool, removeSeconds } from "@/utils";

/**
 * Parsea i dati delle assenze in una struttura più comoda
 * @param {Array} rawData - Dati grezzi delle assenze presi dall'API di Axios
 * @returns {Array} Array di assenze divise per quadrimestre
 */
export default function parseAssenze(rawData) {
    
    const tipoLett = ['T', 'A', 'U', 'R', 'E']; // Axios usa un formato di merda per segnare assenze/ritardi/..., quindi li converto in qualcosa di leggibile
    const tipoStr = ['Tutte', 'Assenza', 'Uscita anticipata', 'Ritardo', 'Rientri'];

    const giustNum = ['1', '2']; // Axios usa un formato di merda per segnare da chi è giustificata l'assenza, quindi li converto in qualcosa di leggibile
    const giustStr = ['Genitore/Tutore', 'Docente'];

    const result = [];

    for (const quadrimestre of rawData) { // Per ogni quadrimestre (2)
        const assenze = [];

        for (const assenza of quadrimestre.assenze) { // Per ogni assenza

            assenze.push({
                id: assenza.id, // ID univoco dell'assenza
                data: assenza.data, // Data dell'assenza
                tipo: convertLookup(assenza.tipo, tipoLett, tipoStr),
                ora: assenza.oralez ? assenza.oralez : '', // Se è presente ora di lezione e orario (caso di ritardo o uscita anticipata) li metto altrimenti (caso di assenze) li lascio vuoti
                orario: assenza.ora ? removeSeconds(assenza.ora) : '', // Rimuove i secondi che sono sempre 00
                motivo: assenza.motivo,
                calcolata: toBool(assenza.calcolata, '1'), // Converte "1"/"0" in true/false
                giustificabile: toBool(assenza.giustificabile, '1'), // Converte "1"/"0" in true/false
                giustificata: !toBool(assenza.tipogiust, '0'), // Se non è giustificata allora tipogiust è 0
                giustificataDa: convertLookup(assenza.tipogiust, giustNum, giustStr),
                giustficataData: assenza.datagiust,
            });
        }

        result.push({
            quadrimestre: quadrimestre.descFrazione,
            assenze: assenze
        });
    }

    return result;
}