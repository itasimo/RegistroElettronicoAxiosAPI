/**
 * Converte un codice in una descrizione usando lookup tables
 * @param {String} code - Il codice da convertire
 * @param {Array} codes - Array di codici
 * @param {Array} descriptions - Array di descrizioni corrispondenti ai codici
 * @returns {String} La descrizione corrispondente al codice, o il codice stesso se non trovato
 *
 * @example
 * const tipoNum = ['1', '4', '5'];
 * const tipoStr = ['Circolare', 'Scuola/Famiglia', 'Comunicazione'];
 * convertLookup('4', tipoNum, tipoStr); // Ritorna 'Scuola/Famiglia'
 */
export default function convertLookup(code, codes, descriptions) {
    if (!code) return code;
    const index = codes.indexOf(code);
    return index !== -1 ? descriptions[index] : code;
}

// MOST USED LOOKUP TABLES IN THE PROJECT
const mesi = {
    mesiStr: [
        "gennaio",
        "febbraio",
        "marzo",
        "aprile",
        "maggio",
        "giugno",
        "luglio",
        "agosto",
        "settembre",
        "ottobre",
        "novembre",
        "dicembre",
    ],
    mesiNum: [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
    ],
};

const commonConvertLookups = {
    mesi
};

export { commonConvertLookups };