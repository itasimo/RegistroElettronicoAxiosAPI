/**
 * 
 * #### Pagella
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti i dati della pagella divisi per quadrimestre
 * 
 */

module.exports = function parsePagella(rawData) {

    let result = []

    for (let i = 0; i < rawData.length; i++) {                      // Per ogni quadrimestre (2)
        
        let defPath = rawData[i].materie;
        let materie = []
        let voti = [];

        for (let j = 0; j < defPath.length; j++) {                   // Per ogni materia (n)

            const materiaData = {
                materia: defPath[j].descMat,
                voto: defPath[j].mediaVoti,                          // Non è la media dei voti, ma il voto finale
                debito: defPath[j].schedaCarenza ? {                 // Se c'è un debito
                    motivo: defPath[j].schedaCarenza.motivo,                        // Motivo del debito
                    argomenti: defPath[j].schedaCarenza.rilevate,                   // Argomenti su cui si ha il debito
                    modRecupero: defPath[j].schedaCarenza.modalitaRecupero,         // Modalità di recupero
                    tipoVerifica: defPath[j].schedaCarenza.verifica,                // Tipo della verifica di recupero
                    dataVerifica: defPath[j].schedaCarenza.dataVerifica,            // Data della verifica di recupero
                    argVerifica: defPath[j].schedaCarenza.verificaArgomenti,        // Argomenti della verifica di recupero
                    giudizioVerifica: defPath[j].schedaCarenza.verificaGiudizio     // Giudizio della verifica di recupero
                } : {},
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
            giudizio: rawData[i].giudizio.replace(/\<(.*?)\>/gm, ''),                               // Rimuove i tag HTML
            materie: materie,
            dataVisualizzazione: rawData[i].dataVisualizzazione,
            URL: rawData[i].URL,
            letta: rawData[i].letta === 'S' ? true : false,
            visibile: rawData[i].visibile === 'true' ? true : false
        })
        
    }

    return result;
}