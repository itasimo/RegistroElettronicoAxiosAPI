import { splitDateTime } from "@/utils";

/**
 * Parsea i dati delle verifiche in una struttura più comoda
 * @param {Array} rawData - Dati grezzi delle verifiche presi dall'API di Axios
 * @returns {Array} Array contenente tutte le verifiche e altre informazioni riguardanti essi
 */
export default function parseVerifiche(rawData) {

    // Array che conterrà tutte le verifiche
    const result = [];

    // La risposta di axios è un array di oggetti, prima ci sono i compiti e poi le verifiche quindi inizia dalla prima verifica saltando la prima parte composta solo da compiti
    // Trova l'indice della prima verifica e inizia da lì skippando i compiti
    const firstVerificaIndex = rawData.findIndex(obj => obj.tipo_nota == '6');
    const verificheData = firstVerificaIndex === -1 ? [] : rawData.slice(firstVerificaIndex);

    for (const item of verificheData) {
        const [perGiorno] = splitDateTime(item.data); // data: "27/11/2025 00:00:00" => "27/11/2025"
        const [pubblicatoData, pubblicatoOra] = splitDateTime(item.data_pubblicazione); // data_pubblicazione: "27/11/2025 08:15:45" => ["27/11/2025", "08:15:45"]

        result.push({
            materia: item.descMat,
            verifica: item.descCompiti.split('</b>')[1].trim(),
            perGiorno: perGiorno,
            pubblicato: [pubblicatoData, pubblicatoOra],
        });
    }

    return result;
}