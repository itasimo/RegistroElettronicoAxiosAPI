import AxiosClient from "./AxiosClient.js";
import AxiosWEB from "./AxiosWEB.js";
import { encode } from "@/utils";
import * as parsers from "@/parsing";
import packageInfo from "@/../package.json" with { type: "json" };

/**
 * Classe API principale per le interazioni con Axios
 */
export default class AxiosAPI {
    constructor() {
        this.apiVersion = packageInfo.version;
        this.client = new AxiosClient();
        // pass a bound reference to the private #handleNoLogin so AxiosWEB can invoke it
        this.web = new AxiosWEB(this, this.#handleNoLogin.bind(this));
        this.codiceFiscale = null; // School fiscal code
        this.usersession = null; // User session identifier (APP)
        this.studentInfo = null; // Full student info object
        this.pin = null; // Student PIN
        this.isAccountActive = null; // Active account info
    }

    /**
     * Esegue il login e memorizza la sessione
     * @param {String} codiceFiscale - Codice fiscale della scuola
     * @param {String} codiceUtente - Codice utente
     * @param {String} password - Password dell'utente
     * @returns {Object} Risposta di login con sessione utente e informazioni dello studente
     */
    async login(codiceFiscale, codiceUtente, password) {
        const result = await this.client.login(
            codiceFiscale,
            codiceUtente,
            password
        );
        this.codiceFiscale = codiceFiscale;
        this.usersession = result.usersession;
        this.studentInfo = result.studente;
        this.pin = result.studente.pin;
        this.isAccountActive = result.utenteAttivo;

        return result;
    }

    /**
     * Verifica se l'utente è loggato
     * @returns {Boolean} True se loggato, false altrimenti
     */
    get isLoggedIn() {
        return this.usersession !== null;
    }

    /**
     * Ottiene il codice fiscale della scuola
     * @returns {String|null} Il codice fiscale o null se non impostato
     */
    get getCodiceFiscale() {
        return this.codiceFiscale;
    }

    /**
     * Ottiene l'identificatore della sessione utente
     * @returns {String|null} La sessione utente o null se non loggato
     */
    get getUserSession() {
        return this.usersession;
    }

    /**
     * Ottiene il token del fornitore dal client
     * @returns {String} Il token del fornitore
     */
    get getVendorToken() {
        return this.client.vendorToken;
    }

    /**
     * Ottiene il PIN dello studente
     * @returns {Object|null} L'oggetto PIN dello studente
     */
    get getPIN() {
        return this.pin;
    }

    /**
     * Ottiene lo stato di attivazione dell'account
     * @returns {Boolean|null} True se attivo, false se no, null se sconosciuto
     */
    get getIsAccountActive() {
        return this.isAccountActive;
    }

    /**
     * Ottiene le informazioni dello studente
     * @returns {Object|null} L'oggetto informazioni dello studente
     */
    get getStudentInfo() {
        return this.studentInfo;
    }

    /**
     * Ottiene l'URL base dal client
     * @returns {String} L'URL base
     */
    get getBaseURL() {
        return this.client.baseURL;
    }

    /**
     * Ottiene la versione dell'API
     * @returns {String} La versione dell'API
     */
    get getAPIVersion() {
        return this.apiVersion;
    }

    /**
     * Ottiene l'istanza del client Axios
     * @returns {AxiosClient} L'istanza del client
     */
    get getClientInstance() {
        return this.client;
    }

    /**
     * Ottiene l'istanza di AxiosWEB
     * @returns {AxiosWEB} L'istanza web
     */
    get getWebInstance() {
        return this.web;
    }

    /**
     * Ottiene l'istanza dell'API (autoreferenza)
     * @returns {AxiosAPI} L'istanza dell'API
     */
    get getAPIInstance() {
        return this;
    }

    /**
     * Ottiene le informazioni dello studente insieme ai dettagli della sessione
     * @returns {Object|null} Le informazioni dello studente con i dettagli della sessione
     */
    get getSessionInfo() {
        if (!this.isLoggedIn) {
            return null;
        }
        return {
            ...this.studentInfo,
            vendorToken: this.client.vendorToken,
            codiceFiscale: this.codiceFiscale,
            usersession: this.usersession,
            utenteAttivo: this.isAccountActive,
        };
    }

    /**
     * Costruisce le informazioni dello studente per le richieste
     * @param {String} codiceFiscale - Codice fiscale opzionale (usa quello memorizzato se non fornito)
     * @param {String} usersession - Usersession opzionale (usa quella memorizzata se non fornita)
     * @returns {Object} Oggetto informazioni dello studente per le richieste
     */
    #getStudentSessionData(codiceFiscale = null, usersession = null) {
        if (!(codiceFiscale || this.codiceFiscale) && (usersession || this.usersession)) {
            this.#handleNoLogin();
        }
        return {
            CodiceFiscale: codiceFiscale || this.codiceFiscale,
            SessionGuid: usersession || this.usersession,
            VendorToken: this.client.vendorToken
        };
    }

    /**
     * Recupera i dati in base al tipo di azione
     * @param {String} azione - Azione da eseguire
     * @param {String} codiceFiscale - Codice fiscale opzionale (usa quello memorizzato se non fornito)
     * @param {String} usersession - Usersession opzionale (usa quella memorizzata se non fornita)
     * @returns {Object} Dati di risposta analizzati
     * 
     * @description
     * Azioni supportate:
     * - compiti (Mobile/WEB)
     * - verifiche (Mobile/WEB)
     * - voti (Mobile/WEB)
     * - comunicazioni (Mobile/WEB)
     * - orario (Mobile/WEB)
     * - argomenti (Mobile/WEB)
     * - assenze (Mobile/WEB)
     * - note (Mobile/WEB)
     * - curriculum (Mobile/WEB)
     * - pagella (Mobile/WEB)
     * - permessi (Mobile)
     * - studente (Mobile)
     * 
     * Azioni disponibili solo in WEB:
     * - anagrafico (WEB)
     * - documenti (WEB)
     * - libri (WEB)
     * 
     * Azioni non supportate:
     * - deleghe (WEB, non supportata) - in attesa di contributo esterno
     * - colloqui (WEB, non supportata) - riservata ai genitori/tutori
     * - pagoscuola (WEB, non supportata) - in attesa di parser
     * - collabora (WEB, non supportata) - non ancora supportata
     * - sportello_digitale (WEB, non supportata) - non ancora supportata
     * - sportello_didattico (WEB, non supportata) - in attesa di parser
     * - corsi_e_laboratori (WEB, non supportata) - non dovrebbe essere accessibile agli studenti
     * - comUnica (WEB, non supportata) - in attesa di contributo esterno
     * 
     * @example
     * const api = new AxiosAPI();
     * await api.login(CODICE_FISCALE, CODICE_UTENTE, PASSWORD);
     * const compiti = await api.get('compiti');
     */
    async get(azione, codiceFiscale = null, usersession = null) {
        if (!(codiceFiscale || this.codiceFiscale) && (usersession || this.usersession)) {
            this.#handleNoLogin();
        }
        const session = usersession || this.usersession;
        const codiceFiscaleFinal = codiceFiscale || this.codiceFiscale;
        const studentSessionData = this.#getStudentSessionData(codiceFiscaleFinal, session);

        // Action configuration map
        const actions = {
            compiti: {
                action: "GET_COMPITI_MASTER",
                parser: parsers.parseCompiti,
                path: "[0].compiti",
            },
            verifiche: {
                action: "GET_COMPITI_MASTER",
                parser: parsers.parseVerifiche,
                path: "[0].compiti",
            },
            voti: {
                action: "GET_VOTI_LIST_DETAIL",
                parser: parsers.parseVoti
            },
            comunicazioni: {
                action: "GET_COMUNICAZIONI_MASTER",
                parser: parsers.parseComunicazioni,
                path: "[0]",
                customParse: true,
            },
            permessi: {
                action: "GET_AUTORIZZAZIONI_MASTER",
                parser: parsers.parsePermessi,
                path: "[0]",
            },
            orario: {
                action: "GET_ORARIO_MASTER",
                parser: parsers.parseOrario,
                path: "[0].orario",
            },
            argomenti: {
                action: "GET_ARGOMENTI_MASTER",
                parser: parsers.parseArgomenti,
                path: "[0].argomenti",
            },
            assenze: {
                action: "GET_ASSENZE_MASTER",
                parser: parsers.parseAssenze,
            },
            note: {
                action: "GET_NOTE_MASTER", 
                parser: parsers.parseNote
            },
            curriculum: {
                action: "GET_CURRICULUM_MASTER",
                parser: parsers.parseCurriculum,
                path: "[0].curriculum",
            },
            pagella: {
                action: "GET_PAGELLA_MASTER",
                parser: parsers.parsePagella,
            },
            studente: {
                action: "GET_STUDENTI",
                parser: parsers.parseStudente,
                path: "[0]",
            },
        };

        const normalizedAction = azione.toLowerCase().replace(/\s/g, "");
        const config = actions[normalizedAction];

        if (!config) {
            throw new Error("Azione non supportata");
        }

        // Fetch raw data
        const rawData = await this.client.get(
            config.action,
            studentSessionData,
            "FAM"
        );

        // Extract data using path if provided
        let data = rawData;
        if (config.path) {
            const pathParts = config.path.match(/\[(\d+)\]|\.(\w+)/g);
            for (const part of pathParts) {
                if (part.startsWith("[")) {
                    const index = parseInt(part.slice(1, -1));
                    data = data[index];
                } else {
                    data = data[part.slice(1)];
                }
            }
        }

        // Handle special parsing case for comunicazioni
        if (config.customParse && normalizedAction === "comunicazioni") {
            const fullData = rawData[0];
            return config.parser(fullData.comunicazioni, fullData.idAlunno);
        }

        return config.parser ? config.parser(data) : data;
    }

    /**
     * Recupera la timeline per una data specifica
     * @param {String} data - Data in formato "dd/mm/yyyy"
     * @param {String} codiceFiscale - Codice fiscale opzionale (usa quello memorizzato se non fornito)
     * @param {String} usersession - Usersession opzionale (usa quella memorizzata se non fornita)
     * @returns {Object} Dati della timeline analizzati
     */
    async getTimeline(data, codiceFiscale = null, usersession = null) {
        if (!((codiceFiscale || this.codiceFiscale) && (usersession || this.usersession))) {
            this.#handleNoLogin();
        }
        const session = usersession || this.usersession;
        const codiceFiscaleFinal = codiceFiscale || this.codiceFiscale;
        const studentSessionData = this.#getStudentSessionData(codiceFiscaleFinal, session);

        const rawData = await this.client.get(
            "GET_TIMELINE",
            studentSessionData,
            "FAM",
            { dataGiorno: data }
        );

        return parsers.parseTimeline(rawData[0]);
    }

    /**
     * Segna una comunicazione come letta
     * @param {Object} data - Dati della comunicazione (id, idAlunno)
     * @param {String} codiceFiscale - Codice fiscale opzionale (usa quello memorizzato se non fornito)
     * @param {String} usersession - Usersession opzionale (usa quella memorizzata se non fornita)
     * @returns {String} Stato della risposta
     */
    async segnaComunicazioneLetta(data, codiceFiscale = null, usersession = null) {
        if (!((codiceFiscale || this.codiceFiscale) && (usersession || this.usersession))) {
            this.#handleNoLogin();
        }
        const session = usersession || this.usersession;
        const codiceFiscaleFinal = codiceFiscale || this.codiceFiscale;

        const requestData = {
            sCodiceFiscale: codiceFiscaleFinal,
            sSessionGuid: session,
            sCommandJSON: {
                sApplication: "FAM",
                sService: "APP_PROCESS_QUEUE",
                sModule: "COMUNICAZIONI_READ",
                data: data,
            },
            sVendorToken: this.client.vendorToken,
        };

        const requestBody = encode(requestData, 0);
        const response = await this.client.post(requestBody);

        return response.response === null
            ? "Comunicazione già letta"
            : JSON.stringify(response.response);
    }

    /**
     * Risponde a una comunicazione
     * @param {Object} data - Dati della risposta della comunicazione
     * @param {String} codiceFiscale - Codice fiscale opzionale (usa quello memorizzato se non fornito)
     * @param {String} usersession - Usersession opzionale (usa quella memorizzata se non fornita)
     * @returns {Object} Risposta dal server
     */
    async rispondiComunicazione(data, codiceFiscale = null, usersession = null) {
        if (!((codiceFiscale || this.codiceFiscale) && (usersession || this.usersession))) {
            this.#handleNoLogin();
        }
        const session = usersession || this.usersession;
        const codiceFiscaleFinal = codiceFiscale || this.codiceFiscale;

        const requestData = {
            sCodiceFiscale: codiceFiscaleFinal,
            sSessionGuid: session,
            sCommandJSON: {
                sApplication: "FAM",
                sService: "APP_PROCESS_QUEUE",
                sModule: "COMUNICAZIONI_RISPOSTA",
                data: data,
            },
            sVendorToken: this.client.vendorToken,
        };

        const requestBody = encode(requestData, 0);
        const response = await this.client.post(requestBody);

        if (response.errorcode == -1) {
            throw new Error(
                `Axios ha risposto con un errore: "${response.errormessage}"`
            );
        }

        return response;
    }

    #handleNoLogin() {
        throw new Error("Effettuare il login prima di chiamare questo metodo.");
    }
}
