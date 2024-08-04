const AxiosEncode = require('./utils/Axios/encode');
const AxiosDecode = require('./utils/Axios/decode');
const VendorToken = require('../AxiosJSON/axios.json').VendorToken;

/**
 * Converte usersession [APP mobile] in ASP.NET_SessionId (scuoladigitale.axioscloud.it) [versione Web]
 * 
 * Per ulteriori informazioni sulla conversione, consulta la documentazione correlata nella cartella ./docs
 * 
 * @param {String} CF - Codice Fiscale della scuola
 * @param {String} usersession - usersession
 * @returns {Object} - Oggetto contenente il nome e il valore del cookie di sessione
 */

module.exports = async function toSessionID(CF, usersession) {

    // Get the cookie (ASP.NET_SessionId) of registrofamiglie.axioscloud.it
    const RF_params = await GetRequestPrams_rf(CF, usersession);
    const RF_cookie = await CovertToCookie_rf(RF_params);

    // Convert the cookie (ASP.NET_SessionId) of registrofamiglie.axioscloud.it to ASP.NET_SessionId of scuoladigitale.axioscloud.it
    const SD_params = await GetRequestPrams_sd(RF_cookie);
    const SD_cookie = await CovertToCookie_sd(SD_params);

    return SD_cookie;
};


/**
 * 
 * Parametri richiesti per la conversione (registrofamiglie.axioscloud.it)
 * 
 * @param {String} CodiceFiscale Codice Fiscale della scuola
 * @param {String} usersession Usersession
 * @returns Parametri richiesti per la conversione (registrofamiglie.axioscloud.it)
 */
async function GetRequestPrams_rf(CodiceFiscale, usersession) {

    const myHeaders = new Headers();
    myHeaders.append("X-Requested-With", "com.axiositalia.re.students");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    const json = {
        sCodiceFiscale: CodiceFiscale,
        sSessionGuid: usersession,
        sCommandJSON:{
            sApplication: "FAM",
            sService: "GET_URL_WEB"
        },
        sVendorToken: VendorToken
    }

    let RF_params_response;

    await fetch(`https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation?json=${AxiosEncode(json)}`, requestOptions)
            .then((response) => response.text())
            .then((result) => {RF_params_response = AxiosDecode(result).response})
            .catch((error) => console.error(error));

    return RF_params_response;
}



/**
 * 
 * (registrofamiglie.axioscloud.it)
 * 
 * @param {JSON} params Request parameters containing the action and the parameters
 * @returns ASP.NET_SessionId (registrofamiglie.axioscloud.it)
 */

async function CovertToCookie_rf(params) {

    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-encoding", "gzip, deflate, br");
    myHeaders.append("accept-language", "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7");
    myHeaders.append("cache-control", "max-age=0");
    myHeaders.append("connection", "keep-alive");
    myHeaders.append("content-type", "application/x-www-form-urlencoded");
    myHeaders.append("host", "registrofamiglie.axioscloud.it");
    myHeaders.append("origin", "null");
    myHeaders.append("sec-ch-ua", "\"Android WebView\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("sec-ch-ua-platform", "\"Android\"");
    myHeaders.append("sec-fetch-dest", "document");
    myHeaders.append("sec-fetch-mode", "navigate");
    myHeaders.append("sec-fetch-site", "cross-site");
    myHeaders.append("upgrade-insecure-requests", "1");
    myHeaders.append("user-agent", "Mozilla/5.0 (Linux; Android 7.1.1; ONEPLUS A5000 Build/NMF26X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.193 Safari/537.36");
    myHeaders.append("x-requested-with", "com.axiositalia.re.students");
    
    const urlencoded = new URLSearchParams();
    urlencoded.append("parameters", params.parameters);
    urlencoded.append("action", params.action);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "manual" // The response will be a 302 redirect to the dashboard
    };

    let cookies;

    await fetch(params.url, requestOptions)
            .then((response) => cookies = response.headers.get('set-cookie'))
            .catch((error) => console.error(error));


    const cookie = cookies.split('ASP.NET_SessionId=')[2].split(';')[0]; // Get the ultimate ASP.NET_SessionId (registrofamiglie.axioscloud.it)

    return cookie;
}


/**
 * 
 * (scuoladigitale.axioscloud.it)
 * 
 * @param {String} RegistroFamiglie_cookie ASP.NET_SessionId (registrofamiglie.axioscloud.it)
 * @returns Request parameters containing the action and the parameters for the conversion (scuoladigitale.axioscloud.it)
 */

async function GetRequestPrams_sd(RegistroFamiglie_cookie) {

    const myHeaders = new Headers();
    myHeaders.append("host", "registrofamiglie.axioscloud.it");
    myHeaders.append("connection", "keep-alive");
    myHeaders.append("sec-ch-ua", "\"Not)A;Brand\";v=\"99\", \"Android WebView\";v=\"127\", \"Chromium\";v=\"127\"");
    myHeaders.append("rvt", "OTY2RjgwMDUzQjJFMkIxMkM0REZDRUY1RDUxQkY0Nzk=");
    myHeaders.append("sec-ch-ua-mobile", "?1");
    myHeaders.append("user-agent", "Mozilla/5.0 (Linux; Android 13; 2201117SY Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.64 Mobile Safari/537.36");
    myHeaders.append("content-type", "application/json; charset=UTF-8");
    myHeaders.append("accept", "text/html, */*; q=0.01");
    myHeaders.append("x-requested-with", "XMLHttpRequest");
    myHeaders.append("sec-ch-ua-platform", "\"Android\"");
    myHeaders.append("origin", "https://registrofamiglie.axioscloud.it");
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("accept-encoding", "gzip, deflate, br, zstd");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("cookie", `ASP.NET_SessionId=${RegistroFamiglie_cookie}`);

    const body = {
        appurl: "https://scuoladigitale.axioscloud.it/Pages/SD/SD_Login.aspx"
    }

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(body)
    };

    let SD_params_response;
      
    await fetch('https://registrofamiglie.axioscloud.it/Pages/SD/SD_Ajax_Post.aspx?Action=SSO&Others=undefined&App=SD', requestOptions)
            .then(response => response.json())
            .then(response => SD_params_response = response)
            .catch(err => console.error(err));
    
    return SD_params_response;
}


/**
 * 
 * (scuoladigitale.axioscloud.it)
 * 
 * @param {JSON} params 
 * @returns ASP.NET_SessionId (scuoladigitale.axioscloud.it)
 */

async function CovertToCookie_sd(params) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-encoding", "gzip, deflate, br, zstd");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("cache-control", "max-age=0");
    myHeaders.append("connection", "keep-alive");
    myHeaders.append("content-type", "application/x-www-form-urlencoded");
    myHeaders.append("host", "scuoladigitale.axioscloud.it");
    myHeaders.append("origin", "https://registrofamiglie.axioscloud.it");
    myHeaders.append("referer", "https://registrofamiglie.axioscloud.it/");
    myHeaders.append("sec-ch-ua", "\"Not)A;Brand\";v=\"99\", \"Android WebView\";v=\"127\", \"Chromium\";v=\"127\"");
    myHeaders.append("sec-ch-ua-mobile", "?1");
    myHeaders.append("sec-ch-ua-platform", "\"Android\"");
    myHeaders.append("sec-fetch-dest", "document");
    myHeaders.append("sec-fetch-mode", "navigate");
    myHeaders.append("sec-fetch-site", "same-site");
    myHeaders.append("sec-fetch-user", "?1");
    myHeaders.append("upgrade-insecure-requests", "1");
    myHeaders.append("user-agent", "Mozilla/5.0 (Linux; Android 13; 2201117SY Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.64 Mobile Safari/537.36");
    myHeaders.append("x-requested-with", "com.axiositalia.re.students");


    const urlencoded = new URLSearchParams();
    urlencoded.append("parameters", params.parameters);
    urlencoded.append("action", params.action);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "manual"
    };


    let cookies;

    await fetch(params.url, requestOptions)
            .then((response) => cookies = response.headers.get('set-cookie'))
            .catch((error) => console.error(error));


    const cookie = cookies.split('ASP.NET_SessionId=')[2].split(';')[0]; // Get the ultimate ASP.NET_SessionId (registrofamiglie.axioscloud.it)

    return cookie;
}