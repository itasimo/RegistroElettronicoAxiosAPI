/**
 * 
 * #### Voti
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti i voti e altre informzioni riguardanti essi
 * 
 */



export default function parseVoti(rawData) {

    var result = []

    const tipoVotoLettere = ['T', 'S', 'G', 'O', 'P', 'A']                              // Axios usa un formato di merda per i tipi di voto, quindi li converto in qualcosa di leggibile
    const tipoVotoDesc = ['Tutti', 'Scritto', 'Grafico', 'Orale', 'Pratico', 'Unico']

    for (let i = 0; i < rawData.length; i++) {               // Lo so che è brutto, ma è solo per i due quadrimestri, quindi non dovrebbe causare problemi

        for (let j = 0; j < rawData[i].voti.length; j++) {

            let defPath = rawData[i].voti[j]

            result.push({
                materia: defPath.descMat,
                tipo: tipoVotoDesc[ tipoVotoLettere.indexOf( defPath.tipo ) ], // Converte la lettera in un tipo di voto leggibile
                voto: defPath.voto,
                peso: defPath.peso,
                data: defPath.data,
                commento: defPath.commento,
                professore: defPath.docente
            })
        }

    }

    return result;
}