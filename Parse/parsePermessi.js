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

        let ReqDaAuth = {
            data:[
                rawData.richiesteDaAutorizzare[i].dataInizio,
                rawData.richiesteDaAutorizzare[i].dataFine
            ],
            tipo: tipoStr[ tipoLett.indexOf( rawData.richiesteDaAutorizzare[i].tipo ) ],
            ora: rawData.richiesteDaAutorizzare[i].ora,
            orario: rawData.richiesteDaAutorizzare[i].orario,
            motivo: rawData.richiesteDaAutorizzare[i].motivo,
            note: rawData.richiesteDaAutorizzare[i].note,
            diClasse: rawData.richiesteDaAutorizzare[i].classe == "True" ? true : false,
            calcolato: rawData.richiesteDaAutorizzare[i].calcolo == "True" ? true : false,
            giustificato: rawData.richiesteDaAutorizzare[i].giustificato == "True" ? true : false,
            info: {
                inseritoDa: rawData.richiesteDaAutorizzare[i].utenteInserimento,
                autorizzatoDa: rawData.richiesteDaAutorizzare[i].utenteAutorizzazione,
                autorizzatoIl: rawData.richiesteDaAutorizzare[i].dataAutorizzazione
            }
        }

        console.log(rawData.richiesteDaAutorizzare[i].tipo);

        result.richiesteDaAutorizzare.push(ReqDaAuth);
    }



    // *Richieste Non Autorizzate*

    for (let i = 0; i < rawData.richiesteNonAutorizzate.length; i++) {

        let ReqNonAuth = {
            data:[
                rawData.richiesteNonAutorizzate[i].dataInizio,
                rawData.richiesteNonAutorizzate[i].dataFine
            ],
            tipo: tipoStr[ tipoLett.indexOf( rawData.richiesteNonAutorizzate[i].tipo ) ],
            ora: rawData.richiesteNonAutorizzate[i].ora,
            orario: rawData.richiesteNonAutorizzate[i].orario,
            motivo: rawData.richiesteNonAutorizzate[i].motivo,
            note: rawData.richiesteNonAutorizzate[i].note,
            diClasse: rawData.richiesteNonAutorizzate[i].classe == "True" ? true : false,
            calcolato: rawData.richiesteNonAutorizzate[i].calcolo == "True" ? true : false,
            giustificato: rawData.richiesteNonAutorizzate[i].giustificato == "True" ? true : false,
            info: {
                inseritoDa: rawData.richiesteNonAutorizzate[i].utenteInserimento,
                autorizzatoDa: rawData.richiesteNonAutorizzate[i].utenteAutorizzazione,
                autorizzatoIl: rawData.richiesteNonAutorizzate[i].dataAutorizzazione
            }
        }

        console.log(rawData.richiesteNonAutorizzate[i].tipo);

        result.richiesteNonAutorizzate.push(ReqNonAuth);

    }


    
    // *Permessi Non Autorizzate*

    for (let i = 0; i < rawData.permessiDaAutorizzare.length; i++) {

        let PermDaAuth = {
            data:[
                rawData.permessiDaAutorizzare[i].dataInizio,
                rawData.permessiDaAutorizzare[i].dataFine
            ],
            tipo: tipoStr[ tipoLett.indexOf( rawData.permessiDaAutorizzare[i].tipo ) ],
            ora: rawData.permessiDaAutorizzare[i].ora,
            orario: rawData.permessiDaAutorizzare[i].orario,
            motivo: rawData.permessiDaAutorizzare[i].motivo,
            note: rawData.permessiDaAutorizzare[i].note,
            diClasse: rawData.permessiDaAutorizzare[i].classe == "True" ? true : false,
            calcolato: rawData.permessiDaAutorizzare[i].calcolo == "True" ? true : false,
            giustificato: rawData.permessiDaAutorizzare[i].giustificato == "True" ? true : false,
            info: {
                inseritoDa: rawData.permessiDaAutorizzare[i].utenteInserimento,
                autorizzatoDa: rawData.permessiDaAutorizzare[i].utenteAutorizzazione,
                autorizzatoIl: rawData.permessiDaAutorizzare[i].dataAutorizzazione
            }
        }

        console.log(rawData.permessiDaAutorizzare[i].tipo);

        result.permessiDaAutorizzare.push(PermDaAuth);

    }



    // *Permessi Autorizzati*

    for (let i = 0; i < rawData.permessiAutorizzati.length; i++) {

        let PermAuth = {
            data:[
                rawData.permessiAutorizzati[i].dataInizio,
                rawData.permessiAutorizzati[i].dataFine
            ],
            tipo: tipoStr[ tipoLett.indexOf( rawData.permessiAutorizzati[i].tipo ) ],
            ora: rawData.permessiAutorizzati[i].ora,
            orario: rawData.permessiAutorizzati[i].orario,
            motivo: rawData.permessiAutorizzati[i].motivo,
            note: rawData.permessiAutorizzati[i].note,
            diClasse: rawData.permessiAutorizzati[i].classe == "True" ? true : false,
            calcolato: rawData.permessiAutorizzati[i].calcolo == "True" ? true : false,
            giustificato: rawData.permessiAutorizzati[i].giustificato == "True" ? true : false,
            info: {
                inseritoDa: rawData.permessiAutorizzati[i].utenteInserimento,
                autorizzatoDa: rawData.permessiAutorizzati[i].utenteAutorizzazione,
                autorizzatoIl: rawData.permessiAutorizzati[i].dataAutorizzazione
            }
        }

        console.log(rawData.permessiAutorizzati[i].tipo);

        result.permessiAutorizzati.push(PermAuth);

    }

    return result;

}
