import { decodeHtmlEntities } from "../utils";

export default function parseArgomenti(jsonData) {
    const rawData = jsonData.data;
    
    if (!rawData || rawData.length === 0) return [];

    const result = [];
    let group = [];
    let lastDate = null;

    for (const item of rawData) {
        const currentDate = item.giorno; // Already formatted as "DD/MM/YYYY"

        const struct = {
            id: null, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            materia: decodeHtmlEntities(item.materia), // descrizione della materia ex: "DISEGNO E ST. ARTE"
            argomento: decodeHtmlEntities(item.testo), // descrizione dell'argomento trattato ex: "Il Seicento - Naturalismo e Caravaggio"
            ore: null, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            giorno: currentDate, // giorno in cui è stato trattato l'argomento
            pubblicato: [null, null], // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            inseritoDa: item.inserito // Il docente che ha inserito l'argomento
        };

        // Group argomenti by date, following the same logic as mobile API parser
        // When the date changes, push the current group and start a new one
        if (currentDate !== lastDate && lastDate !== null) {
            result.push(group); // Add the group of argomenti to result
            group = []; // Reset the group for the new date
        }

        // Add the argomento to the current group
        group.push(struct);
        lastDate = currentDate; // Update the last seen date
    }

    // Add the last group if it has items
    if (group.length > 0) {
        result.push(group);
    }

    return result;
}