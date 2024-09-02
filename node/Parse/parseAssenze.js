/**
 * 
 * #### Assenze
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti le assenze divise per quadrimestre
 * 
 */

module.exports = function parseAssenze(rawData) {
    
    const tipoLett = ['T', 'A', 'U', 'R', 'E']                                                 // Axios usa un formato di merda per segnare assenze/ritardi/..., quindi li converto in qualcosa di leggibile
    const tipoStr = ['Tutte', 'Assenza', 'Uscita anticipata', 'Ritardo', 'Rientri']

    const giustNum = ['1', '2']                                                        // Axios usa un formato di merda per segnare da chi è giustificata l'assenza, quindi li converto in qualcosa di leggibile
    const giustStr = ['Genitore/Tutore', 'Docente']

    let result = [];

    for (let quadrimestre = 0; quadrimestre < rawData.length; quadrimestre++) {             // Per ogni quadrimestre (2)
        let assenze = [];

        for (let assenza = 0; assenza < rawData[quadrimestre].assenze.length; assenza++) {  // Per ogni assenza

            let defPath = rawData[quadrimestre].assenze[assenza];

            assenze.push({
                id: defPath.id,
                data: defPath.data,
                tipo: tipoStr[ tipoLett.indexOf( defPath.tipo ) ],
                ora: defPath.oralez ? defPath.oralez :'',                                   // Se è presente ora di lezione e orario (caso di ritardo o uscita anticipata) li metto altrimenti (caso di assenze) li lascio vuoti
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
            "assenze": assenze
        })

    }

    return result;
}