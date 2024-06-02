const AxiosEncode = require('./utils/Axios/encode');
const AxiosDecode = require('./utils/Axios/decode');
const VendorToken = require('./utils/Axios/axios.json').VendorToken;

module.exports = async function toSessionID(CF, usersession){
    const requestParam = await GetRequestParam(CF, usersession)

    let cookie;



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
    urlencoded.append("parameters", requestParam.parameters);
    urlencoded.append("action", requestParam.action);

    const requestOptions = {
    				method: "POST",
    				headers: myHeaders,
    				body: urlencoded,
    				redirect: "manual"
    };

    await fetch(requestParam.url, requestOptions)
    				.then((response) => cookie = response.headers.get('set-cookie'))
    				.catch((error) => console.error(error));

    return {
        name: cookie.split(';')[0].split('=')[0],
        value: cookie.split(';')[0].split('=')[1]
    }
}


async function GetRequestParam(CF, usersession){

    let requestParam;

    const myHeaders = new Headers();
    myHeaders.append("X-Requested-With", "com.axiositalia.re.students");

    const requestOptions = {
				method: "GET",
				headers: myHeaders,
				redirect: "follow"
    };

    const requestJSON = {
        sCodiceFiscale: CF,
        sSessionGuid: usersession,
        sCommandJSON: {
            sApplication: "FAM",
            sService: "GET_URL_WEB"
        },
        sVendorToken: VendorToken
    };

    await fetch("https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation?json=" + AxiosEncode(requestJSON), requestOptions)
        .then((response) => response.text())
        .then((result) => requestParam = AxiosDecode(result).response)
        .catch((error) => console.error(error));

    return requestParam;
}