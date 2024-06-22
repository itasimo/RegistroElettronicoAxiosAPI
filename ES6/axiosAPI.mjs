const modules = {
    GetUserSession,
    toSessionID,
    parseCompiti,
    parseVoti,
    parseVerifiche,
    parseComunicazioni,
    parsePermessi,
    parseOrario,
    parseArgomenti,
    parseAssenze,
    parseNote,
    parseCurriculum,
    parsePagella,
    parseTimeline,
    AxiosEncode,
    AxiosDecode
};

import GetUserSession from "./GetUserSession.mjs";
import toSessionID from "./toSessionID.mjs";
import parseCompiti from "./Parse/parseCompiti.mjs";
import parseVoti from "./Parse/parseVoti.mjs";
import parseVerifiche from "./Parse/parseVerifiche.mjs";
import parseComunicazioni from "./Parse/parseComunicazioni.mjs";
import parsePermessi from "./Parse/parsePermessi.mjs";
import parseOrario from "./Parse/parseOrario.mjs";
import parseArgomenti from "./Parse/parseArgomenti.mjs";
import parseAssenze from "./Parse/parseAssenze.mjs";
import parseNote from "./Parse/parseNote.mjs";
import parseCurriculum from "./Parse/parseCurriculum.mjs";
import parsePagella from "./Parse/parsePagella.mjs";
import parseTimeline from "./Parse/parseTimeline.mjs";
import AxiosEncode from './utils/Axios/encode.mjs';
import AxiosDecode from './utils/Axios/decode.mjs';

const AxiosJSON_URL = "https://raw.githubusercontent.com/Itasimo/RegistroElettronicoAxiosAPI/main/AxiosJSON/axios.json";
let AxiosJSON;
await fetch(AxiosJSON_URL).then(response => response.json()).then(data => AxiosJSON = data)

const VendorToken = AxiosJSON.VendorToken;
let sCodiceFiscale; // Salvo il codice fiscale per non doverlo passare ogni volta nella funzione

/**
 * 
 * Codice generato da Postman (https://www.postman.com/)
 * 
 * Funzione per effettuare chiamate all'API di Axios (APP MOBILE)
 * 
 * @param {String} Action       Azione da eseguire
 * @param {JSON} StudentInfo    Informazioni dello studente (Codice Fiscale (Scuola), SessionGuid, VendorToken)
 * @param {String} Application  Applicazione (FAM)
 * @param {JSON} AddedData      Dati aggiuntivi da passare all'API (Opzionale)
 * @returns 
 */

async function AxiosAPI(Action, StudentInfo, Application, AddedData = {}) {
    var raw_JSON

    const myHeaders = new Headers();
    myHeaders.append("X-Requested-With", "com.axiositalia.re.students");
    
    const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
    };

    const requestInfo = {
        sCodiceFiscale: StudentInfo.CodiceFiscale,
        sSessionGuid: StudentInfo.SessionGuid,
        sCommandJSON: {
            sApplication: Application,
            sService: Action,
            data: AddedData
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
 * Funzione per effettuare chiamate all'API di Axios (WEB) **[WORK IN PROGRESS]**
 * @param {String} Action Azione da eseguire
 * @param {String} usersession usersession dell'utente (MOBILE) (Verrà convertito nel cookie SessionID per la chiamata WEB)
 * @returns JSON non analizzato contenete la risposta
 * 
*/

async function AxiosAPI_WEB(Action, usersession) {
    var raw_HTML                                                                                    // Risposta grezza dell'API di axios

    WEB_requestParemeters = await modules.toSessionID(sCodiceFiscale, usersession)                  // Converti il usersession nel cookie SessionID per la chiamata WEB

    console.log("");
    console.log(WEB_requestParemeters.s);

    console.log(WEB_requestParemeters.cookie.name + "=" + WEB_requestParemeters.cookie.value);
    console.log("");

    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
    myHeaders.append("accept-encoding", "gzip, deflate, br, zstd");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("connection", "keep-alive");
    myHeaders.append("content-type", "application/json; charset=utf-8");
    myHeaders.append("cookie", WEB_requestParemeters.cookie.name + "=" + WEB_requestParemeters.cookie.value);
    myHeaders.append("host", "registrofamiglie.axioscloud.it");
    myHeaders.append("referer", "https://registrofamiglie.axioscloud.it/Pages/SD/SD_Dashboard.aspx?s=" + WEB_requestParemeters.s);
    myHeaders.append("rvt", "Q0I4NDQzOTA1ODhENDVBNUI2N0UxMDdBN0M3MTIzMEY=");
    myHeaders.append("sec-ch-ua", "\"Android WebView\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"");
    myHeaders.append("sec-ch-ua-mobile", "?1");
    myHeaders.append("sec-ch-ua-platform", "\"Android\"");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("user-agent", "Mozilla/5.0 (Linux; Android 13; 2201117SY Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.165 Mobile Safari/537.36");
    myHeaders.append("x-requested-with", "XMLHttpRequest");
    
    const requestOptions = {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow"
    };
    
    await fetch("https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=" + Action, requestOptions)
                    .then((response) => response.text())
                    .then((result) => console.log(result))
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

export async function RE_AxiosAPI_Get(usersession, Azione) {

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
    const Curriculum = {
        Action: 'GET_CURRICULUM_MASTER',
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const Pagella = {
        Action: 'GET_PAGELLA_MASTER',
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

    Azione = Azione.toLowerCase().replace(/\s/g, '') // Rimuove gli spazi e mette tutto in minuscolo

    switch (Azione) {
        case 'compiti':
            
            var compitiRaw = JSON.parse(await AxiosAPI(Compiti.Action, Compiti.StudentInfo, Compiti.Application))[0].compiti

            return modules.parseCompiti(compitiRaw);

        case 'voti':

            var VotiRaw = JSON.parse(await AxiosAPI(Voti.Action, Voti.StudentInfo, Voti.Application))       // Restituisce i voti del 1° e del 2° quadrimestre

            return modules.parseVoti(VotiRaw);

        case 'verifiche':

            var verificheRaw = JSON.parse(await AxiosAPI(Verifiche.Action, Verifiche.StudentInfo, Verifiche.Application))[0].compiti

            return modules.parseVerifiche(verificheRaw);

        case 'comunicazioni':

            var comunicazioniRaw = JSON.parse(await AxiosAPI(Comunicazioni.Action, Comunicazioni.StudentInfo, Comunicazioni.Application))[0].comunicazioni  // Restituisce le comunicazioni del quadrimestre corrente

            return modules.parseComunicazioni(comunicazioniRaw);
        
        case 'permessi':

            var PermessiRaw = JSON.parse(await AxiosAPI(Permessi.Action, Permessi.StudentInfo, Permessi.Application))[0]

            return modules.parsePermessi(PermessiRaw);

        case 'orario':

            var OrarioRaw = JSON.parse(await AxiosAPI(Orario.Action, Orario.StudentInfo, Orario.Application))[0].orario

            return modules.parseOrario(OrarioRaw);
        
        case 'argomenti':

            var ArgomentiRaw = JSON.parse(await AxiosAPI(Argomenti.Action, Argomenti.StudentInfo, Argomenti.Application))[0].argomenti

            return modules.parseArgomenti(ArgomentiRaw);

        case 'assenze':
                
            var AssenzeRaw = JSON.parse(await AxiosAPI(Assenze.Action, Assenze.StudentInfo, Assenze.Application))
    
            return modules.parseAssenze(AssenzeRaw);

        case 'note':
                
            var NoteRaw = JSON.parse(await AxiosAPI(Note.Action, Note.StudentInfo, Note.Application))
    
            return modules.parseNote(NoteRaw);

        case 'curriculum':

            var CurriculumRaw = JSON.parse(await AxiosAPI(Curriculum.Action, Curriculum.StudentInfo, Curriculum.Application))[0].curriculum

            return modules.parseCurriculum(CurriculumRaw);
        
        case 'pagella':

            var PagellaRaw = JSON.parse(await AxiosAPI(Pagella.Action, Pagella.StudentInfo, Pagella.Application))

            return modules.parsePagella(PagellaRaw);

        case 'j':
            return await AxiosAPI_WEB(h.Action, h.SessionGuid)

        default:
            throw new Error("Azione non supportata")
    }
}


/**
 * 
 * ### Timeline
 * 
 * @param {String} usersession Variabile di sessione dell'utente
 * @param {String} data Data in formato "gg/mm/aaaa" per la quale si vuole ottenere la timeline degli eventi
 * @returns 
 */

export async function RE_AxiosAPI_Get_Timeline(usersession, data) {

    const Timeline = {
        Action: 'GET_TIMELINE',
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        data: {
            dataGiorno: data
        },
        Application: "FAM"
    }

    var TimelineRaw = JSON.parse(await AxiosAPI(Timeline.Action, Timeline.StudentInfo, Timeline.Application, Timeline.data))[0]

    return modules.parseTimeline(TimelineRaw)
}



/**
 * Funzione per effettuare il login all'API di Axios
 * @param {String} CodiceFiscale Codice Fiscale della Scuola
 * @param {String} CodiceUtente Codice dell' Utente
 * @param {String} Password Password dell'utente
 * 
 * @returns {String} usersession necessario per effettuare le chiamate all'API
 */

export async function RE_AxiosAPI_Login(CodiceFiscale, CodiceUtente, Password) {
    sCodiceFiscale = CodiceFiscale
    return await modules.GetUserSession(CodiceFiscale, CodiceUtente, Password)
}