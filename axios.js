
const modules = {
    GetUserSession: require("./GetUserSession.js"),
    parseCompiti: require("./Parse/parseCompiti.js"),
    parseVoti: require("./Parse/parseVoti.js"),
    parseVerifiche: require("./Parse/parseVerifiche.js"),
    parseComunicazioni: require("./Parse/parseComunicazioni.js"),
    AxiosEncode: require('./utils/Axios/encode.js'),
    AxiosDecode: require('./utils/Axios/decode.js')
}

const VendorToken = require('./utils/Axios/axios.json').VendorToken;

let SessionId

/**
 * 
 * Codice generato da Postman (https://www.postman.com/)
 * 
 * @param {String} Action Azione da eseguire
 * @param {String} Cookies Cookies contenti SessionID e altri eventuali dati
 * @param {String} body Corpo della chiamata contenente informazioni sul formato della risposta
 * @returns JSON non analizzato contenete la risposta
 */

async function AxiosAPI(Action, StudentInfo, Application) {
    var raw_JSON

    const myHeaders = new Headers();
    myHeaders.append("X-Requested-With", "com.axiositalia.re.students");
    myHeaders.append("Cookie", "ASP.NET_SessionId=YOUR_ASPNET_SESSION_ID_HERE");
    
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

    return JSON.stringify(modules.AxiosDecode(raw_JSON).response)
}

/**
 * 
 * @param {String} CodiceFiscale Codice Fiscale della Scuola
 * @param {String} CodiceUtente Codice dell' Utente
 * @param {String} Password Password dell'utente
 * @param {String} Azione Azione che si vuole effettuare:
 *                          - **"Compiti"**: contiene tutti i compiti pubblicati fino al momento della chiamata e informazioni riguardanti: materia, data di consegna, compito, professore;
 *                          - **"Verifiche"**: contiene tutte le verifiche pubblicate fino al momento della chiamata e informazioni riguardanti: materia, data della verifica, argomenti della verifica, professore;
 *                          - **"Voti"**: contiene tutti i voti pubblicati fino al momento della chiamata e informazioni riguardanti: materia, tipo di voto, voto, data, eventuali commenti, professore;
 * @returns {JSON} JSON contenete la risposta
 */

module.exports = async function RegistroElettronicoAxiosAPI(CodiceFiscale, CodiceUtente, Password, Azione) {

    SessionId = await modules.GetUserSession(CodiceFiscale, CodiceUtente, Password)

    const Compiti = {
        Action: 'GET_COMPITI_MASTER',           // Restituisce tutti i compiti e verifiche pubblicati fino al momento della chiamata
        StudentInfo: {
            CodiceFiscale: CodiceFiscale,
            SessionGuid: SessionId,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Verifiche = {                         // Uguale a Compiti, poiché vengono retituiti sia compiti che verifiche, l'ho messo per chiarezza
        Action: 'GET_COMPITI_MASTER',           // Restituisce tutti i compiti e verifiche pubblicati fino al momento della chiamata
        StudentInfo: {
            CodiceFiscale: CodiceFiscale,
            SessionGuid: SessionId,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Voti = {
        Action: 'GET_VOTI_LIST_DETAIL',
        StudentInfo: {
            CodiceFiscale: CodiceFiscale,
            SessionGuid: SessionId,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }

    const Comunicazioni = {
        Action: 'GET_COMUNICAZIONI_MASTER',
        StudentInfo: {
            CodiceFiscale: CodiceFiscale,
            SessionGuid: SessionId,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }

    switch (Azione) {
        case 'Compiti':
            
            var compitiRaw = JSON.parse(await AxiosAPI(Compiti.Action, Compiti.StudentInfo, Compiti.Application))[0].compiti

            return  modules.parseCompiti(compitiRaw)

        case 'Voti':

            var VotiRaw = JSON.parse(await AxiosAPI(Voti.Action, Voti.StudentInfo, Voti.Application))       // Restituisce i voti del 1° e del 2° quadrimestre

            return  modules.parseVoti(VotiRaw)

        case 'Verifiche':

            var verificheRaw = JSON.parse(await AxiosAPI(Verifiche.Action, Verifiche.StudentInfo, Verifiche.Application))[0].compiti

            return  modules.parseVerifiche(verificheRaw)

        case 'Comunicazioni':

            var comunicazioniRaw = JSON.parse(await AxiosAPI(Comunicazioni.Action, Comunicazioni.StudentInfo, Comunicazioni.Application))[0].comunicazioni  // Restituisce le comunicazioni del quadrimestre corrente

            return  modules.parseComunicazioni(comunicazioniRaw)

        default:
            throw new Error("Azione non supportata")
    }
}

