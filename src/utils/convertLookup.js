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