import { toSessionID } from "@/web";

export default class AxiosWEB {

    // Private field to store the no-login handler
    #handleNoLogin = null;

    constructor(axiosAPI, handleNoLogin = null) {
        this.axiosAPI = axiosAPI;
        this.sessionID = null;

        // Store the no-login handler if provided
        this.#handleNoLogin = typeof handleNoLogin === "function" ? handleNoLogin : null;
    }

    /**
     * Checks if the the usersession was converted to sessionID
     * @returns {Boolean} True if logged in, false otherwise
     */
    get isWebLoggedIn() {
        return this.sessionID !== null;
    }

    /**
     * Converts usersession to ASP.NET_SessionId for web version
     * @returns {String} The session ID for web
     */
    async toSessionID(codiceFiscale = null, usersession = null) {        
        if (!((codiceFiscale || this.axiosAPI.codiceFiscale) && (usersession || this.axiosAPI.usersession))) {
            this.#handleNoLogin && this.#handleNoLogin();
        }
        const session = usersession || this.axiosAPI.usersession;
        const codiceFiscaleFinal = codiceFiscale || this.axiosAPI.codiceFiscale;

        const sessionID = await toSessionID(codiceFiscaleFinal, session);
        this.sessionID = sessionID;
        return sessionID;
    }

    #handleNoSessionID() {
        throw new Error("No session ID available. Please call api.web.toSessionID() first.");
    }

}