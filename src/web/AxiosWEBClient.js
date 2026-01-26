import {
    toWEBSession,
    handleFileDownload,
    htmlParser,
    querySelector,
    querySelectorAll,
} from "./utils";
import { parseVoti } from "@/web/parsing";

/**
 * Client for making HTTP requests to Axios API
 */
export default class AxiosWEBClient {
    constructor(axiosWEB) {
        this.baseURL =
            "https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx";
        this.axiosWEB = axiosWEB;
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
     * @param {Object} sessionData - Session authentication data
     * @param {string} sessionData.sessionID - ASP.NET_SessionId cookie value
     * @param {string} sessionData.axToken - RVT token for authentication
     * @param {string} sessionData.redirectUrl - Referer URL for the request
     * @returns {Promise<string>} The HTML content extracted from the response
     * @throws {Error} If the response indicates an Axios error or JSON parsing fails
     */
    async get(action, { sessionID, axToken, redirectUrl }) {
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
        const url = `https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=${action}&_=${timestamp}`;

        // Execute the GET request
        const response = await fetch(url, requestOptions);
        const rawJSON = await response.text();

        // Parse and validate the JSON response
        let finalJSON;
        try {
            finalJSON = JSON.parse(rawJSON);
            // Check for Axios API errors (errorcode != "0" indicates an error)
            if (finalJSON.errorcode != "0") {
                throw new Error(
                    `Axios ha risposto con un errore: "${finalJSON.errormsg}"`,
                );
            }
        } catch (error) {
            throw new Error(
                `Failed to parse Axios response: ${error.message}; Raw response: ${rawJSON}`,
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
     * @param {Object} sessionData - Session authentication data
     * @param {string} sessionData.sessionID - ASP.NET_SessionId cookie value
     * @param {string} sessionData.axToken - RVT token for authentication
     * @param {string} sessionData.redirectUrl - Referer URL for the request
     * @param {boolean} [urlEncodeBody=true] - If true, URL-encodes body as form data; if false, sends body as-is
     * @returns {Promise<Object>} The parsed JSON response object
     * @throws {Error} If the response indicates an Axios error or JSON parsing fails
     */
    async post(
        action,
        { sessionID, axToken, redirectUrl },
        body,
        urlEncodeBody = false,
    ) {
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
        const url = `https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=${action}&_=${timestamp}`;

        // Execute the POST request
        const response = await fetch(url, requestOptions);
        const rawJSON = await response.text();

        let finalJSON;

        // Attempt to parse and validate the JSON response
        // The Axios API can return different response types:
        // 1. Normal HTML response: {"errorcode":"0", "html":"..."}
        // 2. DataTables response: {"draw": 2, "recordsTotal": 10, "data": [...]}
        // 3. Plain text error: "Errore [-1] - Error message"
        try {
            finalJSON = JSON.parse(rawJSON);

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
            if (rawJSON.startsWith("Errore")) {
                throw new Error(
                    `Axios ha risposto con un errore: "${rawJSON}"`,
                );
            }
            // Re-throw if it's already a handled Axios error
            if (error.message.includes("Axios ha risposto con un errore")) {
                throw error;
            }
            // Otherwise, it's a JSON parsing error or unexpected response
            throw new Error(
                `Failed to parse Axios response: ${error.message}; Raw response: ${rawJSON}`,
            );
        }

        // Return the parsed JSON response (works for both HTML-wrapped and DataTables responses)
        return finalJSON;
    }

    /**
     * Fetches grades (voti) from Axios WEB with special handling for quadrimestres.
     *
     * The Axios WEB interface requires a two-step process for fetching grades:
     * 1. Fetch the main FAMILY_VOTI page to extract quadrimestre tokens
     * 2. For each quadrimestre, fetch the page to extract the "frazione" hidden value
     * 3. Use the frazione value to fetch the actual grade data via FAMILY_VOTI_ELENCO_LISTA
     *
     * This is a DataTables endpoint that returns structured JSON with grade information.
     *
     * @async
     * @param {Object} params - Session parameters
     * @param {string} params.sessionID - ASP.NET_SessionId cookie for authentication
     * @param {string} params.axToken - RVT token for authenticated requests
     * @param {string} params.redirectUrl - Referer URL for request headers
     * @returns {Promise<Object>} Parsed voti data organized by quadrimestre with grade details
     * @throws {Error} If any HTTP request fails or parsing encounters errors
     */
    async getVoti({ sessionID, axToken, redirectUrl }) {
        // STEP 1: Fetch the main voti page to extract quadrimestre tokens
        // This returns HTML containing a select element with quadrimestre options
        const pageHtml = await this.get("FAMILY_VOTI", {
            sessionID,
            axToken,
            redirectUrl,
        });

        // Parse the HTML to locate the quadrimestre selector dropdown
        const root = htmlParser(pageHtml);
        const selectElement = querySelector(root, "#fiFrazId");
        const options = selectElement
            ? querySelectorAll(selectElement, "option")
            : [];

        // Extract quadrimestre tokens: maps readable name to base64 token
        // Example: "PRIMO QUADRIMESTRE (09/09/2025 - 25/01/2026)" => "u/iOj+d3tAw="
        const quadrimestriTokens = {};
        for (const option of options) {
            const value = option.getAttribute("value");
            const text = option.textContent.trim();
            quadrimestriTokens[text] = value;
        }

        // STEP 2 & 3: For each quadrimestre, fetch the grades
        const toBeParsed = {};

        for (const [quadrimestre, token] of Object.entries(
            quadrimestriTokens,
        )) {
            // STEP 2a: Fetch the quadrimestre-specific page using the token
            // This POST request returns HTML containing hidden input fields with the "frazione" value
            // The body must be sent as JSON string, not URL-encoded form data
            const votiListHtml = await this.post(
                "FAMILY_VOTI",
                {
                    sessionID,
                    axToken,
                    redirectUrl,
                },
                JSON.stringify({ iFrazId: token }),
            );

            // Parse the returned HTML to extract the "frazione" hidden input value
            // This value is required for the next DataTables request
            const votiRoot = htmlParser(votiListHtml.html);
            const hiddenInput = querySelector(votiRoot, "input#frazione");
            const frazioneValue = hiddenInput
                ? hiddenInput.getAttribute("value")
                : null;

            // STEP 3: Fetch the actual grades using the frazione value
            // This DataTables endpoint returns JSON with grades structured as {draw, recordsTotal, data: [...]}
            // The data array contains individual grade records with metadata
            const votiListRawHtml = await this.post(
                "FAMILY_VOTI_ELENCO_LISTA",
                {
                    sessionID,
                    axToken,
                    redirectUrl,
                },
                JSON.stringify({
                    draw: 2, // DataTables draw counter
                    columns: {}, // Column definitions (empty for server-side filtering)
                    order: [], // Sort order (empty for default)
                    start: 0, // Pagination start
                    length: -1, // Fetch all records (-1 = no limit)
                    search: { value: "", regex: false }, // Search filter (empty = no filter)
                    iMatId: "", // Subject ID filter (empty = all)
                    frazione: frazioneValue, // Quadrimestre identifier
                }),
            );

            // Store the raw response for this quadrimestre to be parsed later
            toBeParsed[quadrimestre] = votiListRawHtml;
        }

        // STEP 4: Parse the collected raw voti data using the dedicated parser
        // The parseVoti function transforms the raw DataTables responses into structured grade objects
        const parsedVoti = parseVoti(toBeParsed);

        return parsedVoti;
    }

    /**
     * Download a file or get its download URL, injecting session headers automatically.
     *
     * @param {Object} attributes - Attributes from the element (dataRoot, dataFolder, dataFilename, dataSourceFilename, ...)
     * @param {string} baseUrl - The Axios base URL (e.g. https://registrofamiglie.axioscloud.it)
     * @param {Object} [options={}] - Additional options for the download
     * @param {boolean} [options.returnBuffer=false] - If true, returns file buffer, otherwise returns download URL
     * @param {Object} [options.headers={}] - Custom headers to include in requests (merged with session headers)
     * @returns {Promise<string|Buffer>} Download URL or file buffer
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

    async toWEBSession(codiceFiscale, usersession) {
        return await toWEBSession(codiceFiscale, usersession);
    }
}
