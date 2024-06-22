import AxiosEncode from './utils/Axios/encode.mjs';
import AxiosDecode from './utils/Axios/decode.mjs';

const AxiosJSON_URL = "https://raw.githubusercontent.com/Itasimo/RegistroElettronicoAxiosAPI/main/AxiosJSON/axios.json";
let AxiosJSON;
await fetch(AxiosJSON_URL).then(response => response.json()).then(data => AxiosJSON = data)
const VendorToken = AxiosJSON.VendorToken;

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

    return studenteInfo.response.usersession;
};