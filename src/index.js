import AxiosAPI from './api/AxiosAPI.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load vendor token from config
const axiosConfig = JSON.parse(readFileSync(join(__dirname, '../AxiosJSON/axios.json'), 'utf-8'));
const VendorToken = axiosConfig.VendorToken;

// Create and export API instance
const api = new AxiosAPI(VendorToken);

export default api;

// Export class for custom instances
export { AxiosAPI };



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

    var raw_JSON;

    await fetch("https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation?json=" + modules.AxiosEncode(requestInfo), requestOptions) //Endpoint
            .then(response => response.text())
            .then(result => raw_JSON  = result)
            .catch(error => console.log('error', error));

    const finalJSON = modules.AxiosDecode(raw_JSON)

    if(finalJSON.errorcode == -1) throw new Error(`\n    Axios ha risposto con un errore: "${finalJSON.errormessage}"\n\n`)
    
    return JSON.stringify(finalJSON.response) // Restituisce la risposta senza codice o messaggio di errore
}







/**
 * Funzione per effettuare richieste POST all'API di Axios
 * @param {String} requestBody Richiesta da inviare all'API
 * @returns JSON non analizzato contenete la risposta
 * 
 */

async function AxiosPOST(requestBody) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        JsonRequest: requestBody
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    var raw_JSON;

    await fetch("https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/ExecuteCommand", requestOptions)
        .then(response => response.text())
        .then(result => raw_JSON  = result)
        .catch(error => console.log('error', error));

    const finalJSON = modules.AxiosDecode(raw_JSON)

    return finalJSON // Restituisce la risposta con codice o messaggio di errore
}







/**
 * Funzione per effettuare chiamate all'API di Axios (WEB) **[WORK IN PROGRESS]**
 * @param {String} Action Azione da eseguire
 * @param {String} usersession usersession dell'utente (MOBILE) (Verrà convertito nel cookie SessionID per la chiamata WEB)
 * @returns JSON non analizzato contenete la risposta
 * 
*/

async function AxiosAPI_WEB(Action, usersession) {
    let HTML_raw                                                                              // Salvo la risposta grezza dell'API di Axios in HTML

    const SessionID = await modules.toSessionID(sCodiceFiscale, usersession)                  // Converti il usersession nel cookie SessionID per la chiamata WEB

    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html, */*; q=0.01");
    myHeaders.append("accept-encoding", "gzip, deflate, br, zstd");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("connection", "keep-alive");
    myHeaders.append("content-type", "application/json; charset=utf-8");
    myHeaders.append("host", "scuoladigitale.axioscloud.it");
    myHeaders.append("referer", "https://scuoladigitale.axioscloud.it/");
    myHeaders.append("rvt", "Rjc3MEI1RTMwNkJDNjNBMTM3Q0EwQzQ3OEY0NkMxRTU=");
    myHeaders.append("sec-ch-ua", "\"Not)A;Brand\";v=\"99\", \"Android WebView\";v=\"127\", \"Chromium\";v=\"127\"");
    myHeaders.append("sec-ch-ua-mobile", "?1");
    myHeaders.append("sec-ch-ua-platform", "\"Android\"");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("user-agent", "Mozilla/5.0 (Linux; Android 13; 2201117SY Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.64 Mobile Safari/537.36");
    myHeaders.append("x-requested-with", "XMLHttpRequest");
    myHeaders.append("Cookie", `ASP.NET_SessionId=${SessionID}`); // Aggiungi il cookie SessionID alla richiesta

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    await fetch(`https://scuoladigitale.axioscloud.it/Pages/SD/SD_Ajax_Get.aspx?Action=${Action}&Others=undefined`, requestOptions)
            .then((response) => response.text())
            .then((result) => HTML_raw = result)
            .catch((error) => console.error(error));

    return HTML_raw;
}


















/**
 * Funzione per effettuare il login all'API di Axios
 * @param {String} CodiceFiscale Codice Fiscale della Scuola
 * @param {String} CodiceUtente Codice dell' Utente
 * @param {String} Password Password dell'utente
 * 
 * @returns {String} usersession necessario per effettuare le chiamate all'API
 */

module.exports.RE_AxiosAPI_Login = async function(CodiceFiscale, CodiceUtente, Password) {
    sCodiceFiscale = CodiceFiscale
    return await modules.GetUserSession(CodiceFiscale, CodiceUtente, Password)
}







/**
 * Funzione per effettuare chiamate all'API di Axios
 * @param {String} usersession usersession dell'utente
 * @param {String} Azione Azione che si vuole effettuare:
 *                          - **"Compiti"**: contiene tutti i compiti pubblicati fino al momento della chiamata e informazioni riguardanti: materia, data di consegna, compito, professore;
 *                          - **"Verifiche"**: contiene tutte le verifiche pubblicate fino al momento della chiamata e informazioni riguardanti: materia, data della verifica, argomenti della verifica, professore;
 *                          - **"Voti"**: contiene tutti i voti pubblicati fino al momento della chiamata e informazioni riguardanti: materia, tipo di voto, voto, data, eventuali commenti, professore;
 * 							- **Comunicazioni**: contiene tutte le comunicazioni del quadrimestre corrente pubblicate fino al momento della chiamata e informazioni riguardati: 
 * @returns {JSON} JSON contenete la risposta
 */

module.exports.RE_AxiosAPI_Get = async function(usersession, Azione) {

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
    const Studente = {
        Action: 'GET_STUDENTI',
        StudentInfo: {
            CodiceFiscale: sCodiceFiscale,
            SessionGuid: usersession,
            VendorToken: VendorToken
        },
        Application: "FAM"
    }
    const WEB_Profile = {
        Action: 'ProfileRead',
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

            var comunicazioniRaw = JSON.parse(await AxiosAPI(Comunicazioni.Action, Comunicazioni.StudentInfo, Comunicazioni.Application))[0]  // Restituisce le comunicazioni del quadrimestre corrente

            return modules.parseComunicazioni(comunicazioniRaw.comunicazioni, comunicazioniRaw.idAlunno);
        
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

        case 'studente':

            var studenteRaw = JSON.parse(await AxiosAPI(Studente.Action, Studente.StudentInfo, Studente.Application))[0]

            return modules.parseStudente(studenteRaw);

        case 'profile':
            return await AxiosAPI_WEB(WEB_Profile.Action, WEB_Profile.SessionGuid)

        default:
            throw new Error("Azione non supportata")
    }
}







/**
 * 
 * Funzione per segnare una comunicazione come letta
 * 
 * @param {String} usersession usersession dell'utente
 * @param {String} Action ID della comunicazione
 * @param {JSON} data ID dell'alunno
 * @returns Stato richiesta
 * 
 */
module.exports.RE_AxiosAPI_Post = async function(usersession, Action, data) {
    const Comunicazioni_Read = {
        sCodiceFiscale: sCodiceFiscale,
        sSessionGuid: usersession,
        sCommandJSON: {
            sApplication: "FAM",
            sService: "APP_PROCESS_QUEUE",
            sModule: "COMUNICAZIONI_READ",
            data: data
        },
        sVendorToken: VendorToken
    }
    const Comunicazioni_Reply = {
        sCodiceFiscale: sCodiceFiscale,
        sSessionGuid: usersession,
        sCommandJSON: {
            sApplication: "FAM",
            sService: "APP_PROCESS_QUEUE",
            sModule: "COMUNICAZIONI_RISPOSTA",
            data: data
        },
        sVendorToken: VendorToken
    }

    let response;

    switch (Action) {
        case 'comunicazioni_leggi':
            var requestBody = modules.AxiosEncode(Comunicazioni_Read, 0)
            response = JSON.stringify(await AxiosPOST(requestBody).response)

            return response == 'null' ? "Comunicazione già letta" : response

        case 'comunicazioni_rispondi':
            var requestBody = modules.AxiosEncode(Comunicazioni_Reply, 0)

            response = await AxiosPOST(requestBody)

            if (response.errorcode == -1) throw new Error(`\n    Axios ha risposto con un errore: "${response.errormessage}"\n\n`)

            return response

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

module.exports.RE_AxiosAPI_Get_Timeline = async function(usersession, data) {

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