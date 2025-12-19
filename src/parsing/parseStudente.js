import { toBool } from "@/utils";

/**
 * Parsea i dati dello studente in una struttura più comoda
 * @param {Object} rawData - Dati grezzi dello studente presi dall'API di Axios
 * @returns {Object} Oggetto contenente tutte le informazioni dello studente
 */
export default function parseStudente(rawData) {
    return {
        idAlunno: rawData.idAlunno,
        id: rawData.userId,
        cognome: rawData.cognome,
        nome: rawData.nome,
        sesso: rawData.sesso,
        dataNascita: rawData.dataNascita,
        avatar: rawData.avatar,
        idPlesso: rawData.idPlesso,
        security: rawData.security,
        flagGiustifica: toBool(rawData.flagGiustifica, 'S'),
        flagInvalsi: toBool(rawData.flagInvalsi, 'S'),
        flagDocumenti: toBool(rawData.flagDocumenti, 'S'),
        flagPagoScuola: toBool(rawData.flagPagoScuola, 'S'),
        flagConsiglioOrientamento: toBool(rawData.flagConsiglioOrientamento, 'S')
    };
}