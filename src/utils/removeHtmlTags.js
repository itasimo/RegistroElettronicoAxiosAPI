/**
 * Rimuove i tag HTML da una stringa
 * @param {String} str - Stringa contenente HTML
 * @returns {String} Stringa senza tag HTML
 */
export default function removeHtmlTags(str) {
    return str.replace(/\<(.*?)\>/gm, '');
}
