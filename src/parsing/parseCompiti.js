import { splitDateTime } from "@/utils";

/**
 * Parsea i dati dei compiti in una struttura più comoda
 * @param {Array} rawData - Dati grezzi dei compiti presi dall'API di Axios
 * @returns {Array} Array contenente tutti i compiti e altre informazioni riguardanti essi
 */
export default function parseCompiti(rawData) {

    // Array che conterrà tutti i compiti
    const result = [];

    // La risposta di axios è un array di oggetti, prima ci sono i compiti e poi le verifiche quindi inizia da 0 e finisce all'indice della prima verifica
    // Trova l'indice della prima verifica, da lì in poi ci sono verifiche
    const firstVerificaIndex = rawData.findIndex(obj => obj.tipo_nota == '6');
    const compitiData = firstVerificaIndex === -1 ? rawData : rawData.slice(0, firstVerificaIndex);

    for (const item of compitiData) {
        const [perGiorno] = splitDateTime(item.data); // data: "27/11/2025 00:00:00" => "27/11/2025"
        const [pubblicatoData, pubblicatoOra] = splitDateTime(item.data_pubblicazione); // data_pubblicazione: "27/11/2025 08:15:45" => ["27/11/2025", "08:15:45"]

        result.push({
            id: item.idCompito,
            materia: item.descMat,
            compito: item.descCompiti,
            perGiorno: perGiorno,
            pubblicato: [pubblicatoData, pubblicatoOra],
        });
    }

    return result;
}
