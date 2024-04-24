/**
 * 
 * 
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti i compiti e altre informzioni riguardanti essi
 * 
 */

module.exports = function parseCompiti(rawData) {

    const tipoLett = ['U', 'E', 'G']
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

        let ReqDaAuth = {
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

        result.richiesteDaAutorizzare.push(ReqDaAuth);
    }



    // *Richieste Non Autorizzate*

    for (let i = 0; i < rawData.richiesteNonAutorizzate.length; i++) {

        let defPath = rawData.richiesteNonAutorizzate[i]

        let ReqNonAuth = {
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

        result.richiesteNonAutorizzate.push(ReqNonAuth);

    }


    
    // *Permessi Non Autorizzate*

    for (let i = 0; i < rawData.permessiDaAutorizzare.length; i++) {

        let defPath = rawData.permessiDaAutorizzare[i]

        let PermDaAuth = {
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

        result.permessiDaAutorizzare.push(PermDaAuth);

    }



    // *Permessi Autorizzati*

    for (let i = 0; i < rawData.permessiAutorizzati.length; i++) {

        let defPath = rawData.permessiAutorizzati[i]

        let PermAuth = {
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

        result.permessiAutorizzati.push(PermAuth);

    }

    return result;

}
