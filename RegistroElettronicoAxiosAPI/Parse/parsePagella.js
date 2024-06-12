/**
 * 
 * 
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti gli argomenti ragguppati per giorno
 * 
 */

module.exports = function parsePagella(rawData) {

    console.log(rawData);

    let result = []

    for (let i = 0; i < rawData.length; i++) {                      // Per ogni quadrimestre (2)
        
        let defPath = rawData[i].materie;
        let materie = []
        let voti = [];

        for (let j = 0; j < defPath.length; j++) {                   // Per ogni materia (n)

            const materiaData = {
                materia: defPath[j].descMat,
                voto: defPath[j].mediaVoti,                          // Non è la media dei voti, ma il voto finale
                recupero: defPath[j].tipoRecupero,                   // TODO: Da testare
                giudizio: defPath[j].giudizio,
                assenze: Number(defPath[j].assenze)
            }

            materie.push(materiaData)
            voti.push(Number(defPath[j].mediaVoti))
        }

        result.push({
            quadrimestre: rawData[i].descFrazione,
            media: Math.floor( (voti.reduce((a, b) => a + b, 0) / voti.length) * 100) / 100,        // Media dei voti arrotondata a 2 decimali
            esito: rawData[i].esito,
            giudizio: rawData[i].giudizio,
            materie: materie
        })
        
    }

    return result;
}