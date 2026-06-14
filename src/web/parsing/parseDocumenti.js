import { htmlParser, querySelector, dataset, getRowsFromTable } from "../utils";


/**
 * Parse the document HTML and return the download link string using the provided AxiosWEBClient.
 * @param {string} htmlString - The HTML string to parse
 * @param {AxiosWEBClient} webClient - An instance of AxiosWEBClient (with session)
 * @returns {Promise<string>} The download link string
 */
export default async function parseDocumenti(htmlString, webClient) {

    async function getDownloadLink(row) {

        const downloadBtn = querySelector(row, 'li.btn-download');
        const datas = dataset(downloadBtn);

        const attributes = {
            dataRoot: datas['root'],
            dataFolder: datas['folder'],
            dataTempFolder: datas['tempFolder'],
            dataSourceFilename: datas['sourceFilename'],
            dataFilename: datas['filename'],
        };

        // Use the AxiosWEBClient instance to get the download link (headers injected)
        const downloadLink = await webClient.handleFileDownload(attributes, 'https://registrofamiglie.axioscloud.it/Pages/SD/SD_Dashboard.aspx');
        return downloadLink;
    }
    
    const results = [];
    const root = htmlParser(htmlString);

    const table = querySelector(root, 'table#downloadTab');
    const rows = getRowsFromTable(table);

    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) continue; // Skip rows that don't have enough cells

        const description = cells[1].textContent.trim();
        const downloadLink = await getDownloadLink(row);

        results.push({ description, downloadLink });
    }
    
    return results;
}