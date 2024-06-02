/**
 * 
 * 
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti gli argomenti ragguppati per giorno
 * 
 */

module.exports = function parseNote(rawData) {

    const tipoLett = ['C', 'S']                                                         // Axios usa un formato di merda per segnare note/ritardi/..., quindi li converto in qualcosa di leggibile

    const tipoStr = ['Classe', 'Studente']


    let result = [];

    for (let quadrimestre = 0; quadrimestre < rawData.length; quadrimestre++) {         // Per ogni quadrimestre (2)

        let note = [];

        for (let i = 0; i < rawData[quadrimestre].note.length; i++) {                   // Per ogni nota

            let defPath = rawData[quadrimestre].note[i];

            note.push({
                data: defPath.data,
                tipo: tipoStr[ tipoLett.indexOf( defPath.tipo ) ],
                tipoNota: new RegExp("<b>(.*?)<\/b>", "gm").exec(defPath.descNota)[1], // Estrae il tipo di nota, prende il testo tra <b> e </b> cioè il gruppo matchato dal regex
                docente: defPath.descDoc,
                nota: defPath.descNota.split('</span>&nbsp;')[1].trim(),               // Estrae la nota, prende il testo dopo </span>&nbsp; e toglie gli spazi iniziali e finali
                letta: defPath.isLetta == 'True' ? true : false,
                lettaDa: defPath.vistatoUtente,
                lettaIl: defPath.vistatoData.split(' '),
            })

        }


        result.push({
            "quadrimestre": rawData[quadrimestre].descFrazione,
            "note": note
        })

    }

    return result;
}