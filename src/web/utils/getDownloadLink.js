

// --- Cross-platform fetch (browser or Node.js) ---
function getFetch() {
    if (typeof fetch === 'function') return fetch;
    try {
        // eslint-disable-next-line global-require
        return require('node-fetch');
    } catch (e) {
        throw new Error('No fetch implementation found. Please use Node 18+ or install node-fetch.');
    }
}
const _fetch = getFetch();

// --- Base64 utility ---
const Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode(input) {
        let output = "";
        let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        let i = 0;
        input = this._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output += this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    decode(input) {
        let output = "";
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output += String.fromCharCode(chr1);
            if (enc3 != 64) output += String.fromCharCode(chr2);
            if (enc4 != 64) output += String.fromCharCode(chr3);
        }
        output = this._utf8_decode(output);
        return output;
    },
    _utf8_encode(string) {
        string = string.replace(/\r\n/g, "\n");
        let utftext = "";
        for (let n = 0; n < string.length; n++) {
            const c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if (c > 127 && c < 2048) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    _utf8_decode(utftext) {
        let string = "";
        let i = 0;
        let c = 0, c2 = 0, c3 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if (c > 191 && c < 224) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
};

// --- Helper: processSourceFilename ---
function processSourceFilename(sourceFilename) {
    if (!sourceFilename) return "";
    try {
        const decoded = Base64.decode(sourceFilename);
        const reencoded = Base64.encode(decoded);
        if (reencoded === sourceFilename) {
            return sourceFilename;
        } else {
            return Base64.encode(sourceFilename);
        }
    } catch (error) {
        return Base64.encode(sourceFilename);
    }
}

// --- Helper: getBaseUrl ---
function getBaseUrl(url) {
    try {
        return new URL(url).origin;
    } catch (e) {
        return null;
    }
}

// --- Helper: resolveRelativeUrl ---
function resolveRelativeUrl(base, relative) {
    if (/^https?:\/\//i.test(relative)) return relative;
    try {
        return new URL(relative, base).toString();
    } catch (e) {
        if (relative.startsWith('/')) {
            const u = new URL(base);
            return u.origin + relative;
        }
        return base.replace(/\/[^/]*$/, '/') + relative;
    }
}

// --- Main: handleFileDownload (exported) ---
/**
 * Main function to handle download with all necessary attributes
 * @param {Object} attributes - Attributes from the element
 * @param {string} attributes.dataRoot - The root ID
 * @param {string} attributes.dataFolder - The folder path
 * @param {string} attributes.dataFilename - The filename
 * @param {string} attributes.dataSourceFilename - The original source filename
 * @param {string} currentUrl - Current URL for the requests (the url at which the element was found)
 * @param {Object} options - Additional options
 * @param {boolean} options.returnBuffer - If true, returns file buffer, otherwise returns download URL
 * @param {Object} options.headers - Custom headers to include in requests
 * @param {string} options.suppressErrorLogging - If true, suppresses error logging to console
 * @returns {Promise<string|Buffer>} Download URL or file buffer
 */
export default async function handleFileDownload(attributes, currentUrl, options = {}) {
    const {
        dataRoot,
        dataFolder,
        dataFilename,
        dataSourceFilename,
    } = attributes;

    const {
        returnBuffer = false,
        headers = {},
        suppressErrorLogging = false
    } = options;

    if (!currentUrl) {
        throw new Error('currentUrl is required');
    }
    // Include any additional attributes that are not the required strandard ones
    const params = {
        dataRoot,
        dataFolder,
        dataFilename,
        dataSourceFilename,
        ...attributes
    };
    if (returnBuffer) {
        return await downloadFile(params, currentUrl, headers, suppressErrorLogging);
    } else {
        return await getDownloadLink(params, currentUrl, headers, suppressErrorLogging);
    }
}

/**
 * Prepare download parameters and get the download URL
 * @param {Object} params - Download parameters
 * @param {string} params.dataRoot - The root ID
 * @param {string} params.dataFolder - The folder path
 * @param {string} params.dataFilename - The filename
 * @param {string} params.dataSourceFilename - The original source filename
 * @param {string} baseUrl - Base URL for the requests (e.g., "https://registrofamiglie.axioscloud.it")
 * @param {Object} headers - Optional headers to include in requests
 * @param {boolean} suppressErrorLogging - If true, suppresses error logging to console
 * @returns {Promise<string>} The final download URL
 */
// --- Internal: getDownloadLink ---
async function getDownloadLink(params, currentUrl, headers = {}, suppressErrorLogging = false) {
    const {
        dataRoot,
        dataFolder,
        dataFilename,
        dataSourceFilename
    } = params;

    const baseUrl = getBaseUrl(currentUrl);
    if (!baseUrl) {
        throw new Error('Invalid currentUrl provided');
    }

    // Process the source filename
    let processedSourceFilename = processSourceFilename(dataSourceFilename || "");

    // Create the request payload with all attributes
    // Include any additional attributes that are not the required strandard ones
    const payload = {
        url: "../../Handlers/SD_UploadDownloadHandler.aspx",
        root: dataRoot,
        folder: dataFolder,
        filename: dataFilename,
        SourceFileName: processedSourceFilename,
        ...params
    };

    // Stringify and Base64 encode the payload
    const payloadJson = JSON.stringify(payload);
    const encodedPayload = Base64.encode(payloadJson);

    // Make the first request to get the download URL
    const firstRequestUrl = `${baseUrl}/Pages/COMMON/COMMON_Ajax_Get.aspx?action=DOWNLOAD_PREPARE_URL`;
    const defaultHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${baseUrl}/Pages/SD/SD_Dashboard.aspx`,
        'Origin': baseUrl,
        ...headers
    };

    try {
        const response = await _fetch(firstRequestUrl, {
            method: 'POST',
            headers: defaultHeaders,
            body: encodedPayload,
            timeout: 960000 // 16 minutes timeout as in original code
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.errorcode === -1) {
            throw new Error(data.errormsg || 'Error from server');
        }
        if (!data.json) {
            if (!suppressErrorLogging) {
                console.error('No download URL received from server:', data, params);
            }
            return null;
        }
        const isExternal = /^https?:\/\//i.test(data.json);
        if (isExternal) {
            return data.json; // Already an absolute URL
        }
        const absoluteUrl = resolveRelativeUrl(currentUrl, data.json);
        return absoluteUrl;
    } catch (error) {
        if (!suppressErrorLogging) {
            console.error('Error getting download URL:', error);
        }
        throw error;
    }
}

/**
 * Download file using the provided attributes
 * @param {Object} params - Download parameters
 * @param {string} params.dataRoot - The root ID
 * @param {string} params.dataFolder - The folder path
 * @param {string} params.dataFilename - The filename
 * @param {string} params.dataSourceFilename - The original source filename
 * @param {string} baseUrl - Base URL for the requests
 * @param {Object} headers - Optional headers to include in requests
 * @param {boolean} suppressErrorLogging - If true, suppresses error logging to console
 * @returns {Promise<Buffer>} The downloaded file as Buffer
 */
// --- Internal: downloadFile ---
async function downloadFile(params, currentUrl, headers = {}, suppressErrorLogging = false) {
    try {
        // First get the download URL
        const downloadUrl = await getDownloadLink(params, currentUrl, headers, suppressErrorLogging);

        // Extract base URL for referer
        const baseUrl = getBaseUrl(currentUrl);

        // Make the actual download request
        const response = await _fetch(downloadUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': `${baseUrl}/Pages/SD/SD_Dashboard.aspx`,
                ...headers
            }
        });

        if (!response.ok) {
            throw new Error(`Download failed! status: ${response.status}`);
        }

        // Return the file as Buffer
        return await response.buffer();

    } catch (error) {
        if (!suppressErrorLogging) {
            console.error('Error downloading file:', error);
        }
        throw error;
    }
}


export {
    Base64,
    getDownloadLink,
    downloadFile,
    processSourceFilename,
    handleFileDownload
};