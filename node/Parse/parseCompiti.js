/**
 * 
 * #### Compiti
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti i compiti e altre informzioni riguardanti essi
 * 
 */

module.exports = function parseCompiti(rawData) {

    // Array che conterrà tutti i compiti
    var result = []


    // La risposta di axios è un array di oggetti, prima ci sono i compiti e poi le verifiche quindi inizia da 0 e finisce all'indice della prima verifica

    for (
            let i = 0;

            i < (rawData.findIndex(obj => obj.tipo_nota == '6') === -1 ? rawData.length : rawData.findIndex(obj => obj.tipo_nota == '6')); // Trova l'indice del prima verifica, da lì in poi ci sono verifiche

            i++

        ) {


        result.push({
            id: rawData[i].idCompito,
            materia: rawData[i].descMat,
            compito: rawData[i].descCompiti,
            perGiorno: rawData[i].data.split(' ')[0],
            pubblicato: [
                rawData[i].data_pubblicazione.split(' ')[0],
                rawData[i].data_pubblicazione.split(' ')[1]
            ],
        })

    }

    return result;
}
