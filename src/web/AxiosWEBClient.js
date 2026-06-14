import { toWEBSession, handleFileDownload, fetchDashboardLoad } from "./utils";
import ActionSpecialHandlers from "./ActionSpecialHandlers";
/**
 * Client for making HTTP requests to Axios API
 */
export default class AxiosWEBClient {
    constructor(axiosWEB) {
        this.baseURL =
            "https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx";
        this.axiosWEB = axiosWEB;
        this.ActionSpecialHandlers = new ActionSpecialHandlers(this);
    }

    async toWEBSession(codiceFiscale, usersession) {
        return await toWEBSession(codiceFiscale, usersession);
    }

    /**
     * Imposta l'anno scolastico (ambiente di lavoro) per la sessione corrente.
     *
     * Effettua una richiesta POST all'API di Axios per cambiare l'anno scolastico attivo.
     * Il formato richiesto è "YYYY/YYYY" (es. "2024/2025") dove il secondo anno deve essere
     * consecutivo al primo. Valida il formato prima di inviare la richiesta.
     *
     * @async
     * @param {string} enviroment - Anno scolastico nel formato "YYYY/YYYY" (es. "2024/2025")
     * @param {Object} [customSession=null] - Custom session properties {sessionID, axToken, redirectUrl}
     * @returns {Promise<boolean>} Ritorna true se l'ambiente è stato impostato correttamente
     * @throws {Error} Se il formato dell'anno scolastico non è valido
     * @throws {Error} Se la risposta di Axios indica un errore
     * @throws {Error} Se il parsing della risposta JSON fallisce
     * @throws {Error} Se la verifica dell'ambiente impostato fallisce
     * @example
     * // Imposta l'anno scolastico 2024/2025
     * await api.web.setEnvironment("2024/2025");
     */
    async setEnvironment(enviroment, customSession = null) {
        // Valida il formato dell'anno scolastico
        // Deve essere nel formato "YYYY/YYYY" con anni consecutivi (es. "2024/2025")
        const parts = enviroment.split("/");
        if (
            parts.length !== 2 ||
            !/^\d{4}$/.test(parts[0]) ||
            !/^\d{4}$/.test(parts[1]) ||
            parseInt(parts[1]) !== parseInt(parts[0]) + 1
        ) {
            throw new Error(
                `Invalid environment format. Expected YYYY/YYYY (e.g., "2024/2025"), got "${enviroment}"`,
            );
        }

        // Recupera le proprietà di sessione per l'autenticazione
        const { sessionID, axToken, redirectUrl } =
            (customSession?.sessionID ? customSession : this.axiosWEB.getSessionProps);

        // Costruisce gli header della richiesta con l'autenticazione
        const headers = new Headers({
            accept: "application/json, text/javascript, */*; q=0.01",
            cookie: `ASP.NET_SessionId=${sessionID}`, // Cookie di sessione per l'autenticazione
            referer: redirectUrl, // Referer richiesto da Axios
            RVT: axToken, // Token RVT nell'header
            "x-requested-with": "XMLHttpRequest", // Identifica come richiesta AJAX
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        });

        // Estrae solo il primo anno per la richiesta (es. "2024" da "2024/2025")
        const enviromentReq = enviroment.split("/")[0];

        const requestOptions = {
            method: "POST",
            headers: headers,
            redirect: "follow",
            // Formato del body richiesto dall'API Axios: JSON stringificato (non form-encoded!)
            body: JSON.stringify({ TEXTanno_scolastico: enviromentReq }),
        };

        // Aggiunge timestamp per prevenire il caching
        const url = `https://registrofamiglie.axioscloud.it/Pages/COMMON/COMMON_Ajax_Post.aspx?Action=IMPOSTAZIONI_AMBIENTE_LAVORO_MODAL_UPDATE&_=${Date.now()}`;

        // Esegue la richiesta POST
        const response = await fetch(url, requestOptions);
        const responseText = await response.text();

        // Parsa e valida la risposta JSON
        let finalJSON;
        try {
            finalJSON = JSON.parse(responseText);
            // Verifica se ci sono errori nell'API (errorcode != "0" indica un errore)
            if (finalJSON.errorcode != "0") {
                throw new Error(
                    `Axios ha risposto con un errore: "${finalJSON.errormsg}"`,
                );
            }
        } catch (error) {
            throw new Error(
                `Failed to parse Axios response: ${error.message}; Raw response: ${responseText}`,
            );
        }

        // Decodifica il JSON Base64 contenuto nella risposta
        const decodedJson = atob(finalJSON.json);

        // Verifica che l'ambiente sia stato effettivamente impostato correttamente
        // confrontando la risposta con il valore atteso
        if (decodedJson !== `{"annoscolastico":"${enviroment}"}`) {
            throw new Error(
                `Failed to set environment to "${enviroment}", got "${decodedJson}" instead`,
            );
        }

        // Ricarica lo stato della dashboard per aggiornare la sessione
        await fetchDashboardLoad(sessionID, redirectUrl, axToken);

        return true;
    }

    /**
     * Makes an authenticated GET request to the Axios API.
     *
     * Constructs a request with session authentication headers and executes it.
     * The response is expected to be JSON with an errorcode property. Errors are
     * thrown if the errorcode is non-zero or if JSON parsing fails.
     *
     * @async
     * @param {string} action - The Axios API action to perform (e.g., "FAMILY_VOTI")
     * @param {boolean} [rawResponse=false] - If true, returns raw HTML string instead of parsing JSON
     * @param {string|null} [urlOverride=null] - If provided, overrides the default URL for the request
     * @param {Object} [customSession=null] - Custom session properties {sessionID, axToken, redirectUrl}
     * @returns {Promise<string|Object>} The HTML content extracted from the response or raw HTML string
     * @throws {Error} If the response indicates an Axios error or JSON parsing fails
     */
    async get(
        action,
        rawResponse = false,
        urlOverride = null,
        customSession = null,
    ) {
        // Retrieve session properties for authentication
        const { sessionID, axToken, redirectUrl } =
            (customSession?.sessionID ? customSession : this.axiosWEB.getSessionProps);

        // Construct request headers with session authentication
        const headers = new Headers({
            accept: "application/json, text/javascript, */*; q=0.01",
            cookie: `ASP.NET_SessionId=${sessionID}`, // Session cookie for authentication
            referer: redirectUrl, // Referer required by Axios
            RVT: axToken, // RVT token header
            "x-requested-with": "XMLHttpRequest", // Identifies as AJAX request
            "user-agent":
                "Mozilla/5.0 (Linux; Android 15; 23122PCD1G Build/AQ3A.240912.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.115 Mobile Safari/537.36",
        });

        const requestOptions = {
            method: "GET",
            headers: headers,
            redirect: "follow",
        };

        // Add timestamp to prevent caching
        const timestamp = Date.now();
        const url =
            urlOverride ||
            `https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=${action}&_=${timestamp}`;

        // Execute the GET request
        const response = await fetch(url, requestOptions);
        const responseText = await response.text();

        if (rawResponse) {
            return responseText;
        }

        // Parse and validate the JSON response
        let finalJSON;
        try {
            finalJSON = JSON.parse(responseText);

            // Check if it's a normal response with an errorcode property
            // If errorcode exists and is not "0", it indicates an Axios error
            if (
                finalJSON.errorcode !== undefined &&
                finalJSON.errorcode != "0"
            ) {
                throw new Error(
                    `Axios ha risposto con un errore: "${finalJSON.errormsg}"`,
                );
            }
        } catch (error) {
            // Handle plain text error responses (start with "Errore")
            if (responseText.startsWith("Errore")) {
                throw new Error(
                    `Axios ha risposto con un errore: "${responseText}"`,
                );
            }
            // Re-throw if it's already a handled Axios error
            if (error.message.includes("Axios ha risposto con un errore")) {
                throw error;
            }
            // Otherwise, it's a JSON parsing error or unexpected response
            throw new Error(
                `Failed to parse Axios response: ${error.message}; Raw response: ${responseText}`,
            );
        }

        // Extract and return the HTML content from the response
        return finalJSON.html;
    }

    /**
     * Makes an authenticated POST request to the Axios API.
     *
     * Supports both form-encoded and JSON request bodies. Handles multiple response
     * types from the Axios API:
     * - HTML responses wrapped in JSON: {"errorcode":"0", "html":"..."}
     * - DataTables responses: {"draw": 2, "recordsTotal": 10, "data": [...]}
     * - Error responses: plain text like "Errore [-1] - Error message"
     *
     * When urlEncodeBody is true, the body object is URL-encoded as form data.
     * When false, the body is sent as-is (typically pre-stringified JSON).
     *
     * @async
     * @param {string} action - The Axios API action to perform (e.g., "FAMILY_VOTI_ELENCO_LISTA")
     * @param {Object|string} body - Request body (object for form data, string for JSON)
     * @param {boolean} [urlEncodeBody=true] - If true, URL-encodes body as form data; if false, sends body as-is
     * @param {boolean} [rawResponse=false] - If true, returns raw HTML string instead of parsing JSON
     * @param {string|null} [urlOverride=null] - If provided, overrides the default URL for the request
     * @param {Object} [customSession=null] - Custom session properties {sessionID, axToken, redirectUrl}
     * @returns {Promise<Object|string>} The parsed JSON response object or raw HTML string
     * @throws {Error} If the response indicates an Axios error or JSON parsing fails
     */
    async post(
        action,
        body,
        urlEncodeBody = false,
        rawResponse = false,
        urlOverride = null,
        customSession = null,
    ) {
        // Retrieve session properties for authentication
        const { sessionID, axToken, redirectUrl } =
            (customSession?.sessionID ? customSession : this.axiosWEB.getSessionProps);

        // Construct request headers with session authentication
        const headers = new Headers({
            accept: "application/json, text/javascript, */*; q=0.01",
            cookie: `ASP.NET_SessionId=${sessionID}`, // Session cookie for authentication
            referer: redirectUrl, // Referer required by Axios
            RVT: axToken, // RVT token header
            "x-requested-with": "XMLHttpRequest", // Identifies as AJAX request
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "user-agent":
                "Mozilla/5.0 (Linux; Android 15; 23122PCD1G Build/AQ3A.240912.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.115 Mobile Safari/537.36",
        });

        const requestOptions = {
            method: "POST",
            headers: headers,
            redirect: "follow",
            // Format body: URL-encode if urlEncodeBody is true, otherwise send as-is (JSON string)
            body: urlEncodeBody ? new URLSearchParams(body).toString() : body,
        };

        // Add timestamp to prevent caching
        const timestamp = Date.now();
        const url =
            urlOverride ||
            `https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=${action}&_=${timestamp}`;

        // Execute the POST request
        const response = await fetch(url, requestOptions);
        const responseText = await response.text();

        if (rawResponse) {
            return responseText;
        }

        let finalJSON;

        // Attempt to parse and validate the JSON response
        // The Axios API can return different response types:
        // 1. Normal HTML response: {"errorcode":"0", "html":"..."}
        // 2. DataTables response: {"draw": 2, "recordsTotal": 10, "data": [...]}
        // 3. Plain text error: "Errore [-1] - Error message"
        try {
            finalJSON = JSON.parse(responseText);

            // Check if it's a normal response with an errorcode property
            // If errorcode exists and is not "0", it indicates an Axios error
            if (
                finalJSON.errorcode !== undefined &&
                finalJSON.errorcode != "0"
            ) {
                throw new Error(
                    `Axios ha risposto con un errore: "${finalJSON.errormsg}"`,
                );
            }
        } catch (error) {
            // Handle plain text error responses (start with "Errore")
            if (responseText.startsWith("Errore")) {
                throw new Error(
                    `Axios ha risposto con un errore: "${responseText}"`,
                );
            }
            // Re-throw if it's already a handled Axios error
            if (error.message.includes("Axios ha risposto con un errore")) {
                throw error;
            }
            // Otherwise, it's a JSON parsing error or unexpected response
            throw new Error(
                `Failed to parse Axios response: ${error.message}; Raw response: ${responseText}`,
            );
        }

        // Return the parsed JSON response (works for both HTML-wrapped and DataTables responses)
        return finalJSON;
    }

    /**
     * Download a file or get its download URL, injecting session headers automatically.
     * Wraps the main handleFileDownload utility and adds session authentication headers.
     *
     * @param {Object} attributes - Attributes from the element
     * @param {string} attributes.dataRoot - The root ID
     * @param {string} attributes.dataFolder - The folder path
     * @param {string} attributes.dataFilename - The filename
     * @param {string} attributes.dataSourceFilename - The original source filename
     * @param {string} baseUrl - Current URL for the requests (the URL at which the element was found)
     * @param {Object} [options={}] - Additional options
     * @param {boolean} [options.returnBuffer=false] - If true, returns file buffer, otherwise returns download URL
     * @param {Object} [options.headers={}] - Custom headers to include in requests (will be merged with session headers)
     * @returns {Promise<string|Buffer>} Download URL or file buffer
     *
     * @description
     * Internal payload structure sent to the server:
     *
     * ```javascript
     * const payload = {
     *     url: "../../Handlers/SD_UploadDownloadHandler.aspx",
     *     root: dataRoot,
     *     folder: dataFolder,
     *     filename: dataFilename,
     *     SourceFileName: processedSourceFilename,
     *     ...params
     * };
     * ```
     */
    async handleFileDownload(attributes, baseUrl, options = {}) {
        // Get session properties (sessionID, axToken, redirectUrl)
        const { sessionID, axToken, redirectUrl } =
            this.axiosWEB.getSessionProps;

        // Merge session headers with any custom headers provided in options
        const sessionHeaders = {
            cookie: `ASP.NET_SessionId=${sessionID}`,
            referer: redirectUrl,
            RVT: axToken,
        };

        // Compose the final options object
        const mergedOptions = {
            ...options,
            headers: {
                ...(options.headers || {}),
                ...sessionHeaders,
            },
        };

        // Delegate to the shared handleFileDownload utility
        // This will return a download URL (string) or a file buffer, depending on options.returnBuffer
        return await handleFileDownload(attributes, baseUrl, mergedOptions);
    }
}
