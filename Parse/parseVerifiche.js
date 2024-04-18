/**
 * 
 * 
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutte le verifiche e altre informzioni riguardanti essi
 * 
 */

module.exports = function parseCompiti(rawData) {
    var result = []


    for (
            let i = rawData.findIndex(obj => obj.tipo_nota == '6'); // Trova l'indice del prima verifica

            i < rawData.length;

            i++

        ) {


            let verifica = {
                materia: rawData[i].descMat,
                verifica: rawData[i].descCompiti.split('</b>')[1].trim(),
                giorno: [
                    rawData[i].data.split(' ')[0],
                    rawData[i].data.split(' ')[1]
                ],
                pubblicato: [
                    rawData[i].data_pubblicazione.split(' ')[0],
                    rawData[i].data_pubblicazione.split(' ')[1]
                ],
            }
    
            result.push(verifica)
    
        }
    
        return result;
}