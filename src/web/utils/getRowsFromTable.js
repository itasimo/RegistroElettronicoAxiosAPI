export default function getRowsFromTable(tableElement) {
    if (!tableElement) {
        console.warn("getRowsFromTable: tableElement is null or undefined");
        return [];
    }
    const tbody = tableElement ? tableElement.querySelector('tbody') : null;
    const rows = tbody ? tbody.querySelectorAll('tr') : [];
    return rows;
}