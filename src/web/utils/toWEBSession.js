import { encode, decode } from "@/utils";
import { VendorToken } from "@/configs";
import extractCookie from "./extractCookie";

/**
 * Converte una sessione app mobile in una sessione web valida.
 * Questo implementa il ponte SSO tra app mobile e portale web.
 * Per una spiegazione tecnica dettagliata, vedi: ./docs/WEB Conversion.md
 *
 * @param {string} codiceFiscale - School fiscal code
 * @param {string} usersession - User session identifier (APP)
 * @returns {Promise<Object>} Session data including sessionID (WEB session cookie), axToken (RVT), redirectUrl
 */
async function toWEBSession(codiceFiscale, usersession) {
    // Step 1: Get SSO parameters from mobile backend
    const registroFamiglieParams = await getRegistroFamiglieParameters(
        codiceFiscale,
        usersession
    );

    // Step 2: Exchange SSO blob for ASP.NET session cookie
    const [registroFamiglieCookie, redirectUrl] =
        await convertToRegistroFamiglieCookie(registroFamiglieParams);

    // Step 3: Load dashboard to extract AXToken (anti-forgery token)
    const axToken = await fetchAxToken(registroFamiglieCookie, redirectUrl);

    // === CRITICAL SESSION INITIALIZATION ===
    // DashboardLoad writes user context to server-side session store
    // Without this, session exists but returns 400 on data requests
    await fetchDashboardLoad(registroFamiglieCookie, redirectUrl, axToken);

    return {
        sessionID: registroFamiglieCookie,
        redirectUrl: `https://registrofamiglie.axioscloud.it${redirectUrl}`,
        axToken: axToken,
    };
}

/**
 * Retrieves SSO parameters from mobile API
 * @param {string} codiceFiscale - User's fiscal code
 * @param {string} usersession - Mobile session GUID
 * @returns {Promise<Object>} SSO parameters including URL and encoded blob
 */
async function getRegistroFamiglieParameters(codiceFiscale, usersession) {
    const headers = new Headers({
        "content-type": "text/plain; charset=utf-8",
        "x-requested-with": "com.axiositalia.re.students",
        "user-agent":
            "Mozilla/5.0 (Linux; Android 15; 23122PCD1G Build/AQ3A.240912.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.115 Mobile Safari/537.36",
    });

    const requestPayload = {
        sCodiceFiscale: codiceFiscale,
        sSessionGuid: usersession,
        sCommandJSON: {
            sApplication: "FAM",
            sService: "GET_URL_WEB",
        },
        sVendorToken: VendorToken,
    };

    const requestOptions = {
        method: "GET",
        headers: headers,
    };

    try {
        const response = await fetch(
            `https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation?json=${encode(requestPayload)}`,
            requestOptions
        );
        const result = await response.text();
        return decode(result).response;
    } catch (error) {
        console.error("Failed to get Registro Famiglie parameters:", error);
        throw error;
    }
}

/**
 * Exchanges SSO blob for ASP.NET session cookie
 * Note: Server sends duplicate cookies - use the SECOND one
 * @param {Object} authParams - SSO parameters from mobile API
 * @returns {Promise<Array>} [sessionCookie, redirectUrl]
 */
async function convertToRegistroFamiglieCookie(authParams) {
    const headers = new Headers({
        "content-type": "application/x-www-form-urlencoded",
        "user-agent":
            "Mozilla/5.0 (Linux; Android 15; 23122PCD1G Build/AQ3A.240912.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.115 Mobile Safari/537.36",
        "x-requested-with": "com.axiositalia.re.students",
    });

    const urlencoded = new URLSearchParams();
    urlencoded.append("parameters", authParams.parameters);
    urlencoded.append("action", authParams.action);

    const requestOptions = {
        method: "POST",
        headers: headers,
        body: urlencoded,
        redirect: "manual",
    };

    try {
        const response = await fetch(authParams.url, requestOptions);
        const cookieHeader = response.headers.get("set-cookie");

        if (!cookieHeader) {
            throw new Error("No Set-Cookie header in response");
        }

        // Extract redirect URL from meta refresh tag
        const responseText = await response.text();
        const regex = /href="([^"]*)"/;
        const match = responseText.match(regex);
        const url = match ? match[1] : null;

        // Extract the ASP.NET_SessionId from the cookie header
        const sessionCookie = extractCookie(cookieHeader, "ASP.NET_SessionId");
        return [sessionCookie, url];
    } catch (error) {
        console.error("Failed to get Registro Famiglie cookie:", error);
        throw error;
    }
}

/**
 * Loads dashboard page and extracts AXToken (static session context token)
 * @param {string} registroFamiglieCookie - ASP.NET session cookie
 * @param {string} redirectUrl - Dashboard URL with 's' parameter
 * @returns {Promise<string>} AXToken for RVT header
 */
async function fetchAxToken(registroFamiglieCookie, redirectUrl) {
    const headers = new Headers({
        Cookie: `ASP.NET_SessionId=${registroFamiglieCookie}`,
        "User-Agent":
            "Mozilla/5.0 (Linux; Android 15; 23122PCD1G Build/AQ3A.240912.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.115 Mobile Safari/537.36",
        "X-Requested-With": "com.axiositalia.re.students",
    });

    try {
        const response = await fetch(
            `https://registrofamiglie.axioscloud.it${redirectUrl}`,
            { method: "GET", headers }
        );
        const responseText = await response.text();
        const regex = /id='_AXToken'\s+value='([^']+)'/;
        const match = responseText.match(regex);

        if (match && match[1]) {
            return match[1];
        }

        throw new Error("AXToken not found in dashboard response");
    } catch (error) {
        console.error("Failed to fetch AXToken:", error);
        throw error;
    }
}

/**
 * CRITICAL: Initializes session state by loading user context
 * Required before any data API calls will succeed
 * @param {string} registroFamiglieCookie - ASP.NET session cookie
 * @param {string} redirectUrl - Dashboard URL for referer
 * @param {string} axToken - RVT token from dashboard
 * @returns {Promise<string>} Response text
 */
async function fetchDashboardLoad(
    registroFamiglieCookie,
    redirectUrl,
    axToken
) {
    const timestamp = Date.now();
    const url = `https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=DashboardLoad&_=${timestamp}`;

    const headers = new Headers({
        "x-requested-with": "XMLHttpRequest",
        referer: `https://registrofamiglie.axioscloud.it${redirectUrl}`,
        cookie: `ASP.NET_SessionId=${registroFamiglieCookie}`,
        RVT: axToken,
        "user-agent":
            "Mozilla/5.0 (Linux; Android 15; 23122PCD1G Build/AQ3A.240912.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.115 Mobile Safari/537.36",
    });

    const requestOptions = {
        method: "GET",
        headers,
    };

    try {
        const response = await fetch(url, requestOptions);
        return await response.text();
    } catch (error) {
        console.error("Failed to fetch DashboardLoad:", error);
        throw error;
    }
}

export default toWEBSession;
export { toWEBSession, fetchDashboardLoad };