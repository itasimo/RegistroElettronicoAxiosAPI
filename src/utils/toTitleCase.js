/**
 * Converts a string to title case
 * Each word in the string will have its first letter capitalized and the rest in lowercase
 * @param {String} str - String to convert
 * @returns {String} Title case string
 * @see https://stackoverflow.com/a/196991
 */
export default function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}
