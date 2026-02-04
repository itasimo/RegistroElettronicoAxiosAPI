import { AxiosWEBClient } from "@/web";
import {
    parseAnagrafico,
    parseDeleghe,
    parseCurriculum,
    parseDocumenti,
    parseAssenze,
    parsePermessi,
    parseArgomenti,
    parseCompiti,
    parseVerifiche,
    parseNote,
    parseLibri,
} from "@/web/parsing";

export default class AxiosWEB {
    // Private field to store the no-login handler
    #handleNoLogin = null;

    constructor(axiosAPI, handleNoLogin = null) {
        this.axiosAPI = axiosAPI;
        this.webclient = new AxiosWEBClient(this);

        // Initialize session-related properties
        this.sessionID = null;
        this.axToken = null;
        this.redirectUrl = null;

        // Store the no-login handler if provided
        this.#handleNoLogin =
            typeof handleNoLogin === "function" ? handleNoLogin : null;
    }

    /**
     * Checks if the the usersession was converted to sessionID
     * @returns {Boolean} True if logged in, false otherwise
     */
    get isWebLoggedIn() {
        return this.sessionID !== null;
    }

    /**
     * Gets the web session ID
     * @returns {String|null} The web session ID or null if not set
     */
    get getSessionID() {
        return this.sessionID;
    }

    /**
     * Gets the AXToken (RVT) for web requests
     * @returns {String|null} The AXToken or null if not set
     */
    get getAxToken() {
        return this.axToken;
    }

    /**
     * Gets the redirect URL after session conversion
     * @returns {String|null} The redirect URL or null if not set
     */
    get getRedirectUrl() {
        return this.redirectUrl;
    }

    /**
     * Gets all session properties
     * @returns {Object} Object containing sessionID, axToken, and redirectUrl
     */
    get getSessionProps() {
        return {
            sessionID: this.sessionID,
            axToken: this.axToken,
            redirectUrl: this.redirectUrl,
        };
    }

    /**
     * Converts usersession to ASP.NET_SessionId for web version
     * @returns {String} The session ID for web
     */
    async toWEBSession(codiceFiscale = null, usersession = null) {
        if (
            !(
                (codiceFiscale || this.axiosAPI.codiceFiscale) &&
                (usersession || this.axiosAPI.usersession)
            )
        ) {
            this.#handleNoLogin && this.#handleNoLogin();
        }
        const session = usersession || this.axiosAPI.usersession;
        const codiceFiscaleFinal = codiceFiscale || this.axiosAPI.codiceFiscale;

        const { sessionID, redirectUrl, axToken } =
            await this.webclient.toWEBSession(codiceFiscaleFinal, session);
        this.sessionID = sessionID;
        this.redirectUrl = redirectUrl;
        this.axToken = axToken;

        return {
            sessionID: this.sessionID,
            redirectUrl: this.redirectUrl,
            axToken: this.axToken,
        };
    }

    /**
     * Sets the environment (school year) for web requests
     * @param {String} environment - The school year to set (e.g., "2024/2025")
     * @returns {Boolean} True if the environment was set successfully
     * @throws {Error} If not logged in to web session
     * @example 
     * // Set the school year to 2024/2025
     * await api.web.setEnvironment("2024/2025");
     */
    async setEnvironment(environment) {
        if (!this.isWebLoggedIn) {
            this.#handleNoWEBSession();
        }
        return this.webclient.setEnvironment(environment);
    }

    async get(azione,  { sessionID, axToken, redirectUrl }= {}) {
        if (!this.isWebLoggedIn && !(sessionID && axToken && redirectUrl)) {
            this.#handleNoWEBSession();
        }

        const specialHandler = this.webclient.ActionSpecialHandlers;

        const actions = {
            comunicazioni: { // TODO: implementare il parser per comunicazioni
                disabled: true, // Disabilitata in attesa di finire il parser
                action: null,
                parser: specialHandler.getComunicazioni.bind(specialHandler), // Use bound method to maintain webclient context
                post: false,
                specialHandler: true,
                body: null,
            },
            anagrafico: {
                disabled: false,
                action: "FAMILY_ANAGRAFICO",
                parser: parseAnagrafico,
                post: false,
                specialHandler: false,
                body: null,
            },
            deleghe: { // La sezione "deleghe" è roba di della piattaforma Unica. Si cerca chi può scrivere il parser
                disabled: true, // Disabilitata in attesa di un contributo esterno
                action: "FAMILY_DELEGHE",
                parser: parseDeleghe,
                post: false,
                specialHandler: false,
                body: null,
            },
            curriculum: {
                disabled: false,
                action: "FAMILY_CURRICULUM",
                parser: parseCurriculum,
                post: false,
                specialHandler: false,
                body: null,
            },
            documenti: {
                disabled: false,
                action: "FAMILY_CURRICULUM", // Sezione "Curriculum e Documenti Segreteria" (raggruppamento di schifo ma conoscendo Axios non mi sorprendo più)
                parser: parseDocumenti,
                post: false,
                specialHandler: false,
                body: null,
            },
            orario: {  // TODO: implementare il parser per orario
                disabled: false,
                action: "FAMILY_ORARIO",
                parser: null,
                post: false,
                specialHandler: false,
                body: null,
            },
            assenze: {
                disabled: false,
                action: "FAMILY_ASSENZE",
                parser: parseAssenze,
                post: false,
                specialHandler: false,
                body: null,
            },
            permessi: { // FIXME: il parser dei permessi è incompleto (chidere ad Azzurli di fare un permesso per vedere il formato quando è in attesa di autorizzazione e mandare una richiesta a caso un sabato per vedere il formato delle richieste in attesa di autorizzazione)
                disabled: true, // Disabilitata in attesa di finire il parser
                action: "FAMILY_PERMESSI_AUTORIZZATI",
                parser: parsePermessi,
                post: false,
                specialHandler: false,
                body: null,
            },
            argomenti: {
                disabled: false,
                action: "FAMILY_REGISTRO_CLASSE_ARGOMENTI_LISTA",
                parser: parseArgomenti,
                post: true,
                specialHandler: false,
                body: JSON.stringify({
                    draw: 2,
                    columns: {},
                    order: [],
                    start: 0,
                    length: -1,
                    search: { value: "", regex: false },
                    iMatId: "",
                }),
            },
            compiti: {
                disabled: false,
                action: "FAMILY_REGISTRO_CLASSE_COMPITI_LISTA",
                parser: parseCompiti,
                post: true,
                specialHandler: false,
                body: JSON.stringify({
                    draw: 2,
                    columns: {},
                    order: [],
                    start: 0,
                    length: -1,
                    search: { value: "", regex: false },
                    iMatId: "",
                }),
            },
            verifiche: {
                disabled: false,
                action: "FAMILY_REGISTRO_CLASSE_COMPITI_LISTA",
                parser: parseVerifiche,
                post: true,
                specialHandler: false,
                body:  JSON.stringify({
                    draw: 2,
                    columns: {},
                    order: [],
                    start: 0,
                    length: -1,
                    search: { value: "", regex: false },
                    iMatId: "",
                }),
            },
            note: {
                disabled: false,
                action: "FAMILY_REGISTRO_CLASSE_NOTE_LISTA",
                parser: parseNote,
                post: true,
                specialHandler: false,
                body: JSON.stringify({
                    draw: 2,
                    columns: {},
                    order: [],
                    start: 0,
                    length: -1,
                    search: { value: "", regex: false },
                    iMatId: "",
                }),
            },
            voti: {
                disabled: false,
                action: null,
                parser: specialHandler.getVoti.bind(specialHandler), // Use bound method to maintain webclient context
                post: false,
                specialHandler: true,
                body: null,
            },
            pagelle: {
                disabled: false,
                action: null,
                parser: specialHandler.getPagelle.bind(specialHandler), // Use bound method to maintain webclient context
                post: false,
                specialHandler: true,
                body: null,
            },
            colloqui: { // La sezione "Colloqui" è riservata ai Genitori/Tutori.
                disabled: true,
                action: null,
                parser: null,
                post: false,
                specialHandler: false,
                body: null,
            },
            pagoscuola: { // TODO: implementare il parser per pagoscuola (aspetto che mi arrivi un pagamento reale per vedere il formato)
                disabled: true, // Disabilitata in attesa di fare il parser
                action: "FAMILY_PAGOSCUOLA",
                parser: null,
                post: false,
                specialHandler: false,
                body: null,
            },
            collabora: { // la sezione "Collabora" non è ancora supportata.
                disabled: true,
                action: null,
                parser: null,
                post: false,
                specialHandler: true,
                body: null,
            },
            sportello_digitale: { // la sezione "Sportello Digitale" non è ancora supportata.
                disabled: true,
                action: null,
                parser: null,
                post: false,
                specialHandler: true,
                body: null,
            },
            sportello_didattico: { // TODO: implementare il parser per sportello_didattico (aspetto che mi attivino uno sportello per vedere il formato)
                disabled: true, // Disabilitata in attesa di fare il parser
                action: "FAMILY_SPORTELLO_DIDATTICO",
                parser: null,
                post: false,
                specialHandler: false,
                body: null,
            },
            corsi_e_laboratori: {// Sezione riservata ai professori chissà perchè visibile dagli studenti
                disabled: true, // Disabilitata PERMANENTEMENTE in quanto non dovrebbe essere accessibile dagli studenti
                action: "CORSI_E_LABORATORI",
                parser: null,
                post: false,
                specialHandler: false,
                body: null,
            },
            libri: {
                disabled: false,
                action: "FAMILY_LIBRI_DI_TESTO",
                parser: parseLibri,
                post: false,
                specialHandler: false,
                body: null,
            },
            comUnica: { // La sezione "ComUnica" è roba di della piattaforma Unica. Si cerca chi può scrivere il parser
                disabled: true, // Disabilitata in attesa di un contributo esterno
                action: "FAMILY_COMUNICA",
                parser: null,
                post: false,
                specialHandler: false,
                body: null,
            },
        };

        const normalizedAction = azione.toLowerCase().replace(/\s/g, "");
        const config = actions[normalizedAction];

        if (!config || config.disabled) {
            throw new Error(`Azione "${azione}" non supportata.`);
        }

        // Handle special cases
        if (config.specialHandler) {
            return config.parser();
        }

        // Make the request
        const method = config.post ? "post" : "get";
        const args = config.post
            ? [config.action, config.body]
            : [config.action];

        const responseHTML = await this.webclient[method](...args);

        return config.parser
            ? config.parser(responseHTML, this.webclient)
            : responseHTML;
    }

    async getTimeline() {

    }

    #handleNoWEBSession() {
        throw new Error(
            "No web session available. Please call api.web.toWEBSession() first.",
        );
    }
}
