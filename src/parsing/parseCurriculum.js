/**
 * Parsea i dati del curriculum in una struttura più comoda
 * @param {Array} rawData - Dati grezzi del curriculum presi dall'API di Axios
 * @returns {Array} Array contenente tutte le informazioni riguardanti il curriculum scolastico dello studente
 */
export default function parseCurriculum(rawData) {

    const result = [];

    for (const item of rawData) {
        const currData = {
            codiceMeccanografico: item.idPlesso, // Es: CRAA123456Z
            scuola: item.descScuola,
            indirizzo: item.descCorso,
            annoScolastico: item.annoScolastico.split('/'),
            classe: item.classe.toString(),
            sezione: item.sezione,
            esito: item.descEsito,
            crediti: item.credito == '' ? 0 : Number(item.credito)
        };

        result.push(currData);
    }

    return result;
}