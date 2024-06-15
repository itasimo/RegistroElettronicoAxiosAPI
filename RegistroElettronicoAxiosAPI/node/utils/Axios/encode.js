const rc4 = require('./rc4');
const rc4key = require('../../../AxiosJSON/axios.json').rc4key.new;

/**
 * 
 * @param {JSON} json  JSON da codificare
 * @param {Number} num  Numero di volte che si vuole codificare con Url Encoding
 * @returns Encoded string
 */
module.exports = function AxiosEncode(json, num = 1) {

    let encoded = rc4(rc4key, JSON.stringify(json));

    encoded = btoa(encoded);

    for (let i = 0; i < num; i++) encoded = encodeURIComponent(encoded);

    return encoded;
}