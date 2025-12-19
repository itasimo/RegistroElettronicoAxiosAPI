import { encode, decode, toTitleCase } from '../utils';
import { VendorToken } from '@/configs';

/**
 * Client for making HTTP requests to Axios API
 */
export default class AxiosClient {
    constructor() {
        this.vendorToken = VendorToken;
        this.baseURL = 'https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc';
    }

    /**
     * Makes a GET request to retrieve data
     * @param {String} action - Action to perform
     * @param {Object} studentInfo - Student information (CodiceFiscale, SessionGuid, VendorToken)
     * @param {String} application - Application name (e.g., "FAM")
     * @param {Object} addedData - Additional data to pass
     * @returns {Object} Parsed response
     */
    async get(action, studentInfo, application, addedData = {}) {
        const myHeaders = new Headers();
        myHeaders.append("X-Requested-With", "com.axiositalia.re.students");
        
        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        const requestInfo = {
            sCodiceFiscale: studentInfo.CodiceFiscale,
            sSessionGuid: studentInfo.SessionGuid,
            sCommandJSON: {
                sApplication: application,
                sService: action,
                data: addedData
            },
            sVendorToken: studentInfo.VendorToken
        };

        const response = await fetch(
            `${this.baseURL}/RetrieveDataInformation?json=${encode(requestInfo)}`,
            requestOptions
        );

        const rawJSON = await response.text();
        const finalJSON = decode(rawJSON);

        if (finalJSON.errorcode == -1) {
            throw new Error(`Axios ha risposto con un errore: "${finalJSON.errormessage}"`);
        }
        
        return finalJSON.response;
    }

    /**
     * Makes a POST request to execute a command
     * @param {String} requestBody - Request body to send
     * @returns {Object} Parsed response
     */
    async post(requestBody) {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({ JsonRequest: requestBody }),
            redirect: "follow"
        };

        const response = await fetch(`${this.baseURL}/ExecuteCommand`, requestOptions);
        const rawJSON = await response.text();
        
        return decode(rawJSON);
    }

    /**
     * Performs login and returns user session
     * @param {String} codiceFiscale - School fiscal code
     * @param {String} codiceUtente - User code
     * @param {String} password - User password
     * @returns {Object} User session and student info
     */
    async login(codiceFiscale, codiceUtente, password) {
        const myHeaders = new Headers();
        myHeaders.append("X-Requested-With", "com.axiositalia.re.students");

        const credentials = {
            sCodiceFiscale: codiceFiscale,
            sUserName: codiceUtente,
            sPassword: password,
            sAppName: "ALU_APP",
            sVendorToken: this.vendorToken
        };

        const url = `${this.baseURL}/Login2?json=${encode(credentials, 2)}`;

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        const response = await fetch(url, requestOptions);
        const rawJSON = await response.text();
        const studenteInfo = decode(rawJSON);

        if (studenteInfo.errormessage) {
            throw new Error(`Axios ha risposto con un errore: "${studenteInfo.errormessage}"`);
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
    }
}
