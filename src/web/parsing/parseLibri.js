import { htmlParser, querySelector, querySelectorAll, getRowsFromTable, attrOf } from "../utils";

export default function parseLibri(htmlString) {
    // Rimuovi tutti i tag <small> e </small> perché li mandano a cazzo 
    // e il parser non riesce a gestirli se non sono mai chiusi
    htmlString = htmlString.replace(/<small>/g, '').replace(/<\/small>/g, '');
    
    const root = htmlParser(htmlString);
    const table = querySelector(root, 'table#rLibriTesto');
    const rows = getRowsFromTable(table);

    const libri = [];
    
    for (const row of rows) {
        const cells = querySelectorAll(row, 'td');
        // Ogni riga deve avere almeno 12 celle per essere valida
        if (cells.length >= 12) {
            // Estrai la materia dalla prima cella
            const materia = cells[0].textContent.trim();
            
            // Estrai l'URL dell'immagine di copertina
            // Se l'immagine non esiste, querySelector restituisce null e attrOf gestisce il caso con ?.trim()
            const img = attrOf(querySelector(cells[1], 'img'), 'src')?.trim() ?? null;
            
            // Estrai il codice ISBN
            const isbn = cells[2].textContent.trim();
            
            // Estrai autore/curatore/traduttore
            const autore = cells[3].textContent.trim();
            
            // Estrai titolo e sottotitolo (separati da <br>)
            const nomeCompleto = cells[4].innerHTML.trim().split('<br>');
            const titolo = nomeCompleto[0].trim();
            const sottotitolo = nomeCompleto.length > 1 ? nomeCompleto[1].trim() : null;
            
            // Estrai il numero del volume
            const volumeNum = cells[5].textContent.trim();
            
            // Estrai l'editore
            const editore = cells[6].textContent.trim();
            
            // Estrai il prezzo (mantieni come stringa per preservare il formato)
            const prezzo = cells[7].textContent.trim();
            
            // Determina se è una nuova adozione (fa-check = nuova, fa-times = in uso)
            const nuovaAdozione = !cells[8].innerHTML.includes('fa-times');
            
            // Determina se il libro è da acquistare (fa-check = sì, fa-times = già in possesso)
            const daAcquistare = cells[9].innerHTML.includes('fa-check');
            
            // 'A' nella colonna 'Cons.' indica "Approfondimento", distinto dai libri 
            // di testo normali per indicazione dell'AIE
            const approfondimento = cells[10].textContent.trim() === 'A';
            
            // Determina la disponibilità del libro
            // F = Fuori catalogo, D = Titolo a disponibilità limitata, vuoto = Disponibile
            const disCode = cells[11].textContent.trim();
            const disponibilita = disCode === 'F' ? 'Fuori catalogo' : 
                                  disCode === 'D' ? 'Titolo a disponibilità limitata' : 
                                  'Disponibile';
            
            libri.push({
                materia,
                img,
                isbn,
                autore,
                titolo,
                sottotitolo,
                volumeNum,
                editore,
                prezzo,
                nuovaAdozione,
                daAcquistare,
                approfondimento,
                disponibilita
            });
        }
    }
    
    return libri;
}