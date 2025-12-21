import rc4 from './rc4.js';
import { rc4key } from '@/configs';

/**
 * 
 * @param {JSON} json  JSON da codificare
 * @param {Number} num  Numero di volte che si vuole codificare con Url Encoding
 * @returns Encoded string
 */
export default function AxiosEncode(json, num = 1) {

    let encoded = rc4(rc4key.new, JSON.stringify(json));

    encoded = btoa(encoded);

    for (let i = 0; i < num; i++) {encoded = encodeURIComponent(encoded)};

    return encoded;
}