/**
 * 
 * 
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti i compiti e altre informzioni riguardanti essi
 * 
 */

module.exports = function parseCompiti(rawData) {
    var result = []


    for (
            let i = 0;

            i < rawData.findIndex(obj => obj.tipo_nota == '6'); // Trova l'indice del prima verifica

            i++

        ) {


        let compito = {
            materia: rawData[i].descMat,
            compito: rawData[i].descCompiti,
            giorno: [
                rawData[i].data.split(' ')[0],
                rawData[i].data.split(' ')[1]
            ],
            pubblicato: [
                rawData[i].data_pubblicazione.split(' ')[0],
                rawData[i].data_pubblicazione.split(' ')[1]
            ],
        }

        result.push(compito)

    }

    return result;
}
