import { splitDateTime } from "@/utils";
import { decodeHtmlEntities } from "../utils";

export default function parseCompiti(jsonData) {
    const rawData = jsonData.data;

    // filter only compiti (item.verifica == "")
    const compitiData = rawData.filter(item => item.verifica === "");

    const result = compitiData.map(item => {
        const [pubblicatoData, pubblicatoOra] = splitDateTime(
            item.inserito.match(/il (\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/)[1]
        );
        return {
            id: null, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            materia: decodeHtmlEntities(item.materia).trim(), // descrizione della materia ex: "DISEGNO E ST. ARTE"
            compito: decodeHtmlEntities(item.testo).trim(), // descrizione dell'argomento trattato ex: "Il Seicento - Naturalismo e Caravaggio"
            perGiorno: [item.giorno, null], // giorno in cui è stato assegnato il compito. Orario non disponibile nella API WEB (DISPONIBILE NELL'API MOBILE)
            pubblicato: [pubblicatoData, pubblicatoOra], // data e ora di pubblicazione del compito
        };
    });

    return result;
}