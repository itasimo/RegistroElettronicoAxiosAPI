import { convertLookup } from "@/utils";

/**
 * Parsea i dati dell'orario in una struttura più comoda
 * @param {Array} rawData - Dati grezzi dell'orario presi dall'API di Axios
 * @returns {Array} Array contenente tutti gli orari delle lezioni divisi per giorno (se inseriti dai docenti)
 */
export default function parseOrario(rawData) {

    const result = [];

    const giornoLett = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6']; // Axios usa un formato di merda per GIORNI ( ** TF, WHY ** ), quindi li converto in qualcosa di leggibile
    const giornoStr = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

    for (const item of rawData) {

        const orario = [];

        for (const materia of item.materie) {

            orario.push({
                ora: materia.ora,
                durata: [materia.da, materia.a],
                materia: materia.descMat,
                docente: materia.descDoc
            });
        }

        const structGiorno = {
            giorno: convertLookup(item.giorno, giornoLett, giornoStr),
            orario: orario
        };

        result.push(structGiorno);
    }

    return result;
}