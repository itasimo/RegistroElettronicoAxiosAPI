import {
    htmlParser,
    querySelector,
    querySelectorAll,
    getRowsFromTable,
    attrOf,
    dataset,
} from "../utils";
import { toBool } from "@/utils";

export default async function parsePagoscuola(
    pageHtml,
    pagoscuolaHtml,
    webClientInstance,
) {
    const pageRoot = htmlParser(pageHtml);
    const pagoscuolaRoot = htmlParser(pagoscuolaHtml);

    const eventiLiberaliTable = querySelector(
        pageRoot,
        "#pagoscuola-eventi-liberali",
    );
    const pagoscuolaTable = querySelector(
        pagoscuolaRoot,
        "#pagoscuola-pagamenti",
    );

    const eventiLiberaliRows = getRowsFromTable(eventiLiberaliTable);
    const pagoscuolaRows = getRowsFromTable(pagoscuolaTable);

    const eventiLiberali = [];
    eventiLiberaliRows.forEach((row) => {
        const cells = querySelectorAll(row, "td");
        if (cells.length != 7) return;
        eventiLiberali.push({
            descrizione: cells[0].textContent.trim() || null,
            nota: cells[1].textContent.trim() || null,
            importoFlessibile: toBool(cells[2].textContent.trim(), "SI"),
            importo: cells[3].textContent.trim() || null,
            scadenza: cells[4].textContent.trim() || null,
            eventoSidi: cells[5].textContent.trim() || null,
            pagaUrl: attrOf(querySelector(cells[6], "a"), "href") || null,
        });
    });

    const pagoscuola = [];
    for (const row of pagoscuolaRows) {
        const cells = querySelectorAll(row, "td");
        if (cells.length !== 7) continue;

        const downloadButton = querySelector(cells[6], "button#download");
        const payButton = querySelector(cells[6], "button#pagamentoSP");

        // Get download link using webClientInstance if available, otherwise fallback to null
        const downloadDataAttr = dataset(downloadButton);
        const downloadAttributes = {
            dataFolder: downloadDataAttr.folder,
            dataFilename: downloadDataAttr.filename,
            dataSourceFilename: downloadDataAttr.sourceFilename,
        };
        const downloadLink = webClientInstance
            ? await webClientInstance.handleFileDownload(
                  downloadAttributes,
                  "https://registrofamiglie.axioscloud.it/Pages/COMMON_PAGOSCUOLA/COMMON_PAGOSCUOLA.aspx",
              )
            : null;

        // Get pay link using getPagoscuolaUrl function if webClientInstance is available, otherwise fallback to null
        const payDataAttr = dataset(payButton);
        const payAttributes = {
            dataFolder: payDataAttr.folder,
            dataFilename: payDataAttr.filename,
            dataSourceFilename: payDataAttr.sourceFilename,
        };
        const payLink = await getPagoscuolaUrl(
            payAttributes,
            webClientInstance,
        );

        pagoscuola.push({
            id: cells[0].textContent.trim() || null,
            pagatoreVersante: cells[1].textContent.trim() || null,
            descrizione: cells[2].textContent.trim() || null,
            scadenza: cells[3].textContent.trim() || null,
            importo: cells[4].childNodes[0]?.textContent.trim() || null,
            stato: cells[4].childNodes[2].textContent.trim() || null,
            dataSincronizzazioneSidi:
                cells[5].childNodes[0]?.textContent.trim() || null,
            codiceSidi: cells[5].childNodes[2]?.textContent.trim() || null,
            downloadLink,
            payLink,
        });
    }

    return { pagoscuola, eventiLiberali };
}

async function getPagoscuolaUrl(attributes, webClientInstance) {
    // Ensure we have the necessary session properties to make the request
    const { sessionID, axToken, redirectUrl } =
        webClientInstance.axiosWEB.getSessionProps || {};

    const url =
        "https://registrofamiglie.axioscloud.it/Pages/COMMON_PAGOSCUOLA/COMMON_PAGOSCUOLA_Ajax_Post.aspx?Action=SEND_TO_SCUOLAPAY";
    const headers = new Headers({
        accept: "application/json, text/javascript, */*; q=0.01",
        cookie: `ASP.NET_SessionId=${sessionID}`,
        referer: redirectUrl,
        RVT: axToken,
        "x-requested-with": "XMLHttpRequest",
        "user-agent":
            "Mozilla/5.0 (Linux; Android 15; 23122PCD1G Build/AQ3A.240912.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.115 Mobile Safari/537.36",
    });

    const resultJson = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
            pdf: attributes.dataFilename,
            mail: "temp@temp.com", // Placeholder email, since the actual email is not available
            metodo: "pagopa/new-payment-from-file",
        }),
        credentials: "include",
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error(
                    `Failed to fetch PAGAMENTI_REGISTRO_MODALE: ${res.status} ${res.statusText}`,
                );
            }
            return res;
        })
        .then((res) => res.json());

    // Extract the URL from the response JSON
    const rawUrl = resultJson?.json
        ? JSON.parse(resultJson.json)?.data?.url
        : null;

    // Clean the URL by removing the email parameter
    if (rawUrl) {
        // remove &email=temp%40temp.com from the URL
        const cleanUrl = rawUrl.replace(/&email=[^&]*/, "");
        return cleanUrl;
    }

    return null; // Fallback in case of error
}
