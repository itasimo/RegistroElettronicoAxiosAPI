/**
 * Helper to safely encode to base64 with Unicode support
 * @param {String} str - String to encode
 * @returns {String} Base64 encoded string
 */
export default function toBase64Safe(str) {
    try {
        const bytes = new TextEncoder().encode(str);
        const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
        return btoa(binString);
    } catch (e) {
        // Fallback to standard btoa for backwards compatibility
        return btoa(str);
    }
}
