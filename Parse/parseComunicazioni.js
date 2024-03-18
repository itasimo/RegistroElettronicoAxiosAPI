/**
 * 
 * 
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutte le comunicazioni compresi i link ai file allegati
 * 
 */



module.exports = function parseComunicazioni(rawData) {

    const tipoNum = ['1', '4', '5']
    const tipoStr = ['Circolare', 'Scuola/famiglia', 'Comunicazione']
    var result = []

    for (let i = 0; i < rawData.length; i++) {

        var allegatiCircolare = []

        for (let j = 0; j < rawData[i].allegati.length; j++) {

            var allegato = {
                nome: rawData[i].allegati[j].sourceName,
                desc: rawData[i].allegati[j].desc,
                downloadLink: rawData[i].allegati[j].URL
            }

            allegatiCircolare.push(allegato)
        }



        var Comunicazione = {
            data: rawData[i].data,
            titolo: rawData[i].titolo,
            testo: rawData[i].desc.replace(/\<(.*?)\>/gm, ''),   // Estrae il testo dal codice HTML
            id: rawData[i].id,
            tipo: tipoStr[ tipoNum.indexOf( rawData[i].tipo ) ], // Converte la lettera in un tipo di voto leggibile
            letta: rawData[i].letta == "S"? true : false,
            allegati: allegatiCircolare,
            prevedeRisposta: rawData[i].tipo_risposta == "0"? false : true,
            opzioniRisposta: rawData[i].opzioni.split('|'),
        }

        result.push(Comunicazione)
    }

    return result;
}