/**
 * Converte stringhe booleane in boolean
 * @param {any} value Valore da convertire
 * @param {string} trueValue Valore che rappresenta il vero (default: "True")
 * @returns {boolean} Valore booleano
 */
export default function toBool(value, trueValue = "True") {
    return value == trueValue;
}