import { htmlParser, getRowsFromTable, querySelector, querySelectorAll } from "../utils";

export default function parseOrario(htmlString) {

    const orario = {
        lunedi: [],
        martedi: [],
        mercoledi: [],
        giovedi: [],
        venerdi: [],
        sabato: []
    };

    const root = htmlParser(htmlString);
    const table = querySelector(root, "table#tableOrario");
    const rows = getRowsFromTable(table);

    rows.forEach((row) => {
        const cells = querySelectorAll(row, "td");
        if (cells.length != 6) return; // Salta righe non valide e la prima riga blu (non ho capito a cosa serve, non contiene dati)
        cells.forEach((cell, Igiorno) => { // Igiorno è l'indice della cella, da 0 a 5, che corrisponde a lunedì-sabato
            const materia = cell.textContent.trim() || null; // Se la cella è vuota (materia non inserita) restituisci null invece di stringa vuota
            const giorno = Object.keys(orario)[Igiorno];
            orario[giorno].push(materia);
        });
    });

    return orario;
}