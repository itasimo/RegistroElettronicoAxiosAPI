/**
 * 
 * 
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti gli argomenti ragguppati per giorno
 * 
 */

module.exports = function parseCurriculum(rawData) {

    let result = []

    for (let i = 0; i < rawData.length; i++) {
        const currData = {
            codiceMeccanografico: rawData[i].idPlesso,          // Es: CRAA123456Z
            scuola: rawData[i].descScuola,
            indirizzo: rawData[i].descCorso,
            annoScolastico: rawData[i].annoScolastico.split('/'),
            classe: rawData[i].classe,
            sezione: rawData[i].sezione,
            esito: rawData[i].descEsito,
            crediti: rawData[i].credito == '' ? 0 : rawData[i].credito
        }

        result.push(currData)
    }

    return result;
}