/**
 * 
 * #### Permessi (e richieste di permessi)
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente:
 *                  - richiesteDaAutorizzare: richieste di permessi da autorizzare; **+18**
 *                  - richiesteNonAutorizzate: richieste di permessi non autorizzate; **+18**
 *                  - permessiDaAutorizzare: permessi da autorizzare;
 *                  - permessiAutorizzati: permessi autorizzati;
 * 
 */

export default function parsePermessi(rawData) {

    const tipoLett = ['A', 'U', 'E', 'G', 'D']                                                    // Axios usa un formato di merda per i tipi di uscite, quindi li converto in qualcosa di leggibile
    const tipoStr = ['Assenza', 'Uscita Anticipata', 'Entrata Posticipata', 'Uscita Didattica', 'DaD (Didattica a distanza)']


    let result = {
        richiesteDaAutorizzare: [],
        richiesteNonAutorizzate: [],
        permessiDaAutorizzare: [],
        permessiAutorizzati: []
    }


    // *Richieste Da Autorizzare*

    for (let i = 0; i < rawData.richiesteDaAutorizzare.length; i++) {

        let defPath = rawData.richiesteDaAutorizzare[i]

        result.richiesteDaAutorizzare.push({
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
            calcolata: defPath.calcolo == "True" ? true : false,
            giustificata: defPath.giustificato == "True" ? true : false,
            info: {
                inseritoDa: defPath.utenteInserimento,
                rispostoDa: defPath.utenteAutorizzazione,
                rispostoIl: defPath.dataAutorizzazione.split(" ")
            }
        });
    }



    // *Richieste Non Autorizzate*

    for (let i = 0; i < rawData.richiesteNonAutorizzate.length; i++) {

        let defPath = rawData.richiesteNonAutorizzate[i]

        result.richiesteNonAutorizzate.push({
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
            calcolata: defPath.calcolo == "True" ? true : false,
            giustificata: defPath.giustificato == "True" ? true : false,
            info: {
                inseritoDa: defPath.utenteInserimento,
                rispostoDa: defPath.utenteAutorizzazione,
                rispostoIl: defPath.dataAutorizzazione.split(" ")
            }
        });

    }


    
    // *Permessi Non Autorizzate*

    for (let i = 0; i < rawData.permessiDaAutorizzare.length; i++) {

        let defPath = rawData.permessiDaAutorizzare[i]

        result.permessiDaAutorizzare.push({
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
            calcolata:defPath.calcolo == "True" ? true : false,
            giustificata:defPath.giustificato == "True" ? true : false,
            info: {
                inseritoDa: defPath.utenteInserimento,
                rispostoDa: defPath.utenteAutorizzazione,
                rispostoIl: defPath.dataAutorizzazione.split(" ")
            }
        });

    }



    // *Permessi Autorizzati*

    for (let i = 0; i < rawData.permessiAutorizzati.length; i++) {

        let defPath = rawData.permessiAutorizzati[i]

        result.permessiAutorizzati.push({
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
            calcolata: defPath.calcolo == "True" ? true : false,
            giustificata: defPath.giustificato == "True" ? true : false,
            info: {
                inseritoDa: defPath.utenteInserimento,
                rispostoDa: defPath.utenteAutorizzazione,
                rispostoIl: defPath.dataAutorizzazione.split(" ")
            }
        });

    }

    return result;

}
