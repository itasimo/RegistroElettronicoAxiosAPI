import { AxiosWEBClient } from "@/web";
import {
    parseAnagrafico,
    parseDeleghe,
    parseCurriculum,
    parseDocumenti,
    parseAssenze,
    parsePermessi,
    parseArgomenti,
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

    async get(azione, { sessionID, axToken, redirectUrl } = {}) {
        if (!this.isWebLoggedIn && !(sessionID && axToken && redirectUrl)) {
            this.#handleNoWEBSession();
        }

        // Use provided session parameters or fall back to stored session
        const sessionParams =
            sessionID && axToken && redirectUrl
                ? { sessionID, axToken, redirectUrl }
                : this.getSessionProps;

        // Special case for "voti" action which requires different handling
        if (azione == "voti") {
            return this.webclient.getVoti(sessionParams);
        }

        const actions = {
            comunicazioni: {
                action: "FAMILY_COMUNICAZIONI",
                parser: null,
            },
            anagrafico: {
                action: "FAMILY_ANAGRAFICO",
                parser: parseAnagrafico,
            },
            deleghe: {
                action: "FAMILY_DELEGHE",
                parser: parseDeleghe,
            },
            curriculum: {
                action: "FAMILY_CURRICULUM",
                parser: parseCurriculum,
            },
            documenti: {
                // Sezione "Curriculum e Documenti Segreteria" (raggruppamento di schifo ma conoscendo Axios non mi sorprendo più)
                action: "FAMILY_CURRICULUM",
                parser: parseDocumenti,
            },
            orario: {
                action: "FAMILY_ORARIO",
                parser: null,
            },
            assenze: {
                action: "FAMILY_ASSENZE",
                parser: parseAssenze,
            },
            permessi: {
                action: "FAMILY_PERMESSI_AUTORIZZATI",
                parser: parsePermessi,
            },
            argomenti: {
                action: "FAMILY_REGISTRO_CLASSE_ARGOMENTI_LISTA",
                parser: parseArgomenti,
                post: true,
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
                action: "FAMILY_REGISTRO_CLASSE_COMPITI_LISTA",
                parser: null,
                post: true,
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
                action: "FAMILY_REGISTRO_CLASSE_COMPITI_LISTA",
                parser: null,
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
                action: "FAMILY_REGISTRO_CLASSE_NOTE_LISTA",
                parser: null,
                post: true,
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
            pagella: {
                action: "FAMILY_PAGELLA",
                parser: null,
            },
            colloqui: {
                action: "FAMILY_COLLOQUI",
                parser: null,
            },
            pagoscuola: {
                action: "FAMILY_PAGOSCUOLA",
                parser: null,
            },
            sportello: {
                action: "FAMILY_SPORTELLO_DIDATTICO",
                parser: null,
            },
            corsi_e_laboratori: {
                action: "CORSI_E_LABORATORI",
                parser: null,
            },
            libri: {
                action: "FAMILY_LIBRI_DI_TESTO",
                parser: null,
            },
            comunica: {
                action: "FAMILY_COMUNICA",
                parser: null,
            },
        };

        const normalizedAction = azione.toLowerCase().replace(/\s/g, "");
        const config = actions[normalizedAction];

        if (!config) {
            throw new Error(`Azione "${azione}" non supportata.`);
        }

        // Make the request
        const method = config.post ? "post" : "get";
        const args = config.post
            ? [config.action, sessionParams, config.body]
            : [config.action, sessionParams];

        const responseHTML = await this.webclient[method](...args);

        return config.parser
            ? config.parser(responseHTML, this.webclient)
            : responseHTML;
    }

    #handleNoWEBSession() {
        throw new Error(
            "No web session available. Please call api.web.toWEBSession() first.",
        );
    }
}
