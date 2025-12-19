import { convertLookup } from "@/utils";

/**
 * Parsea i dati dei voti in una struttura più comoda
 * @param {Array} rawData - Dati grezzi dei voti presi dall'API di Axios
 * @returns {Array} Array contenente tutti i voti e altre informazioni riguardanti essi
 */
export default function parseVoti(rawData) {

    const result = [];

    const tipoVotoLettere = ['T', 'S', 'G', 'O', 'P', 'A']; // Axios usa un formato di merda per i tipi di voto, quindi li converto in qualcosa di leggibile
    const tipoVotoDesc = ['Tutti', 'Scritto', 'Grafico', 'Orale', 'Pratico', 'Unico'];

    for (const quadrimestre of rawData) { // Per ogni quadrimestre (2)

        for (const item of quadrimestre.voti) {

            result.push({
                id: item.idVoto,
                materia: item.descMat,
                tipo: convertLookup(item.tipo, tipoVotoLettere, tipoVotoDesc), // Converte la lettera in un tipo di voto leggibile
                voto: item.voto,
                peso: item.peso,
                data: item.data,
                commento: item.commento,
                professore: item.docente
            });
        }
    }

    return result;
}