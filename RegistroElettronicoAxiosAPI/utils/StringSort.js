/**
 * 
 * Dato una lista e una stringa la funzione restituisce quante volte la stringa è ripetuta
 * 
 * @param {Array} arr - La lista contenete i valori
 * @param {String} value - Il valore che si vuole la ridondanza
 * @returns Il numero di volte che "value" è ripetuto in "arr"
 * 
 */

module.exports = function itemCounter(arr, value) {
        return arr.filter((x) => x == value).length;
}
