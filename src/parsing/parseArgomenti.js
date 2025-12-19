import { splitDateTime } from "@/utils";
/**
 * Parsea i dati degli argomenti in una struttura più comoda
 * @param {Array} rawData Dati grezzi degli argomenti presi dall'API
 * @returns Array di argomenti raggruppati per giorno
 */
export default function parseArgomenti(rawData) {
    if (!rawData || rawData.length === 0) return [];

    const result = [];
    let group = [];
    let lastDate = null;

    for (const item of rawData) {
        // Prendo solo la data senza l'orario e lo metto in una variabile in modo da non dover ripetere la stessa operazione più volte
        const [currentDate] = splitDateTime(item.data); // data: "27/11/2025 00:00:00" => "27/11/2025"
        const [publishedDate, publishedTime] = splitDateTime(item.data_pubblicazione); // data_pubblicazione: "27/11/2025 08:15:45" => ["27/11/2025", "08:15:45"]

        const struct = {
            id: item.idArgomento, // identificativo univoco dell'argomento
            materia: item.descMat, // descrizione della materia ex: "DISEGNO E ST. ARTE"
            argomento: item.descArgomenti, // descrizione dell'argomento trattato ex: "Il Seicento - Naturalismo e Caravaggio"
            ore: item.oreLezione.split("-"), // Prendo le ore di lezione e le splitto in un array in caso una lezione copra più ore (es: "4-5" => ["4","5"])
            giorno: currentDate, // giorno in cui è stato trattato l'argomento
            pubblicato: [publishedDate, publishedTime], // data e ora di pubblicazione dell'argomento
        };

        // Siccome axios ritorna i dati di merda (uno dopo l'altro senza raggruppamento) devo fare un controllo per vedere se la data è cambiata in modo da raggruppare gli argomenti per giorno
        // Se la data corrente è diversa dall'ultima data salvata, significa che siamo in un nuovo giorno
        if (currentDate !== lastDate && lastDate !== null) {
            result.push(group); // Aggiungo il gruppo di argomenti al risultato
            group = []; // Resetto il gruppo per il nuovo giorno
        }

        // Aggiungo l'argomento al gruppo corrente se è dello stesso giorno
        // Altrimenti, se è un nuovo giorno, il gruppo è già stato resettato nel blocco if sopra
        group.push(struct);
        lastDate = currentDate; // Aggiorno l'ultima data vista
    }

    // Aggiungi l'ultimo gruppo
    if (group.length > 0) {
        result.push(group); // Aggiungo l'ultimo gruppo di argomenti al risultato
    }

    return result;
}