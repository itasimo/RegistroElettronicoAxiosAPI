import { splitDateTime } from "@/utils";
import { decodeHtmlEntities } from "../utils";

export default function parseVerifiche(jsonData) {
    const rawData = jsonData.data;

    // filter only compiti (item.testo == "")
    const compitiData = rawData.filter(item => item.testo === "");

    const result = compitiData.map(item => {
        const [pubblicatoData, pubblicatoOra] = splitDateTime(
            item.inserito.match(/il (\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/)[1]
        );
        return {
            id: null, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            materia: decodeHtmlEntities(item.materia).trim(), // descrizione della materia ex: "DISEGNO E ST. ARTE"
            verifica: decodeHtmlEntities(item.verifica).trim(), // descrizione dell'argomento trattato ex: "Il Seicento - Naturalismo e Caravaggio"
            perGiorno: [item.giorno, null], // giorno in cui è stato assegnato il compito. Orario non disponibile nella API WEB (DISPONIBILE NELL'API MOBILE)
            pubblicato: [pubblicatoData, pubblicatoOra], // data e ora di pubblicazione del compito
        };
    });

    return result;
}