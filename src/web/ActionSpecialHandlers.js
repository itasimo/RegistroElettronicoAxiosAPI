import { htmlParser, querySelector, querySelectorAll, dataset } from "./utils";
import { parseVoti, parsePagella, parseComunicazioni } from "@/web/parsing";

export default class ActionSpecialHandlers {
    constructor(webclient) {
        this.webclient = webclient;
    }

    async getVoti() {
        // STEP 1: Fetch the main voti page to extract quadrimestre tokens
        // This returns HTML containing a select element with quadrimestre options
        const pageHtml = await this.webclient.get("FAMILY_VOTI");

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
            );

            // Store the raw response for this quadrimestre to be parsed later
            toBeParsed[quadrimestre] = votiListRawJson;
        }

        // STEP 4: Parse the collected raw voti data using the dedicated parser
        // The parseVoti function transforms the raw DataTables responses into structured grade objects
        const parsedVoti = parseVoti(toBeParsed);

        return parsedVoti;
    }

    async getPagelle() {
        // STEP 1: Fetch the main pagella page to extract quadrimestre tokens
        // This returns HTML containing a select element with quadrimestre options
        const pageHtml = await this.webclient.get("FAMILY_PAGELLA");

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
            );

            result.push(pagellaPage);
        }

        const parsedPagella = parsePagella(result, quadrimestriTokens, this.webclient);

        return parsedPagella;
    }

    /**
     * Recupera tutte le comunicazioni (circolari) dalla bacheca del registro elettronico.
     * 
     * Il processo si articola in tre fasi principali:
     * 1. FIRST STAGE: Recupero di tutte le pagine HTML della bacheca con paginazione automatica
     * 2. SECOND STAGE: Combinazione delle pagine HTML ed estrazione degli ID delle comunicazioni
     * 3. THIRD STAGE: Recupero dei dettagli completi per ogni comunicazione tramite il suo ID
     * 
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
    async getComunicazioni() {
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
            const pageHtml = await this.webclient.get(null, true, url);

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
                const loadMoreIndex = loadMoreMatch ? pageHtml.indexOf(loadMoreMatch[0]) : pageHtml.length;
                
                // Estrai solo gli elementi <li> prima della sezione "Carica più"
                const pageContent = pageHtml.substring(0, loadMoreIndex);
                
                // Trova l'ultimo punto di inserimento nella prima pagina (prima del pulsante "Carica più")
                const insertionPoint = combinedHtml.lastIndexOf('<div class=\'next-page-bacheche\'>');
                
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
                ''
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
            );

            comunicazioniResult.push({ id, detailsResponse });
        }

        // ========================================
        // PARSING FINALE
        // ========================================
        // Parsa le comunicazioni usando la funzione dedicata
        const parsedComunicazioni = await parseComunicazioni(comunicazioniResult, this.webclient);

        return parsedComunicazioni;
    }
}