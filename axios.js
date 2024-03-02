
const modules = {
    GetUserSession: require("./GetUserSession.js"),
    parseCompiti: require("./Parse/parseCompiti.js"),
    parseVoti: require("./Parse/parseVoti.js"),
    parseVerifiche: require("./Parse/parseVerifiche.js"),
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
 * @returns JSON contenete la risposta
 */

module.exports = async function RegistroElettronicoAxiosAPI(CodiceFiscale, CodiceUtente, Password, Azione) {

    SessionId = await modules.GetUserSession(CodiceFiscale, CodiceUtente, Password)

    const Compiti = {
        Action: 'GET_COMPITI_MASTER',
        StudentInfo: {
            CodiceFiscale: CodiceFiscale,
            SessionGuid: SessionId,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Verifiche = {
        Action: 'FAMILY_REGISTRO_CLASSE_COMPITI_LISTA',
        Cookies: "ASP.NET_SessionId="+ SessionId + "; Path=/; Secure; HttpOnly;",
        body: "{\"draw\":1,\"columns\":{},\"order\":[],\"start\":0,\"length\":-1,\"search\":{\"value\":\"\",\"regex\":false},\"iMatId\":\"\"}"
    }
    const Voti = {
        Action: 'FAMILY_VOTI_ELENCO_LISTA',
        Cookies: "ASP.NET_SessionId="+ SessionId + "; Path=/; Secure; HttpOnly;",
        body: "{\"draw\":1,\"columns\":{},\"order\":[],\"start\":0,\"length\":-1,\"search\":{\"value\":\"\",\"regex\":false},\"iMatId\":\"\",\"frazione\":\"uPiKweV3jQncViK72kP+QpJf+DWCv5XeTYnULt+zgqtncwKHJMfOnj7Sx/IWAVZDGJjSugVF/4AIMFPN9z4H6G4ZjWk=\"}"
    }

    switch (Azione) {
        case 'Compiti':
            return JSON.parse(await AxiosAPI(Compiti.Action, Compiti.StudentInfo, Compiti.Application))[0].compiti
        case 'Voti':
            return modules.parseVoti(await AxiosAPI(Voti.Action, Voti.Cookies, Voti.body))
        case 'Verifiche':
            return modules.parseVerifiche(await AxiosAPI(Verifiche.Action, Verifiche.Cookies, Verifiche.body))
        default:
            throw new Error("Azione non supportata")
    }
}

