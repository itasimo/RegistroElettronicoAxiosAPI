import rc4 from './rc4.mjs';
import AxiosJSON from '../../../AxiosJSON/axios.json' assert { type: 'json' };
const rc4key = AxiosJSON.rc4key.new;

/**
 * 
 * @param {String} value   Il valore da decodificare
 * @param {Boolean} jsdec  Il valore è un JSON?
 * @returns JSON contente il valore decodificato
 */
export default function AxiosDecode(value, jsdec = true) {

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