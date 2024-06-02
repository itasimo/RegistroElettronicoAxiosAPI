/**
 * 
 * Funzione che data una stringa e il posto della lettera la rimuove
 * @param {String} val - Stringa
 * @param {Number} i - Numero della lettera da rimuovere
 * @returns Stringa con la lettera rimossa
 * 
 */

module.exports = function taglia(val, i) {
    var arr = val.split(""); arr.splice(i - 1, 1); return arr.join("")
}
