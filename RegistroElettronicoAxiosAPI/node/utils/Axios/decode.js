const rc4 = require('./rc4');
const rc4key = require('../../../AxiosJSON/axios.json').rc4key.new;

/**
 * 
 * @param {String} value   Il valore da decodificare
 * @param {Boolean} jsdec  Il valore è un JSON?
 * @returns JSON contente il valore decodificato
 */
module.exports = function AxiosDecode(value, jsdec = true) {

    value = jsdec ? JSON.parse(value) : value;
    let newresp;

    // URL decode la risposta finché non è più possibile
    while (true) {
        newresp = decodeURIComponent(value);
        if (newresp == value) {
            break;
        } else {
            value = newresp;
        }
    }

    let decoded = rc4(rc4key, atob(value));

    decoded = JSON.parse(decoded);

    return decoded;
}