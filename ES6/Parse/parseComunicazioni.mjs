/**
 * 
 * #### Comunicazioni (quadrimestre corrente)
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @param {String} alunnoID - ID dell'alunno necessario per richieste di conferma di lettura o risposta
 * @returns {JSON} JSON contente tutte le comunicazioni compresi i link ai file allegati
 * 
 */



export default function parseComunicazioni(rawData, alunnoID) {

    const tipoNum = ['1', '4', '5']
    const tipoStr = ['Circolare', 'Scuola/Famiglia', 'Comunicazione']
    var result = []

    for (let i = 0; i < rawData.length; i++) {

        let allegatiCircolare = []

        for (let j = 0; j < rawData[i].allegati.length; j++) {

            let defPath = rawData[i].allegati[j]

            allegatiCircolare.push({
                nome: defPath.sourceName,
                desc: defPath.desc,
                downloadLink: defPath.URL
            })
        }



        result.push({
            data: rawData[i].data,
            titolo: rawData[i].titolo,
            testo: rawData[i].desc.replace(/\<(.*?)\>/gm, ''),   // Estrae il testo dal codice HTML
            id: rawData[i].id,
            idAlunno: alunnoID,
            tipo: tipoStr[ tipoNum.indexOf( rawData[i].tipo ) ], // Converte la lettera in un tipo di voto leggibile
            letta: rawData[i].letta == "S"? true : false,
            allegati: allegatiCircolare,
            prevedeRisposta: rawData[i].tipo_risposta == "0"? false : true,
            opzioniRisposta: rawData[i].opzioni.split('|'),
        })
    }

    return result;
}