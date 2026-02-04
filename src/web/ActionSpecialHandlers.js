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
     * ===== NOTA SULLA STRUTTURA URL CON PARAMETRI COMPLETI =====
     * https://registrofamiglie.axioscloud.it/Pages/SD/SD_Ajax_Get.aspx?Action=BACHECA_CIRCOLARE&Others=1|2||||0|
     *
     * Questa è la struttura completa con filtri:
     * Action=BACHECA_CIRCOLARE
     * &Others=
     *   1                                    : Flag chissà per cosa (uguale per tutte le richieste)
     *   |2                                   : Numero pagina
     *   |                                    : Separatore
     *   |                                    : Filtro ricerca titolo (codificato Base64)
     *   |                                    : Filtro tipo comunicazione (codificato Base64)
     *   |0                                   : Flag circolari attive (0=tutte, 1=solo attive)
     *   |                                    : Filtro mittente
     *
     * ===== IMPLEMENTAZIONE LATO CLIENT ORIGINALE (JavaScript vanilla commentato) =====
     *  // Associa event handler ai pulsanti di cambio pagina
     * $(".comunicazione-change-page").unbind("click").click(function(event) {
     *     event.preventDefault();
     *
     *     // Estrae gli attributi data dall'elemento cliccato
     *     var action = $(this).attr("data-action");              // es: "BACHECA_CIRCOLARE"
     *     var contentClass = $(this).attr("data-content");       // es: "comunicazioni-container"
     *     var targetElement = $("." + contentClass);             // Elemento DOM da aggiornare
     *     var baseUrl = $(this).attr("data-href") + "?Action=" + action;
     *     var nextPage = $(this).attr("data-next-page");         // range [1-n]
     *     var FilterSearch = $("#fsTitoloSearch").val();         // Valore ricerca titolo
     *
     *     // Recupera lo stato del filtro circolari attive (bootstrap switch)
     *     var FilterCircolariAttive = "1";                       // Default: mostra solo attive
     *     if ($("#fbOnlyActive").bootstrapSwitch("state") === true) {
     *         FilterCircolariAttive = "1";                       // Attive
     *     } else if ($("#fbOnlyActive").bootstrapSwitch("state") === false) {
     *         FilterCircolariAttive = "0";                       // Tutte
     *     }
     *
     *     // Recupera il valore del filtro mittente
     *     var FilterSendBy = $("#fiSendBy").val();
     *
     *     // Costruisce l'URL finale con i parametri (il parametro "Others" contiene valori codificati in Base64)
     *     var finalUrl = baseUrl +
     *         "&Others=1|" + nextPage +
     *         "||" + Base64.encode(FilterSearch) +               // Ricerca titolo codificata
     *         "|" + Base64.encode($("#fiTipoComunicazioneDash").val()) +  // Tipo comunicazione codificato
     *         "|" + FilterCircolariAttive +
     *         "|" + FilterSendBy;
     *
     *     // Mostra indicatore di caricamento
     *     Metronic.blockUI(UTL.messageForWaiting("Lettura nuove comunicazioni in corso..."));
     *
     *     // Esegue la richiesta AJAX
     *     $.ajax({
     *         type: "GET",
     *         cache: false,
     *         url: finalUrl,
     *         async: true,
     *         success: function(response) {
     *             // Aggiorna l'elemento DOM con il nuovo contenuto
     *             targetElement.html(response);
     *             targetElement.removeClass(contentClass);
     *             Metronic.unblockUI();                          // Nascondi indicatore
     *         },
     *         error: function() {
     *             Metronic.unblockUI();                          // Nascondi indicatore anche in caso di errore
     *         }
     *     });
     * });
     *
     * ===== NOTE SULLA RISPOSTA =====
     * L'ultima pagina con contenuto è identificata dall'assenza del pulsante con data-content="next-page-bacheche"
     * Esempio di HTML finale: "Nessuna comunicazione da leggere.<script type='text/javascript'>SDBacheche.init();...</script>"
     */
    async getComunicazioni() {
        // get the pages
        const htmlResponses = await first_stage(this);

        const ids = await second_stage(htmlResponses);

        // get the details
        const comunicazioniResult = await third_stage(ids, this);


        // extract the ids

        // const parsedComunicazioni = parseComunicazioni(htmlResponses);

        // return parsedComunicazioni;
        return {};
    }
}

async function first_stage(actionHandler) {
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
        // - sessionID/axToken   : Credenziali di sessione per autenticazione
        // - redirectUrl         : URL di redirect per mantenere la sessione
        // - true                : rawResponse = true, ritorna l'HTML grezzo senza parsing
        // - url                 : urlOverride, usa l'URL personalizzato invece di uno standard
        const pageHtml = await actionHandler.webclient.get(
            null,
            true,
            url,
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
    return htmlResponses;
}

async function second_stage(htmlResponses) {
    if (!htmlResponses || htmlResponses.length === 0) {
        return [];
    }

    // Start with the first page (contains the full structure)
    let combinedHtml = htmlResponses[0];


    // If only one page, skip the combining logic
    if (htmlResponses.length > 1) {
        // Extract list items from subsequent pages (pages 2, 3, ..., last)
        for (let i = 1; i < htmlResponses.length; i++) {
            const pageHtml = htmlResponses[i];
            
            // Find the <li> elements (circolari items) - they start with "<li class=' forcedFontSize mt-comment'"
            // We need to extract all <li> items but skip the "Load more" section
            const liStartPattern = /<li class=' forcedFontSize mt-comment'/g;
            const loadMorePattern = /<div class='next-page-bacheche'>/;
            
            // Find where the "Load more" section starts
            const loadMoreMatch = pageHtml.match(loadMorePattern);
            const loadMoreIndex = loadMoreMatch ? pageHtml.indexOf(loadMoreMatch[0]) : pageHtml.length;
            
            // Extract only the <li> items before the "Load more" section
            const pageContent = pageHtml.substring(0, loadMoreIndex);
            
            // Find the last occurrence of </div></ul> (before the scripts) in the first page
            // This is where we'll insert new items
            const insertionPoint = combinedHtml.lastIndexOf('<div class=\'next-page-bacheche\'>');
            
            if (insertionPoint !== -1) {
                // Insert the list items from the current page before the "Load more" section
                combinedHtml = 
                    combinedHtml.substring(0, insertionPoint) +
                    pageContent +
                    combinedHtml.substring(insertionPoint);
            }
        }
        
        // Remove the "Load more" button from the final combined document
        // since we've already loaded all pages
        combinedHtml = combinedHtml.replace(
            /<div class='next-page-bacheche'>[\s\S]*?<\/div>/,
            ''
        );
    }

    // extract the post ids from the combined html using regex
    // Pattern matches: data-post-id='789573' or data-post-id="789573"
    const allPostIds = [];
    const postIdPattern = /data-post-id=['"](\d+)['"]/g;
    let match;
    
    while ((match = postIdPattern.exec(combinedHtml)) !== null) {
        allPostIds.push(match[1]);
    }

    // Remove duplicates
    const uniquePostIds = new Set(allPostIds);
    allPostIds.length = 0; // Clear the array
    allPostIds.push(...uniquePostIds);

    
    return allPostIds;
}

async function third_stage(ids, actionHandler) {
    // // Handles click events for post actions (modify, comment, share)
    // $(".modifica-commenta-condividi-post")
    //     .unbind("click")
    //     .click(function (event) {
    //         event.preventDefault();

    //         // Store reference to clicked element for use in callbacks
    //         var clickedElement = this;

    //         // Prepare data object for POST request
    //         var postData = {};
    //         postData.lett = $(this).attr("data-lett"); // Reading status

    //         // Extract action parameters from data attributes
    //         var action = $(this).attr("data-action");
    //         var circolareId = $(this).attr("data-post-id");
    //         var classe = $(this).attr("data-classe");
    //         var commentId = $(this).attr("data-commento-id");

    //         // Get selection values from UI elements
    //         var selectedBoard = $("#selezione-bacheca").attr("value");
    //         var selectedClassSubject = $("#selezione-classe-materia").attr(
    //             "value",
    //         );

    //         // Handle selection logic: prefer class/subject if available
    //         if (selectedClassSubject != null && selectedClassSubject !== "") {
    //             selectedBoard = selectedClassSubject;
    //         }
    //         if (selectedBoard == null) {
    //             selectedBoard = "";
    //         }
    //         if (classe == null) {
    //             classe = "";
    //         }

    //         // Convert data object to JSON string
    //         var jsonData = JSON.stringify(postData);

    //         // Proceed only if action is specified
    //         if (action != null) {
    //             // Build request URL with parameters
    //             var requestUrl =
    //                 $(this).attr("data-href") +
    //                 "?Action=" +
    //                 action +
    //                 "&Others=" +
    //                 circolareId + // Id circolare
    //                 "|" +
    //                 commentId + // sempre undefined per ora
    //                 "|" +
    //                 Base64.encode(selectedBoard) + // sempre MHx8fHw= (o unencoded: 0||||) per ora
    //                 "|" +
    //                 classe; // sempre vuoto per ora

    //             // Execute AJAX request
    //             AJX.ajaxDo(requestUrl, {
    //                 timeout: 120000, // 2 minutes
    //                 cache: false,
    //                 async: true,
    //                 successCallBack: function (response) {
    //                     var modalWidth = "80%"; // Default modal width

    //                     // Special handling for circular viewing action
    //                     if (action === "BACHECA_VISUALIZZA_CIRCOLARE") {
    //                         modalWidth = "40%";
    //                         // Update reading status in UI
    //                         $(clickedElement.parentElement.parentElement)
    //                             .find(".label-lettura")
    //                             .html("<b style='color:green'>Letta</b>");

    //                         // Open modal with circular-specific settings
    //                         SDModal.openModalWithHtml(
    //                             response,
    //                             true, // Show modal
    //                             "40%", // Width
    //                             "", // Height (auto)
    //                             "", // Title
    //                             "auto", // Other options
    //                         );
    //                     } else {
    //                         // Open modal with default settings
    //                         SDModal.openModalWithHtml(response, true, "80%");
    //                     }
    //                 },
    //                 errorCallBack: function (error) {
    //                     // Error handling function (referenced as 't' in original)
    //                     // Note: 't' was defined as the error callback parameter
    //                     console.error("Request failed:", error);
    //                 },
    //                 type: "POST",
    //                 data: jsonData,
    //                 contentType:
    //                     "application/x-www-form-urlencoded; charset=UTF-8",
    //                 dataType: "html",
    //             });
    //         }
    //     });

    const comunicazioniResult = [];

    // Use for...of instead of forEach to properly handle async/await
    for (const id of ids) {

        const url = `https://registrofamiglie.axioscloud.it/Pages/SD/SD_Ajax_Get.aspx?Action=BACHECA_VISUALIZZA_CIRCOLARE&Others=${id}||MHx8fHw=|`;

        // Use POST with empty body as the original implementation does
        const detailsResponse = await actionHandler.webclient.post(
            null,
            JSON.stringify({}),
            false,
            true,
            url,
        );

        comunicazioniResult.push({ id, detailsResponse });
    }

    return comunicazioniResult;
}