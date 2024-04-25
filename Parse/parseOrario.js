/**
 * 
 * 
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutte le verifiche e altre informzioni riguardanti essi
 * 
 */

module.exports = function parseOrario(rawData) {

    let result = []

    const giornoLett = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6']                                 // Axios usa un formato di merda per GIORNI ( ** TF, WHY ** ), quindi li converto in qualcosa di leggibile
    const giornoStr = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']


    for (let i = 0; i < rawData.length; i++) {

        let orario = []

        for (let j = 0; j < rawData[i].materie.length; j++) {

            let defPath = rawData[i].materie[j]

            let structOra = {
                ora: defPath.ora,
                durata: [defPath.da, defPath.a],
                materia: defPath.descMat,
                docente: defPath.descDoc
            }

            orario.push(structOra)
        }



        let structGiorno = {
            giorno: giornoStr[ giornoLett.indexOf( rawData[i].giorno ) ],
            orario: orario
        }


        result.push(structGiorno)
    }


    return result;
}