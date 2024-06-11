const modules = {
    GetUserSession: require("./GetUserSession.js"),
    toSessionID: require("./toSessionID.js"),
    parseCompiti: require("./Parse/parseCompiti.js"),
    parseVoti: require("./Parse/parseVoti.js"),
    parseVerifiche: require("./Parse/parseVerifiche.js"),
    parseComunicazioni: require("./Parse/parseComunicazioni.js"),
    parsePermessi: require("./Parse/parsePermessi.js"),
    parseOrario: require("./Parse/parseOrario.js"),
    parseArgomenti: require("./Parse/parseArgomenti.js"),
    parseAssenze: require("./Parse/parseAssenze.js"),
    parseNote: require("./Parse/parseNote.js"),

    AxiosEncode: require('./utils/Axios/encode.js'),
    AxiosDecode: require('./utils/Axios/decode.js')
}

const VendorToken = require('./utils/Axios/axios.json').VendorToken;
let sCodiceFiscale; // Salvo il codice fiscale per non doverlo passare ogni volta nella funzione


/**
 * 
 * Codice generato da Postman (https://www.postman.com/)
 * 
 * Funzione per effettuare chiamate all'API di Axios (APP MOBILE)
 * 
 * @param {String} Action Azione da eseguire
 * @param {String} Cookies Cookies contenti usersession e altri eventuali dati
 * @param {String} body Corpo della chiamata contenente informazioni sul formato della risposta
 * @returns JSON non analizzato contenete la risposta
 */

async function AxiosAPI(Action, StudentInfo, Application) {
    var raw_JSON

    const myHeaders = new Headers();
    myHeaders.append("X-Requested-With", "com.axiositalia.re.students");
    
    const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
    };

    requestInfo = {
        sCodiceFiscale: StudentInfo.CodiceFiscale,
        sSessionGuid: StudentInfo.SessionGuid,
        sCommandJSON: {
            sApplication: Application,
            sService: Action
        },
        sVendorToken: StudentInfo.VendorToken
    }

    await fetch("https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation?json=" + modules.AxiosEncode(requestInfo), requestOptions) //Endpoint
            .then(response => response.text())
            .then(result => raw_JSON  = result)
            .catch(error => console.log('error', error));

    return JSON.stringify(modules.AxiosDecode(raw_JSON).response) // Restituisce la risposta senza codice o messaggio di errore
}


/**
 * Funzione per effettuare chiamate all'API di Axios (WEB)
 * @param {String} Action Azione da eseguire
 * @param {String} usersession usersession dell'utente (MOBILE) (Verrà convertito nel cookie SessionID per la chiamata WEB)
 * @returns JSON non analizzato contenete la risposta
 * 
*/

async function AxiosAPI_WEB(Action, usersession) {
    var raw_HTML                                                                              // Risposta grezza dell'API di axios

    WEB_requestParemeters = await modules.toSessionID(sCodiceFiscale, usersession)                 // Converti il usersession nel cookie SessionID per la chiamata WEB

    console.log("");
    console.log(WEB_requestParemeters.s);

    console.log(WEB_requestParemeters.cookie.name + "=" + WEB_requestParemeters.cookie.value);
    console.log("");

    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-encoding", "gzip, deflate, br, zstd");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("cache-control", "max-age=0");
    myHeaders.append("connection", "keep-alive");
    myHeaders.append("cookie", WEB_requestParemeters.cookie.name + "=" + WEB_requestParemeters.cookie.value);
    myHeaders.append("host", "registrofamiglie.axioscloud.it");
    myHeaders.append("sec-ch-ua", "\"Android WebView\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"");
    myHeaders.append("sec-ch-ua-mobile", "?1");
    myHeaders.append("sec-ch-ua-platform", "\"Android\"");
    myHeaders.append("sec-fetch-dest", "document");
    myHeaders.append("sec-fetch-mode", "navigate");
    myHeaders.append("sec-fetch-site", "cross-site");
    myHeaders.append("upgrade-insecure-requests", "1");
    myHeaders.append("user-agent", "Mozilla/5.0 (Linux; Android 13; 2201117SY Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.148 Mobile Safari/537.36");
    myHeaders.append("x-requested-with", "com.axiositalia.re.students");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    await fetch(`https://registrofamiglie.axioscloud.it/Pages/SD/SD_Dashboard.aspx?s=${WEB_requestParemeters.s}&Action=${Action}`, requestOptions)
        .then((response) => response.text())
        .then((result) => raw_HTML = result)
        .catch((error) => console.error(error));

    return raw_HTML // Restituisce la risposta senza codice o messaggio di errore
}

/**
 * Funzione per effettuare chiamate all'API di Axios
 * @param {String} usersession usersession dell'utente
 * @param {String} Azione Azione che si vuole effettuare:
 *                          - **"Compiti"**: contiene tutti i compiti pubblicati fino al momento della chiamata e informazioni riguardanti: materia, data di consegna, compito, professore;
 *                          - **"Verifiche"**: contiene tutte le verifiche pubblicate fino al momento della chiamata e informazioni riguardanti: materia, data della verifica, argomenti della verifica, professore;
 *                          - **"Voti"**: contiene tutti i voti pubblicati fino al momento della chiamata e informazioni riguardanti: materia, tipo di voto, voto, data, eventuali commenti, professore;
 * @returns {JSON} JSON contenete la risposta
 */

module.exports.RegistroElettronicoAxiosAPI_Get = async function(usersession, Azione) {

    const Compiti = {
        Action: 'GET_COMPITI_MASTER',           // Restituisce tutti i compiti e verifiche pubblicati fino al momento della chiamata
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Verifiche = {                         // Uguale a Compiti, poiché vengono retituiti sia compiti che verifiche, l'ho messo per chiarezza
        Action: 'GET_COMPITI_MASTER',           // Restituisce tutti i compiti e verifiche pubblicati fino al momento della chiamata
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Voti = {
        Action: 'GET_VOTI_LIST_DETAIL',
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Comunicazioni = {
        Action: 'GET_COMUNICAZIONI_MASTER',
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Permessi = {
        Action: 'GET_AUTORIZZAZIONI_MASTER',
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Orario = {
        Action: 'GET_ORARIO_MASTER',
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Argomenti = {
        Action: 'GET_ARGOMENTI_MASTER',
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Assenze = {
        Action: 'GET_ASSENZE_MASTER',
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Note = {
        Action: 'GET_NOTE_MASTER',
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const h = {
        Action: 'FAMILY_COMUNICAZIONI',
        SessionGuid: usersession
    }

    Azione = Azione.toLowerCase()

    switch (Azione) {
        case 'compiti':
            
            var compitiRaw = JSON.parse(await AxiosAPI(Compiti.Action, Compiti.StudentInfo, Compiti.Application))[0].compiti

            return  modules.parseCompiti(compitiRaw)

        case 'voti':

            var VotiRaw = JSON.parse(await AxiosAPI(Voti.Action, Voti.StudentInfo, Voti.Application))       // Restituisce i voti del 1° e del 2° quadrimestre

            return  modules.parseVoti(VotiRaw)

        case 'verifiche':

            var verificheRaw = JSON.parse(await AxiosAPI(Verifiche.Action, Verifiche.StudentInfo, Verifiche.Application))[0].compiti

            return  modules.parseVerifiche(verificheRaw)

        case 'comunicazioni':

            var comunicazioniRaw = JSON.parse(await AxiosAPI(Comunicazioni.Action, Comunicazioni.StudentInfo, Comunicazioni.Application))[0].comunicazioni  // Restituisce le comunicazioni del quadrimestre corrente

            return  modules.parseComunicazioni(comunicazioniRaw)
        
        case 'permessi':

            var PermessiRaw = JSON.parse(await AxiosAPI(Permessi.Action, Permessi.StudentInfo, Permessi.Application))[0]

            return  modules.parsePermessi(PermessiRaw)

        case 'orario':

            var OrarioRaw = JSON.parse(await AxiosAPI(Orario.Action, Orario.StudentInfo, Orario.Application))[0].orario

            return  modules.parseOrario(OrarioRaw)
        
        case 'argomenti':

            var ArgomentiRaw = JSON.parse(await AxiosAPI(Argomenti.Action, Argomenti.StudentInfo, Argomenti.Application))[0].argomenti

            return  modules.parseArgomenti(ArgomentiRaw)

        case 'assenze':
                
                var AssenzeRaw = JSON.parse(await AxiosAPI(Assenze.Action, Assenze.StudentInfo, Assenze.Application))
    
                return  modules.parseAssenze(AssenzeRaw)

        case 'note':
                
                var NoteRaw = JSON.parse(await AxiosAPI(Note.Action, Note.StudentInfo, Note.Application))
    
                return  modules.parseNote(NoteRaw)

        case 'j':
            return await AxiosAPI_WEB(h.Action, h.SessionGuid)

        default:
            throw new Error("Azione non supportata")
    }
}





/**
 * Funzione per effettuare il login all'API di Axios
 * @param {String} CodiceFiscale Codice Fiscale della Scuola
 * @param {String} CodiceUtente Codice dell' Utente
 * @param {String} Password Password dell'utente
 * 
 * @returns {String} usersession necessario per effettuare le chiamate all'API
 */

module.exports.RegistroElettronicoAxiosAPI_Login = async function(CodiceFiscale, CodiceUtente, Password) {
    sCodiceFiscale = CodiceFiscale
    return await modules.GetUserSession(CodiceFiscale, CodiceUtente, Password)
}