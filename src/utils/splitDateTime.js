/**
 * Estrae data e ora da una stringa datetime
 */
export default function splitDateTime(datetime) {
    if (datetime === null) return null;
    return datetime.split(" ");
}