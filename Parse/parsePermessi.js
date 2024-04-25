/**
 * 
 * 
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente:
 *                  - richiesteDaAutorizzare: richieste di permessi da autorizzare; **+18**
 *                  - richiesteNonAutorizzate: richieste di permessi non autorizzate; **+18**
 *                  - permessiDaAutorizzare: permessi da autorizzare;
 *                  - permessiAutorizzati: permessi autorizzati;
 * 
 */

module.exports = function parsePermessi(rawData) {

    const tipoLett = ['U', 'E', 'G']                                                    // Axios usa un formato di merda per i tipi di uscite, quindi li converto in qualcosa di leggibile
    const tipoStr = ['Uscita Anticipata', 'Entrata Posticipata', 'Uscita Didattica']


    let result = {
        richiesteDaAutorizzare: [],
        richiesteNonAutorizzate: [],
        permessiDaAutorizzare: [],
        permessiAutorizzati: []
    }


    // *Richieste Da Autorizzare*

    for (let i = 0; i < rawData.richiesteDaAutorizzare.length; i++) {

        let defPath = rawData.richiesteDaAutorizzare[i]

        let struct = {
            data:[
                defPath.dataInizio,
                defPath.dataFine
            ],
            tipo: tipoStr[ tipoLett.indexOf( defPath.tipo ) ],
            ora: defPath.ora,
            orario: defPath.orario,
            motivo: defPath.motivo,
            note: defPath.note,
            diClasse: defPath.classe == "True" ? true : false,
            calcolato: defPath.calcolo == "True" ? true : false,
            giustificato: defPath.giustificato == "True" ? true : false,
            info: {
                inseritoDa: defPath.utenteInserimento,
                autorizzatoDa: defPath.utenteAutorizzazione,
                autorizzatoIl: defPath.dataAutorizzazione
            }
        }

        result.richiesteDaAutorizzare.push(struct);
    }



    // *Richieste Non Autorizzate*

    for (let i = 0; i < rawData.richiesteNonAutorizzate.length; i++) {

        let defPath = rawData.richiesteNonAutorizzate[i]

        let struct = {
            data:[
                defPath.dataInizio,
                defPath.dataFine
            ],
            tipo: tipoStr[ tipoLett.indexOf( defPath.tipo ) ],
            ora: defPath.ora,
            orario: defPath.orario,
            motivo: defPath.motivo,
            note: defPath.note,
            diClasse: defPath.classe == "True" ? true : false,
            calcolato: defPath.calcolo == "True" ? true : false,
            giustificato: defPath.giustificato == "True" ? true : false,
            info: {
                inseritoDa: defPath.utenteInserimento,
                autorizzatoDa: defPath.utenteAutorizzazione,
                autorizzatoIl: defPath.dataAutorizzazione
            }
        }

        result.richiesteNonAutorizzate.push(struct);

    }


    
    // *Permessi Non Autorizzate*

    for (let i = 0; i < rawData.permessiDaAutorizzare.length; i++) {

        let defPath = rawData.permessiDaAutorizzare[i]

        let struct = {
            data:[
               defPath.dataInizio,
               defPath.dataFine
            ],
            tipo: tipoStr[ tipoLett.indexOf(defPath.tipo ) ],
            ora:defPath.ora,
            orario:defPath.orario,
            motivo:defPath.motivo,
            note:defPath.note,
            diClasse:defPath.classe == "True" ? true : false,
            calcolato:defPath.calcolo == "True" ? true : false,
            giustificato:defPath.giustificato == "True" ? true : false,
            info: {
                inseritoDa:defPath.utenteInserimento,
                autorizzatoDa:defPath.utenteAutorizzazione,
                autorizzatoIl:defPath.dataAutorizzazione
            }
        }

        result.permessiDaAutorizzare.push(struct);

    }



    // *Permessi Autorizzati*

    for (let i = 0; i < rawData.permessiAutorizzati.length; i++) {

        let defPath = rawData.permessiAutorizzati[i]

        let struct = {
            data:[
                defPath.dataInizio,
                defPath.dataFine
            ],
            tipo: tipoStr[ tipoLett.indexOf( defPath.tipo ) ],
            ora: defPath.ora,
            orario: defPath.orario,
            motivo: defPath.motivo,
            note: defPath.note,
            diClasse: defPath.classe == "True" ? true : false,
            calcolato: defPath.calcolo == "True" ? true : false,
            giustificato: defPath.giustificato == "True" ? true : false,
            info: {
                inseritoDa: defPath.utenteInserimento,
                autorizzatoDa: defPath.utenteAutorizzazione,
                autorizzatoIl: defPath.dataAutorizzazione
            }
        }

        result.permessiAutorizzati.push(struct);

    }

    return result;

}
