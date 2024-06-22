import rc4 from './rc4.mjs';

const AxiosJSON_URL = "https://raw.githubusercontent.com/Itasimo/RegistroElettronicoAxiosAPI/main/RegistroElettronicoAxiosAPI/AxiosJSON/axios.json";
let AxiosJSON;
await fetch(AxiosJSON_URL).then(response => response.json()).then(data => AxiosJSON = data)
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