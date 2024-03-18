/**
 * 
 * 
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti i voti e altre informzioni riguardanti essi
 * 
 */



module.exports = function parseVoti(rawData) {

    var result = []

    const tipoVotoLettere = ['T', 'S', 'G', 'O', 'P', 'A']
    const tipoVotoDesc = ['Tutti', 'Scritto', 'Grafico', 'Orale', 'Pratico', 'Altro']

    for (let i = 0; i < rawData.length; i++) {               // Lo so che è brutto, ma è solo per i due quadrimestri, quindi non dovrebbe causare problemi

        for (let j = 0; j < rawData[i].voti.length; j++) {

            var Voto = {
                materia: rawData[i].voti[j].descMat,
                tipoVoto: tipoVotoDesc[ tipoVotoLettere.indexOf( rawData[i].voti[j].tipo ) ], // Converte la lettera in un tipo di voto leggibile
                voto: rawData[i].voti[j].voto,
                peso: rawData[i].voti[j].peso,
                data: rawData[i].voti[j].data,
                commento: rawData[i].voti[j].commento,
                professore: rawData[i].voti[j].docente
            }

            result.push(Voto)
        }

    }

    return result;
}