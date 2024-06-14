import rc4 from './rc4.mjs';
import AxiosJSON from './axios.json' assert { type: 'json' };
const rc4key = AxiosJSON.rc4key.new;

/**
 * 
 * @param {JSON} json  JSON da codificare
 * @param {Number} num  Numero di volte che si vuole codificare con Url Encoding
 * @returns Encoded string
 */
export default function AxiosEncode(json, num = 1) {

    let encoded = rc4(rc4key, JSON.stringify(json));

    encoded = btoa(encoded);

    for (let i = 0; i < num; i++) encoded = encodeURIComponent(encoded);

    return encoded;
}