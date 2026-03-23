import { htmlParser, querySelector, querySelectorAll } from "./utils";
import {
    parseVoti,
    parsePagella,
    parseComunicazioni,
    parseTimeline,
    parsePagoscuola
} from "@/web/parsing";

export default class ActionSpecialHandlers {
    constructor(webclient) {
        this.webclient = webclient;
    }

    /**
     * [INTERNAL] Fetches and parses grades (voti) for all quadrimestri
     *
     * Multi-step process:
     * 1. Fetches main voti page to extract available quadrimestre tokens
     * 2. For each quadrimestre, fetches the specific page and extracts the "frazione" value
     * 3. Uses DataTables endpoint to fetch all grades for that quadrimestre
     * 4. Parses all collected raw data using parseVoti()
     *
     * @private
     * @async
     * @param {Object} [customSession=null] - Custom session properties {sessionID, axToken, redirectUrl}
     * @returns {Promise<Object>} Parsed grades object organized by quadrimestre with individual grade records
     */
    async getVoti(customSession = null) {
        // STEP 1: Fetch the main voti page to extract quadrimestre tokens
        // This returns HTML containing a select element with quadrimestre options
        const pageHtml = await this.webclient.get(
            "FAMILY_VOTI",
            false,
            null,
            customSession,
        );

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

        // Remove all empty quadrimestre entries
        for (const [quadrimestre, token] of Object.entries(
            quadrimestriTokens,
        )) {
            if (!token || token.trim() === "") {
                delete quadrimestriTokens[quadrimestre];
            }
        }

        // STEP 2 & 3: For each quadrimestre, fetch the grades
        const toBeParsed = {};

        for (const [quadrimestre, token] of Object.entries(
            quadrimestriTokens,
        )) {
            // STEP 2a: Fetch the quadrimestre-specific page using the token
            // This POST request returns HTML containing hidden input fields with the "frazione" value
            // The body must be sent as JSON string, not URL-encoded form data
            const votiListHtml = await this.webclient.post(
                "FAMILY_VOTI",
                JSON.stringify({ iFrazId: token }),
                false,
                false,
                null,
                customSession,
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
            const votiListRawJson = await this.webclient.post(
                "FAMILY_VOTI_ELENCO_LISTA",
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
                false,
                false,
                null,
                customSession,
            );

            // Store the raw response for this quadrimestre to be parsed later
            toBeParsed[quadrimestre] = votiListRawJson;
        }

        // STEP 4: Parse the collected raw voti data using the dedicated parser
        // The parseVoti function transforms the raw DataTables responses into structured grade objects
        const parsedVoti = parseVoti(toBeParsed);

        return parsedVoti;
    }

    /**
     * [INTERNAL] Fetches and parses school report cards (pagelle) for all quadrimestri
     *
     * Multi-step process:
     * 1. Fetches main pagella page to extract available quadrimestre tokens
     * 2. For each quadrimestre, attempts to fetch the specific page
     * 3. Handles both available (with grades data) and unavailable (with error message) responses
     * 4. Parses all collected responses using parsePagella()
     *
     * Response types handled:
     * - Error response: {"errorcode":"0", "errormsg":"...", "html":"..."} - pagella not yet available
     * - DataTables response: {"draw": X, "recordsTotal": Y, "data": [...]} - pagella available with grades
     *
     * @private
     * @async
     * @param {Object} [customSession=null] - Custom session properties {sessionID, axToken, redirectUrl}
     * @returns {Promise<Object>} Parsed pagelle object with grade records and availability status per quadrimestre
     */
    async getPagelle(customSession = null) {
        // STEP 1: Fetch the main pagella page to extract quadrimestre tokens
        // This returns HTML containing a select element with quadrimestre options
        const pageHtml = await this.webclient.get(
            "FAMILY_PAGELLA",
            false,
            null,
            customSession,
        );

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

        // Remove all empty quadrimestre entries
        for (const [quadrimestre, token] of Object.entries(
            quadrimestriTokens,
        )) {
            if (!token || token.trim() === "") {
                delete quadrimestriTokens[quadrimestre];
            }
        }

        // STEP 2 & 3: For each quadrimestre, fetch the grades
        const result = [];

        for (const [_, token] of Object.entries(quadrimestriTokens)) {
            // STEP 2: Fetch the quadrimestre-specific page using the token
            // This POST request can return two different response types:
            // 1. Error response with errorcode: {"errorcode":"0", "errormsg":"...", "html":"..."}
            //    - Indicates pagella is not yet available, contains the unavailable date
            // 2. DataTables response (no errorcode property): {"draw": X, "recordsTotal": Y, "data": [...]}
            //    - Indicates pagella is available with grades data
            // The body must be sent as JSON string, not URL-encoded form data
            const pagellaPage = await this.webclient.post(
                "FAMILY_PAGELLA",
                JSON.stringify({ iFrazId: token }),
                false,
                false,
                null,
                customSession,
            );

            result.push(pagellaPage);
        }

        const parsedPagella = parsePagella(
            result,
            quadrimestriTokens,
            this.webclient,
        );

        return parsedPagella;
    }

    /**
     * [INTERNAL] Recupera tutte le comunicazioni (circolari) dalla bacheca del registro elettronico.
     *
     * Il processo si articola in tre fasi principali:
     * 1. FIRST STAGE: Recupero di tutte le pagine HTML della bacheca con paginazione automatica
     * 2. SECOND STAGE: Combinazione delle pagine HTML ed estrazione degli ID delle comunicazioni
     * 3. THIRD STAGE: Recupero dei dettagli completi per ogni comunicazione tramite il suo ID
     *
     * @private
     * @async
     * @param {Object} [customSession=null] - Custom session properties {sessionID, axToken, redirectUrl}
     * @returns {Promise<Array>} Array di comunicazioni parsate con tutti i dettagli
     *
     * @description
     * Struttura URL per il recupero delle pagine:
     * https://registrofamiglie.axioscloud.it/Pages/SD/SD_Ajax_Get.aspx?Action=BACHECA_CIRCOLARE&Others=1|{page}||||0|
     *
     * Componenti del parametro "Others" (separati da |):
     * - 1: Flag fisso (uguale per tutte le richieste)
     * - {page}: Numero della pagina (1, 2, 3, ...)
     * - : Filtro ricerca titolo (Base64)
     * - : Filtro tipo comunicazione (Base64)
     * - : (vuoto)
     * - 0: Flag circolari (0=tutte, 1=solo attive)
     * - : Filtro mittente
     *
     * Struttura URL per il recupero dei dettagli:
     * https://registrofamiglie.axioscloud.it/Pages/SD/SD_Ajax_Get.aspx?Action=BACHECA_VISUALIZZA_CIRCOLARE&Others={id}||MHx8fHw=|
     *
     * Componenti del parametro "Others":
     * - {id}: ID della circolare
     * - : Comment ID (undefined per ora)
     * - MHx8fHw=: Base64 di "0||||" (selezione bacheca)
     * - : Classe (vuoto per ora)
     *
     * @example
     * Implementazione lato client originale (paginazione):
     * ```javascript
     * $(".comunicazione-change-page").unbind("click").click(function(event) {
     *     event.preventDefault();
     *     var action = $(this).attr("data-action");
     *     var nextPage = $(this).attr("data-next-page");
     *     var FilterSearch = $("#fsTitoloSearch").val();
     *     var FilterCircolariAttive = $("#fbOnlyActive").bootstrapSwitch("state") === true ? "1" : "0";
     *     var FilterSendBy = $("#fiSendBy").val();
     *     var finalUrl = baseUrl + "&Others=1|" + nextPage +
     *         "||" + Base64.encode(FilterSearch) +
     *         "|" + Base64.encode($("#fiTipoComunicazioneDash").val()) +
     *         "|" + FilterCircolariAttive +
     *         "|" + FilterSendBy;
     *     $.ajax({type: "GET", url: finalUrl, success: function(response) {
     *         targetElement.html(response);
     *     }});
     * });
     * ```
     */
    async getComunicazioni(customSession = null) {
        // ========================================
        // FIRST STAGE: Recupero pagine HTML
        // ========================================
        // Array per memorizzare le risposte HTML di tutte le pagine di comunicazioni
        const htmlResponses = [];

        // Variabile di controllo per la paginazione
        let page = 1;
        let hasMorePages = true;

        // Ciclo di fetching paginato - continua finché ci sono più pagine disponibili
        while (hasMorePages) {
            // ===== COSTRUZIONE DELL'URL =====
            // L'URL segue questo schema:
            // https://registrofamiglie.axioscloud.it/Pages/SD/SD_Ajax_Get.aspx?Action=BACHECA_CIRCOLARE&Others=1|{page}||||0|
            //
            // Componenti dell'URL:
            // - Action=BACHECA_CIRCOLARE     : Specifica l'azione da eseguire (visualizzazione bacheca circolari)
            // - Others                       : Parametro complesso che contiene più informazioni separate da |
            //   - 1                          : Flag chissà per cosa (uguale per tutte le richieste)
            //   - {page}                     : Numero della pagina da recuperare (1, 2, 3, ...)
            //   - ||||                       : Filtri codificati in Base64 (ricerca, tipo comunicazione, ecc.)
            //   - 0                          : Flag per mostrare tutte le comunicazioni (1 = solo attive, 0 = tutte)
            //   - |                          : Separatore finale
            //
            const url = `https://registrofamiglie.axioscloud.it/Pages/SD/SD_Ajax_Get.aspx?Action=BACHECA_CIRCOLARE&Others=1|${page}||||0|`;

            // ===== FETCHING DELLA PAGINA =====
            // Esecuzione della richiesta GET all'URL costruito
            // - null                : Nessuna azione standard (URL personalizzato)
            // - true                : rawResponse = true, ritorna l'HTML grezzo senza parsing
            // - url                 : urlOverride, usa l'URL personalizzato invece di uno standard
            const pageHtml = await this.webclient.get(
                null,
                true,
                url,
                customSession,
            );

            // Memorizza la risposta HTML della pagina corrente
            htmlResponses.push(pageHtml);

            // ===== CONTROLLO DELLA PAGINAZIONE =====
            // Parsing dell'HTML per determinare se esistono altre pagine
            // Il selettore *[data-content="next-page-bacheche"] rappresenta il pulsante "Pagina Successiva"
            // - Se presente: significa che ci sono più pagine disponibili
            // - Se assente: siamo all'ultima pagina con contenuto
            const root = htmlParser(pageHtml);
            const nextPageButton = querySelector(
                root,
                '*[data-content="next-page-bacheche"]',
            );

            if (nextPageButton) {
                // Pulsante "Pagina Successiva" trovato, incrementa il numero pagina e continua il ciclo
                page += 1;
            } else {
                // Nessun pulsante "Pagina Successiva" trovato, abbiamo raggiunto l'ultima pagina
                hasMorePages = false;
            }
        }

        // ========================================
        // SECOND STAGE: Estrazione ID comunicazioni
        // ========================================
        // Verifica che ci siano pagine HTML da processare
        if (!htmlResponses || htmlResponses.length === 0) {
            return [];
        }

        // Inizia con la prima pagina (contiene la struttura HTML completa)
        let combinedHtml = htmlResponses[0];

        // Se ci sono più pagine, combina tutte le liste <li> in un unico documento HTML
        if (htmlResponses.length > 1) {
            // Estrai gli elementi <li> dalle pagine successive (pagine 2, 3, ..., ultima)
            for (let i = 1; i < htmlResponses.length; i++) {
                const pageHtml = htmlResponses[i];

                // Trova gli elementi <li> (item delle circolari) - iniziano con "<li class=' forcedFontSize mt-comment'"
                // Dobbiamo estrarre tutti gli <li> ma saltare la sezione "Carica più"
                const loadMorePattern = /<div class='next-page-bacheche'>/;

                // Trova dove inizia la sezione "Carica più"
                const loadMoreMatch = pageHtml.match(loadMorePattern);
                const loadMoreIndex = loadMoreMatch
                    ? pageHtml.indexOf(loadMoreMatch[0])
                    : pageHtml.length;

                // Estrai solo gli elementi <li> prima della sezione "Carica più"
                const pageContent = pageHtml.substring(0, loadMoreIndex);

                // Trova l'ultimo punto di inserimento nella prima pagina (prima del pulsante "Carica più")
                const insertionPoint = combinedHtml.lastIndexOf(
                    "<div class='next-page-bacheche'>",
                );

                if (insertionPoint !== -1) {
                    // Inserisci gli elementi della pagina corrente prima della sezione "Carica più"
                    combinedHtml =
                        combinedHtml.substring(0, insertionPoint) +
                        pageContent +
                        combinedHtml.substring(insertionPoint);
                }
            }

            // Rimuovi il pulsante "Carica più" dal documento finale combinato
            // poiché abbiamo già caricato tutte le pagine
            combinedHtml = combinedHtml.replace(
                /<div class='next-page-bacheche'>[\s\S]*?<\/div>/,
                "",
            );
        }

        // Estrai gli ID dei post dall'HTML combinato usando regex
        // Pattern matches: data-post-id='789573' o data-post-id="789573"
        const allPostIds = [];
        const postIdPattern = /data-post-id=['"](\d+)['"]/g;
        let match;

        while ((match = postIdPattern.exec(combinedHtml)) !== null) {
            allPostIds.push(match[1]);
        }

        // Rimuovi duplicati e aggiorna l'array
        const uniquePostIds = new Set(allPostIds);
        allPostIds.length = 0; // Pulisci l'array
        allPostIds.push(...uniquePostIds);

        // ========================================
        // THIRD STAGE: Recupero dettagli comunicazioni
        // ========================================

        /*
         * ===== IMPLEMENTAZIONE LATO CLIENT ORIGINALE (JavaScript vanilla) =====
         *
         * Gestisce i click sulle azioni dei post (modifica, commenta, condividi):
         *
         * $(".modifica-commenta-condividi-post")
         *     .unbind("click")
         *     .click(function (event) {
         *         event.preventDefault();
         *         var clickedElement = this;
         *         var postData = {};
         *         postData.lett = $(this).attr("data-lett"); // Stato di lettura
         *
         *         // Estrai i parametri dell'azione dagli attributi data
         *         var action = $(this).attr("data-action");
         *         var circolareId = $(this).attr("data-post-id");
         *         var classe = $(this).attr("data-classe");
         *         var commentId = $(this).attr("data-commento-id");
         *         var selectedBoard = $("#selezione-bacheca").attr("value");
         *         var selectedClassSubject = $("#selezione-classe-materia").attr("value");
         *
         *         // Gestione logica di selezione
         *         if (selectedClassSubject != null && selectedClassSubject !== "") {
         *             selectedBoard = selectedClassSubject;
         *         }
         *         if (selectedBoard == null) { selectedBoard = ""; }
         *         if (classe == null) { classe = ""; }
         *
         *         var jsonData = JSON.stringify(postData);
         *
         *         if (action != null) {
         *             // Costruisci l'URL della richiesta con i parametri
         *             var requestUrl = $(this).attr("data-href") +
         *                 "?Action=" + action +
         *                 "&Others=" +
         *                 circolareId +                              // Id circolare
         *                 "|" + commentId +                          // sempre undefined per ora
         *                 "|" + Base64.encode(selectedBoard) +       // sempre MHx8fHw= (o unencoded: 0||||)
         *                 "|" + classe;                              // sempre vuoto per ora
         *
         *             AJX.ajaxDo(requestUrl, {
         *                 timeout: 120000,                           // 2 minuti
         *                 type: "POST",
         *                 data: jsonData,
         *                 successCallBack: function (response) {
         *                     if (action === "BACHECA_VISUALIZZA_CIRCOLARE") {
         *                         // Aggiorna lo stato di lettura nell'UI
         *                         $(clickedElement.parentElement.parentElement)
         *                             .find(".label-lettura")
         *                             .html("<b style='color:green'>Letta</b>");
         *                         SDModal.openModalWithHtml(response, true, "40%");
         *                     } else {
         *                         SDModal.openModalWithHtml(response, true, "80%");
         *                     }
         *                 },
         *                 errorCallBack: function (error) {
         *                     console.error("Request failed:", error);
         *                 }
         *             });
         *         }
         *     });
         */

        const comunicazioniResult = [];

        // Usa for...of invece di forEach per gestire correttamente async/await
        for (const id of allPostIds) {
            // Costruisci l'URL per recuperare i dettagli della singola comunicazione
            // MHx8fHw= è la codifica Base64 di "0||||" (selezione bacheca di default)
            const url = `https://registrofamiglie.axioscloud.it/Pages/SD/SD_Ajax_Get.aspx?Action=BACHECA_VISUALIZZA_CIRCOLARE&Others=${id}||MHx8fHw=|`;

            // Usa POST con body vuoto come fa l'implementazione originale
            const detailsResponse = await this.webclient.post(
                null,
                JSON.stringify({}),
                false,
                true,
                url,
                customSession,
            );

            comunicazioniResult.push({ id, detailsResponse });
        }

        // ========================================
        // PARSING FINALE
        // ========================================
        // Parsa le comunicazioni usando la funzione dedicata
        const parsedComunicazioni = await parseComunicazioni(
            comunicazioniResult,
            this.webclient,
        );

        return parsedComunicazioni;
    }

    /**
     * [INTERNAL] Recupera e parse tutte le informazioni relative a Pagoscuola, inclusi i pagamenti effettuati e i dettagli associati.
     *
     * Il processo si articola in due fasi principali:
     * 1. Recupero della pagina principale di Pagoscuola per estrarre gli eventi liberali
     * 2. Esecuzione di una richiesta POST all'endpoint AJAX specifico per Pagoscuola per ottenere i dati di tutti i pagamenti, siccome il default è mostrare solo quelli non pagati
     * 
     * @param {Object} [customSession=null] - Custom session properties {sessionID, axToken, redirectUrl}
     * @returns {Promise<Object>} Parsed pagoscuola object with payment records and details
     */
    async getPagoscuola(customSession = null) {

        const pageHtml = await this.webclient.get(
            "FAMILY_PAGOSCUOLA",
            false,
            null,
            customSession,
        );

        const url = 'https://registrofamiglie.axioscloud.it/Pages/COMMON_PAGOSCUOLA/COMMON_PAGOSCUOLA_Ajax_Get.aspx?action=PAGAMENTI'
        const response = await this.webclient.post(
            null,
            JSON.stringify({ fsStatoPag: "" }),
            false,
            true,
            url,
            customSession,
        );

        const parsedPagoscuola = parsePagoscuola(pageHtml, JSON.parse(response).json, this.webclient);

        return parsedPagoscuola;
    }

    /**
     * [INTERNAL] Fetches and parses timeline data for a specific date
     *
     * Converts the input date to DD/MM/YYYY format and makes a GET request to the Axios API
     * to fetch the timeline HTML for that date, then parses it using parseTimeline().
     *
     * @private
     * @async
     * @param {Date|string|Object} data - The date for which to fetch timeline. Can be:
     *   - Date object
     *   - ISO string (e.g., "2026-02-21T10:30:00.000Z")
     *   - Object with date property: {date: new Date()}
     * @param {Object} [customSession=null] - Custom session properties {sessionID, axToken, redirectUrl}
     * @returns {Promise<Object>} Parsed timeline object with events and data statistics
     * 
     * @example
     * Implementazione lato client originale (non fa mai questa richiesta ma è presente nel source code, ci torna utile sennò per prendere una data nel passato dovremmo fare mille richieste):
     * ```javascript
     * $(document).ready(function() {
     *     if (jQuery().datetimepicker) {
     *         $("#dpToday").datetimepicker({
     *             locale: "it",
     *             format: "DD/MM/YYYY",
     *             useCurrent: false,
     *             showTodayButton: true,
     *             ignoreReadonly: true,
     *             calendarWeeks: true,
     *             minDate: moment(startDate, "DD/MM/YYYY"),
     *             maxDate: moment(endDate, "DD/MM/YYYY"),
     *             widgetParent: ".tm-date-right"
     *         }).on("dp.change", function() {
     *             var dateChangeUrl = "../../Pages/APP/APP_Ajax_Get.aspx?Action=FAMILY_CHANGE_DATA&Others=" + $("#dpToday").val();
     *                 
     *             AJX.ajaxDo(dateChangeUrl, {
     *                 timeout: 120000,
     *                 cache: false,
     *                 async: true,
     *                 loadingText: APP.loadingText,
     *                 successCallBack: function(response) {
     *                     if (response.errorcode !== "0") {
     *                         var errorObj = {};
     *                         errorObj.responseText = response.errormsg;
     *                         APP.returnError(JSON.stringify(errorObj));
     *                     } else {
     *                         $("#content-timeline").html(response.html);
     *                     }
     *                 },
     *                 errorCallBack: APP.returnError,
     *                 type: "GET",
     *                 dataType: "json"
     *             });
     *         });
     * 
     *         $(".tm-icon").unbind("click").click(function() {
     *             $("#dpToday").data("DateTimePicker").toggle();
     *         });
     *     }
     * });
     * ```
     */
    async handleTimeline(data, customSession = null) {
        // Convert data to ISO string if it's an object with a date property
        const dateString =
            typeof data === "object" && data.date
                ? new Date(data.date).toISOString()
                : data;

        // Convert date into DD/MM/YYYY format required by the API
        const dateObj = new Date(dateString);
        const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}/${String(
            dateObj.getMonth() + 1,
        ).padStart(2, "0")}/${dateObj.getFullYear()}`;

        // Construct the URL for fetching timeline data for the specified date
        const url = `https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=FAMILY_CHANGE_DATA&Others=${formattedDate}&_=${Date.now()}`;

        // Make POST request to retrieve timeline data for the specified date
        const htmlResponse = await this.webclient.get(
            null,
            null,
            url,
            customSession,
        );

        // Parse the HTML response to extract timeline information
        const parsedTimeline = parseTimeline(htmlResponse, formattedDate);

        return parsedTimeline;
    }
}
