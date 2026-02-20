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
    parseOrario,
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
     * Verifica se la usersession è stata convertita in sessionID
     * @returns {Boolean} True se loggato, false altrimenti
     */
    get isWebLoggedIn() {
        return this.sessionID !== null;
    }

    /**
     * Ottiene l'ID della sessione web
     * @returns {String|null} L'ID della sessione web o null se non impostato
     */
    get getSessionID() {
        return this.sessionID;
    }

    /**
     * Ottiene l'AXToken (RVT) per le richieste web
     * @returns {String|null} L'AXToken o null se non impostato
     */
    get getAxToken() {
        return this.axToken;
    }

    /**
     * Ottiene l'URL di reindirizzamento dopo la conversione della sessione
     * @returns {String|null} L'URL di reindirizzamento o null se non impostato
     */
    get getRedirectUrl() {
        return this.redirectUrl;
    }

    /**
     * Ottiene tutte le proprietà della sessione
     * @returns {Object} Oggetto contenente sessionID, axToken e redirectUrl
     */
    get getSessionProps() {
        return {
            sessionID: this.sessionID,
            axToken: this.axToken,
            redirectUrl: this.redirectUrl,
        };
    }

    /**
     * Converte usersession in ASP.NET_SessionId per la versione web
     * @returns {String} L'ID della sessione per il web
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
     * Imposta l'ambiente (anno scolastico) per le richieste web
     * @param {String} environment - L'anno scolastico da impostare (es. "2024/2025")
     * @returns {Boolean} True se l'ambiente è stato impostato con successo
     * @throws {Error} Se non loggato nella sessione web
     * @example
     * const api = new AxiosAPI();
     * await api.login(CODICE_FISCALE, CODICE_UTENTE, PASSWORD);
     * await api.web.toWEBSession();
     * // Impostare l'anno scolastico a 2024/2025
     * await api.web.setEnvironment("2024/2025");
     */
    async setEnvironment(environment) {
        if (!this.isWebLoggedIn) {
            this.#handleNoWEBSession();
        }
        return this.webclient.setEnvironment(environment);
    }

    /**
     * Esegue una richiesta per una specifica azione nella sessione web
     * @param {String} azione - L'azione da eseguire (es. "orario", "compiti", "voti")
     * @param {Object} [options] - Opzioni aggiuntive per la richiesta per richieste con sessioni custom (opzionale se già loggato nella sessione web)
     * @param {String} [options.sessionID] - ID della sessione web (se non già impostato)
     * @param {String} [options.axToken] - AXToken per le richieste web (se non già impostato)
     * @param {String} [options.redirectUrl] - URL di reindirizzamento (se non già impostato)
     * @returns {Object} I dati restituiti dalla richiesta, eventualmente parsati
     * @throws {Error} Se l'azione non è supportata o se non loggato nella sessione web
     * 
     * @description
     * Azioni supportate:
     * - comunicazioni (⚠️ WARNING: tempo di esecuzione ~0.32s per comunicazione)
     * - anagrafico
     * - curriculum
     * - documenti
     * - orario
     * - assenze
     * - argomenti
     * - compiti
     * - verifiche
     * - note
     * - voti
     * - pagella
     * - libri
     * 
     * Azioni non supportate:
     * - deleghe (in attesa di contributo esterno)
     * - permessi (parser incompleto)
     * - colloqui (riservata ai genitori/tutori)
     * - pagoscuola (in attesa di parser)
     * - collabora (non ancora supportata)
     * - sportello_digitale (non ancora supportata)
     * - sportello_didattico (in attesa di parser)
     * - corsi_e_laboratori (non dovrebbe essere accessibile agli studenti)
     * - comUnica (in attesa di contributo esterno)
     * 
     * @example
     * const api = new AxiosAPI();
     * await api.login(CODICE_FISCALE, CODICE_UTENTE, PASSWORD);
     * await api.web.toWEBSession();
     * // Ottenere l'orario delle lezioni
     * const orario = await api.web.get("orario");
     * // Ottenere i compiti assegnati
     * const compiti = await api.web.get("compiti");
     * // Ottenere i voti
     * const voti = await api.web.get("voti");
     */
    async get(azione,  { sessionID, axToken, redirectUrl } = {}) {
        if (!this.isWebLoggedIn && !(sessionID && axToken && redirectUrl)) {
            this.#handleNoWEBSession();
        }

        const specialHandler = this.webclient.ActionSpecialHandlers;

        const actions = {
            comunicazioni: { // TODO; aggiungere warning nel JsDoc per il tempo di esecuzione dell'azione (137 comunicazioni in 44 secondi = 0.32s a comunicaizione)
                disabled: false,
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
            orario: {
                disabled: false,
                action: "FAMILY_ORARIO",
                parser: parseOrario,
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
            pagella: {
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
