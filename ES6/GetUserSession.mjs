import AxiosEncode from './utils/Axios/encode.mjs';
import AxiosDecode from './utils/Axios/decode.mjs';

const AxiosJSON_URL = "https://raw.githubusercontent.com/Itasimo/RegistroElettronicoAxiosAPI/main/AxiosJSON/axios.json";
let AxiosJSON;
await fetch(AxiosJSON_URL).then(response => response.json()).then(data => AxiosJSON = data).catch((error) => {throw new Error(`Errore di connessione`)});
const VendorToken = AxiosJSON.VendorToken;

/**
 * 
 * https://stackoverflow.com/a/196991
 * 
 * Converts a string to title case.
 * Each word in the string will have its first letter capitalized and the rest in lowercase.
 *
 * @param {string} str - The string to be converted to title case.
 * @returns {string} - The converted title case string.
 */
function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

/**
 * 
 * @param {String} CF   Codice Fiscale della scuola
 * @param {String} CU   Codice Utente
 * @param {String} PWD  Password
 * @returns 
 */
export default async function GetUserSession(CF, CU, PWD){

    let studenteInfo = {};

    //  JSON con le credenziali per il login
    const jsonCredenziali = {
        "sCodiceFiscale": CF,
        "sUserName": CU,
        "sPassword": PWD,
        "sAppName": "ALU_APP",
        "sVendorToken": VendorToken
    };

    //  Endpoint per effettuare il login
    const url = 'https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/Login2?json=' + AxiosEncode(jsonCredenziali, 2);
    

    const myHeaders = new Headers();
    myHeaders.append("X-Requested-With", "com.axiositalia.re.students");

    const requestOptions = {
		  method: "GET",
		  headers: myHeaders,
		  redirect: "follow"
    };

    await fetch(url, requestOptions)
		    .then((response) => response.text())
		    .then((result) => studenteInfo = AxiosDecode(result))
		    .catch((error) => {throw new Error(`Errore di connessione`)});

    if(studenteInfo.errormessage){
        throw new Error(`\n    Axios ha risposto con un errore: "${studenteInfo.errormessage}"\n\n`);
    }


    return {
        usersession: studenteInfo.response.usersession,
        studente: {
            nome: toTitleCase(studenteInfo.response.nome),
            cognome: toTitleCase(studenteInfo.response.cognome),
            dataNascita: studenteInfo.response.dataNascita,
            QRCode: studenteInfo.response.sQR,
            idAlunno: studenteInfo.response.idAlunno,
            pin: {
                SD: studenteInfo.response.userPinSd,
                RE: studenteInfo.response.userPinRe
            }
        },
        attivo: studenteInfo.response.utenteAttivo,
    };
};