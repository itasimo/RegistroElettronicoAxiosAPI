/**
 * Rimuove i secondi da una stringa di orario nel formato HH:MM:SS
 * @param {string} timeStr Stringa di orario nel formato
 * @return {string} Stringa di orario senza secondi nel formato HH:MM
 */
export default function removeSeconds(timeStr) {
    if (typeof timeStr !== 'string') return timeStr;
    const parts = timeStr.split(':');
    if (parts.length !== 3) return timeStr;
    return parts.slice(0, 2).join(':');
}