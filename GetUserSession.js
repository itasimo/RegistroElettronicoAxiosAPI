const AxiosEncode = require('./utils/Axios/encode');
const AxiosDecode = require('./utils/Axios/decode');
const VendorToken = require('./utils/Axios/axios.json').VendorToken;

/**
 * 
 * @param {String} CF   Codice Fiscale della scuola
 * @param {String} CU   Codice Utente
 * @param {String} PWD  Password
 * @returns 
 */
module.exports = async function GetUserSession(CF, CU, PWD){

    let studenteInfo = {};

    // JSON con le credenziali
    // TODO: Prendere automaticamnte il VendorToken
    const jsonCredenziali = {
        "sCodiceFiscale": CF,
        "sUserName": CU,
        "sPassword": PWD,
        "sAppName": "ALU_APP",
        "sVendorToken": VendorToken
    };

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
		    .catch((error) => console.error(error));

    return studenteInfo.response.usersession;
};