export default function getRowsFromTable(tableElement) {
    const tbody = tableElement ? tableElement.querySelector('tbody') : null;
    const rows = tbody ? tbody.querySelectorAll('tr') : [];
    return rows;
}