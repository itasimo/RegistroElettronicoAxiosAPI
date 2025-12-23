import { encode, decode } from '@/utils';
import { VendorToken } from '@/configs';
import extractCookie from './extractCookie';

/**
 * Converts mobile app usersession to web ASP.NET_SessionId for scuoladigitale.axioscloud.it
 * 
 * This function performs a two-step conversion:
 * 1. Mobile usersession → Registro Famiglie session cookie
 * 2. Registro Famiglie session → Scuola Digitale session cookie
 * 
 * For detailed conversion documentation, see ./docs
 * 
 * @param {string} codiceFiscale - School's tax identification code (Codice Fiscale)
 * @param {string} usersession - Mobile app session identifier
 * @returns {Object} - Session cookie object containing name and value
 */
export default async function toSessionID(codiceFiscale, usersession) {
    // Step 1: Get Registro Famiglie session cookie using mobile credentials
    const registroFamiglieParams = await getRegistroFamiglieParameters(codiceFiscale, usersession);
    const registroFamiglieCookie = await convertToRegistroFamiglieCookie(registroFamiglieParams);

    // Step 2: Convert Registro Famiglie session to Scuola Digitale session
    const scuolaDigitaleParams = await getScuolaDigitaleParameters(registroFamiglieCookie);
    const scuolaDigitaleCookie = await convertToScuolaDigitaleCookie(scuolaDigitaleParams);

    return scuolaDigitaleCookie;
}

// ============================================================================
// REGISTRO FAMIGLIE (FIRST CONVERSION STEP)
// ============================================================================

/**
 * Retrieves authentication parameters needed to obtain Registro Famiglie session
 * 
 * @param {string} codiceFiscale - School's tax identification code
 * @param {string} usersession - Mobile app session identifier
 * @returns {Object} - Authentication parameters including action and encrypted data
 */
async function getRegistroFamiglieParameters(codiceFiscale, usersession) {
    const headers = new Headers({
        "X-Requested-With": "com.axiositalia.re.students"
    });

    const requestPayload = {
        sCodiceFiscale: codiceFiscale,
        sSessionGuid: usersession,
        sCommandJSON: {
            sApplication: "FAM",
            sService: "GET_URL_WEB"
        },
        sVendorToken: VendorToken
    };

    const requestOptions = {
        method: "GET",
        headers: headers,
        redirect: "follow"
    };

    let responseData;

    try {
        const response = await fetch(
            `https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation?json=${encode(requestPayload)}`,
            requestOptions
        );
        const result = await response.text();
        responseData = decode(result).response;
    } catch (error) {
        console.error("Failed to get Registro Famiglie parameters:", error);
        throw error;
    }

    return responseData;
}

/**
 * Converts authentication parameters to Registro Famiglie session cookie
 * 
 * Makes a POST request that returns a 302 redirect with Set-Cookie header
 * 
 * @param {Object} authParams - Authentication parameters from getRegistroFamiglieParameters
 * @returns {string} - ASP.NET_SessionId cookie value for Registro Famiglie
 */
async function convertToRegistroFamiglieCookie(authParams) {
    const headers = new Headers({
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "Mozilla/5.0 (Linux; Android 7.1.1; ONEPLUS A5000 Build/NMF26X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.193 Safari/537.36",
        "x-requested-with": "com.axiositalia.re.students"
    });

    const formData = new URLSearchParams();
    formData.append("parameters", authParams.parameters);
    formData.append("action", authParams.action);

    const requestOptions = {
        method: "POST",
        headers: headers,
        body: formData,
        redirect: "manual" // Handle redirect manually to capture cookies
    };

    try {
        const response = await fetch(authParams.url, requestOptions);
        const cookieHeader = response.headers.get('set-cookie');
        
        if (!cookieHeader) {
            throw new Error("toSessionID (RF): No Set-Cookie header in response");
        }
        
        // Extract the ASP.NET_SessionId from the cookie header
        // Note: Response contains multiple cookies, we need the second ASP.NET_SessionId
        const sessionCookie = extractCookie(cookieHeader, 'ASP.NET_SessionId');
        return sessionCookie;
    } catch (error) {
        console.error("Failed to get Registro Famiglie cookie:", error);
        throw error;
    }
}

// ============================================================================
// SCUOLA DIGITALE (SECOND CONVERSION STEP)
// ============================================================================

/**
 * Gets parameters needed for SSO (Single Sign-On) to Scuola Digitale
 * 
 * @param {string} registroFamiglieCookie - Valid Registro Famiglie session cookie
 * @returns {Object} - SSO parameters for Scuola Digitale authentication
 */
async function getScuolaDigitaleParameters(registroFamiglieCookie) {
    const headers = new Headers({
        "content-type": "application/json; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        "origin": "https://registrofamiglie.axioscloud.it",
        "cookie": `ASP.NET_SessionId=${registroFamiglieCookie}`
    });

    const requestBody = {
        appurl: "https://scuoladigitale.axioscloud.it/Pages/SD/SD_Login.aspx"
    };

    const requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody)
    };

    try {
        const response = await fetch(
            'https://registrofamiglie.axioscloud.it/Pages/SD/SD_Ajax_Post.aspx?Action=SSO&Others=undefined&App=SD',
            requestOptions
        );
        return await response.json();
    } catch (error) {
        console.error("Failed to get Scuola Digitale parameters:", error);
        throw error;
    }
}

/**
 * Converts SSO parameters to Scuola Digitale session cookie
 * 
 * @param {Object} ssoParams - SSO parameters from getScuolaDigitaleParameters
 * @returns {string} - ASP.NET_SessionId cookie value for Scuola Digitale
 */
async function convertToScuolaDigitaleCookie(ssoParams) {
    const headers = new Headers({
        "content-type": "application/x-www-form-urlencoded",
        "origin": "https://registrofamiglie.axioscloud.it",
        "referer": "https://registrofamiglie.axioscloud.it/",
        "user-agent": "Mozilla/5.0 (Linux; Android 13; 2201117SY Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.64 Mobile Safari/537.36",
        "x-requested-with": "com.axiositalia.re.students"
    });

    const formData = new URLSearchParams();
    formData.append("parameters", ssoParams.parameters);
    formData.append("action", ssoParams.action);

    const requestOptions = {
        method: "POST",
        headers: headers,
        body: formData,
        redirect: "manual"
    };

    try {
        const response = await fetch(ssoParams.url, requestOptions);
        const cookieHeader = response.headers.get('set-cookie');
        
        if (!cookieHeader) {
            throw new Error("toSessionID (SD): No Set-Cookie header in response");
        }
        
        // Extract the ASP.NET_SessionId from the cookie header
        // Note: Response contains multiple cookies, we need the second ASP.NET_SessionId
        const sessionCookie = extractCookie(cookieHeader, 'ASP.NET_SessionId');
        return sessionCookie;
    } catch (error) {
        console.error("Failed to get Scuola Digitale cookie:", error);
        throw error;
    }
}