import AxiosClient from './AxiosClient.js';
import { encode } from '@/utils';
import * as parsers from '@/parsing';
import packageInfo from '@/../package.json' with { type: 'json' };

/**
 * Main API class for Axios interactions
 */
export default class AxiosAPI {
    constructor() {
        this.client = new AxiosClient();
        this.codiceFiscale = null;
        this.usersession = null;
        this.apiVersion = packageInfo.version;
    }

    /**
     * Performs login and stores session
     * @param {String} codiceFiscale - School fiscal code
     * @param {String} codiceUtente - User code
     * @param {String} password - User password
     * @returns {Object} Login response with user session and student info
     */
    async login(codiceFiscale, codiceUtente, password) {
        const result = await this.client.login(codiceFiscale, codiceUtente, password);
        this.codiceFiscale = codiceFiscale;
        this.usersession = result.usersession;
        return result;
    }

    /**
     * Checks if the user is logged in
     * @returns {Boolean} True if logged in, false otherwise
     */
    get isLoggedIn() {
        return this.usersession !== null;
    }

    /**
     * Gets the school fiscal code
     * @returns {String|null} The fiscal code or null if not set
     */
    get getCodiceFiscale() {
        return this.codiceFiscale;
    }

    /**
     * Gets the user session identifier
     * @returns {String|null} The user session or null if not logged in
     */
    get getUserSession() {
        return this.usersession;
    }

    /**
     * Gets the vendor token from the client
     * @returns {String} The vendor token
     */
    get getVendorToken() {
        return this.client.vendorToken;
    }

    /**
     * Gets the base URL from the client
     * @returns {String} The base URL
     */
    get getBaseURL() {
        return this.client.baseURL;
    }

    /**
     * Gets the API version
     * @returns {String} The API version
     */
    get getAPIVersion() {
        return this.apiVersion;
    }

    /**
     * Gets the Axios client instance
     * @returns {AxiosClient} The client instance
     */
    get getClient() {
        return this.client;
    }

    /**
     * Gets the API instance (self-reference)
     * @returns {AxiosAPI} The API instance
     */
    get getAPIInstance() {
        return this;
    }

    /**
     * Creates student info object for API requests
     * @param {String} usersession - Optional usersession (uses stored if not provided)
     * @returns {Object} Student info object
     */
    getStudentInfo(usersession = null) {
        if (!this.codiceFiscale || !this.usersession) {
            this.#handleNoLogin();
        }
        return {
            CodiceFiscale: this.codiceFiscale,
            SessionGuid: usersession || this.usersession,
            VendorToken: this.client.vendorToken
        };
    }

    /**
     * Retrieves data based on action type
     * @param {String} azione - Action to perform
     * @param {String} usersession - Optional usersession (uses stored if not provided)
     * @returns {Object} Parsed response data
     */
    async get(azione, usersession = null) {
        if (!this.codiceFiscale || !this.usersession || usersession === null) {
            this.#handleNoLogin();
        }
        const session = usersession || this.usersession;
        const studentInfo = this.getStudentInfo(session);
        
        // Action configuration map
        const actions = {
            compiti: { action: 'GET_COMPITI_MASTER', parser: parsers.parseCompiti, path: '[0].compiti' },
            verifiche: { action: 'GET_COMPITI_MASTER', parser: parsers.parseVerifiche, path: '[0].compiti' },
            voti: { action: 'GET_VOTI_LIST_DETAIL', parser: parsers.parseVoti },
            comunicazioni: { action: 'GET_COMUNICAZIONI_MASTER', parser: parsers.parseComunicazioni, path: '[0]', customParse: true },
            permessi: { action: 'GET_AUTORIZZAZIONI_MASTER', parser: parsers.parsePermessi, path: '[0]' },
            orario: { action: 'GET_ORARIO_MASTER', parser: parsers.parseOrario, path: '[0].orario' },
            argomenti: { action: 'GET_ARGOMENTI_MASTER', parser: parsers.parseArgomenti, path: '[0].argomenti' },
            assenze: { action: 'GET_ASSENZE_MASTER', parser: parsers.parseAssenze },
            note: { action: 'GET_NOTE_MASTER', parser: parsers.parseNote },
            curriculum: { action: 'GET_CURRICULUM_MASTER', parser: parsers.parseCurriculum, path: '[0].curriculum' },
            pagella: { action: 'GET_PAGELLA_MASTER', parser: parsers.parsePagella },
            studente: { action: 'GET_STUDENTI', parser: parsers.parseStudente, path: '[0]' }
        };

        const normalizedAction = azione.toLowerCase().replace(/\s/g, '');
        const config = actions[normalizedAction];

        if (!config) {
            throw new Error("Azione non supportata");
        }

        // Fetch raw data
        const rawData = await this.client.get(config.action, studentInfo, "FAM");
        
        // Extract data using path if provided
        let data = rawData;
        if (config.path) {
            const pathParts = config.path.match(/\[(\d+)\]|\.(\w+)/g);
            for (const part of pathParts) {
                if (part.startsWith('[')) {
                    const index = parseInt(part.slice(1, -1));
                    data = data[index];
                } else {
                    data = data[part.slice(1)];
                }
            }
        }

        // Handle special parsing case for comunicazioni
        if (config.customParse && normalizedAction === 'comunicazioni') {
            const fullData = rawData[0];
            return config.parser(fullData.comunicazioni, fullData.idAlunno);
        }

        return config.parser(data);
    }

    /**
     * Retrieves timeline for a specific date
     * @param {String} data - Date in format "dd/mm/yyyy"
     * @param {String} usersession - Optional usersession (uses stored if not provided)
     * @returns {Object} Parsed timeline data
     */
    async getTimeline(data, usersession = null) {
        if (!this.codiceFiscale || !this.usersession || usersession === null) {
            this.#handleNoLogin();
        }
        const session = usersession || this.usersession;
        const studentInfo = this.getStudentInfo(session);
        
        const rawData = await this.client.get(
            'GET_TIMELINE',
            studentInfo,
            "FAM",
            { dataGiorno: data }
        );

        return parsers.parseTimeline(rawData[0]);
    }

    /**
     * Marks a communication as read
     * @param {Object} data - Communication data (id, idAlunno)
     * @param {String} usersession - Optional usersession (uses stored if not provided)
     * @returns {String} Response status
     */
    async segnaComunicazioneLetta(data, usersession = null) {
        if (!this.codiceFiscale || !this.usersession || usersession === null) {
            this.#handleNoLogin();
        }
        const session = usersession || this.usersession;
        
        const requestData = {
            sCodiceFiscale: this.codiceFiscale,
            sSessionGuid: session,
            sCommandJSON: {
                sApplication: "FAM",
                sService: "APP_PROCESS_QUEUE",
                sModule: "COMUNICAZIONI_READ",
                data: data
            },
            sVendorToken: this.client.vendorToken
        };

        const requestBody = encode(requestData, 0);
        const response = await this.client.post(requestBody);

        return response.response === null ? "Comunicazione già letta" : JSON.stringify(response.response);
    }

    /**
     * Replies to a communication
     * @param {Object} data - Communication reply data
     * @param {String} usersession - Optional usersession (uses stored if not provided)
     * @returns {Object} Response from server
     */
    async rispondiComunicazione(data, usersession = null) {
        if (!this.codiceFiscale || !this.usersession || usersession === null) {
            this.#handleNoLogin();
        }
        const session = usersession || this.usersession;
        
        const requestData = {
            sCodiceFiscale: this.codiceFiscale,
            sSessionGuid: session,
            sCommandJSON: {
                sApplication: "FAM",
                sService: "APP_PROCESS_QUEUE",
                sModule: "COMUNICAZIONI_RISPOSTA",
                data: data
            },
            sVendorToken: this.client.vendorToken
        };

        const requestBody = encode(requestData, 0);
        const response = await this.client.post(requestBody);

        if (response.errorcode == -1) {
            throw new Error(`Axios ha risposto con un errore: "${response.errormessage}"`);
        }

        return response;
    }

    #handleNoLogin() {
        throw new Error("Effettuare il login prima di chiamare questo metodo.");
    }
}
