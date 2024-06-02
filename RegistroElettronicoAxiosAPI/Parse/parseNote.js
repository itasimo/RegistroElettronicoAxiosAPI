/**
 * 
 * 
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti gli argomenti ragguppati per giorno
 * 
 */

module.exports = function parseNote(rawData) {

    const tipoLett = ['C', 'S']                                                        // Axios usa un formato di merda per segnare note/ritardi/..., quindi li converto in qualcosa di leggibile

    const tipoStr = ['Clsse', 'Studente']


    let result = [];

    for (let quadrimestre = 0; quadrimestre < rawData.length; quadrimestre++) {             // Per ogni quadrimestre (2)

        let note = [];

        for (let i = 0; i < rawData[quadrimestre].note.length; i++) {    // Per ogni nota

            let defPath = rawData[quadrimestre].note[i];

            note.push({
                data: defPath.data,
                tipo: tipoStr[ tipoLett.indexOf( defPath.tipo ) ],
                ora: defPath.oralez ? defPath.oralez :'',                                   // Se è presente ora di lezione e orario (caso di ritardo o uscita anticipata) li metto altrimenti (caso di note) li lascio vuoti
                orario: defPath.ora ? defPath.ora.split(':').slice(0, 2).join(':') : '',    // Rimuove i secondi che sono sempre 00
                motivo: defPath.motivo,
                calcolata: defPath.calcolo == '1' ? true : false,
                giustificabile: defPath.giustificabile == '1' ? true : false,
                giustificata: defPath.tipogiust == '0' ? false : true,                      // Se non è giustificata allora tipogiust è 0
                giustificataDa: giustStr[ giustNum.indexOf( defPath.tipogiust ) ],
                giustficataData: defPath.datagiust,
            })
        }


        result.push({
            "quadrimestre": rawData[quadrimestre].descFrazione,
            "note": note
        })

    }

    return result;
}