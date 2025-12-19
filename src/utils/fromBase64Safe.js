/**
 * Helper to safely decode base64 with Unicode support
 * @param {String} str - Base64 encoded string
 * @returns {String} Decoded string
 */
export default function fromBase64Safe(str) {
    try {
        const binString = atob(str);
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
        return new TextDecoder().decode(bytes);
    } catch (e) {
        // Fallback to standard atob for backwards compatibility
        return atob(str);
    }
}
