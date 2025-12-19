/**
 * Converte un codice in una descrizione usando lookup tables
 */
export default function convertLookup(code, codes, descriptions) {
    const index = codes.indexOf(code);
    return index !== -1 ? descriptions[index] : code;
}