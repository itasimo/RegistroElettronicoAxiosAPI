import { decodeHtmlEntities } from "../utils";

export default function parseVoti(jsonData) {
    // Initialize result array to collect all voti from all quadrimestres
    const result = [];
    
    // Iterate through each quadrimestre (e.g., PRIMO QUADRIMESTRE, SCRUTINIO FINALE)
    // Each quadrimestre contains a DataTables response with grade data
    for (const [quadrimestre, dataTable] of Object.entries(jsonData)) {
        // Iterate through each grade record in this quadrimestre's data array
        for (const item of dataTable.data) {
            // Transform the raw WEB format into normalized voto structure
            result.push({
                // Grade identifier - unique across all grades for a student
                id: item.id,
                
                // Subject name (e.g., "ITALIANO", "MATEMATICA")
                // Decode HTML entities that may be present (e.g., &#39; => ')
                materia: decodeHtmlEntities(item.materia),
                
                // Grade type (e.g., "Scritto", "Orale", "Pratico")
                tipo: item.tipo,
                
                // Grade value - remove HTML markup (e.g., "<span class='label'>8</span>" => "8")
                // The WEB API wraps grades in HTML for styling; we extract just the numeric/text value
                // Se voto è vuoto, matchAll non trova nulla e pop() restituisce undefined, quindi usiamo ?. per sicurezza
                voto: [...item.voto.matchAll(/>([^<\s]+)</g)].pop()?.[1] ?? null,
                
                // Grade weight/significance - not available in WEB API (only in mobile API)
                // Marked as null to maintain compatibility with mobile parser output
                peso: null,
                
                // Date the grade was given (e.g., "23/01/2026")
                // Maps from WEB API field 'giorno' (day) to normalized 'data' (date)
                data: item.giorno,
                
                // Teacher's comments about the grade
                commento: decodeHtmlEntities(item.commento),
                
                // Metadata about who viewed/recorded the grade
                info: {
                    // Teacher who recorded the grade
                    professore: decodeHtmlEntities(item.docente),
                    
                    // Person who viewed/confirmed the grade
                    // Extracted from HTML-formatted string before first <br>
                    // Example: "<small>Abatino Tiziana<br>23/01/2026 23:31:35</small>" => "Abatino Tiziana"
                    vistoDa: decodeHtmlEntities(item.comandi
                        .split('<br>')[0]           // Get first part before line break
                        .replace('<small>', '')     // Remove opening HTML tag
                        .trim())                    // Remove whitespace
                        || null,                     // Default to null if not present
                    
                    // Timestamp when the grade was viewed/confirmed
                    // Extracted from HTML-formatted string after first <br>
                    // Example: "<small>Abatino Tiziana<br>23/01/2026 23:31:35</small>" => "23/01/2026 23:31:35"
                    vistoIl: item.comandi
                        .split('<br>')[1]          // Get second part after line break
                        ?.replace('</small>', '')    // Remove closing HTML tag
                        .trim()                     // Remove whitespace
                        ?? null,                     // Default to null if not present
                }
            });
        }
    }

    // Return flat array of all parsed voti from all quadrimestres
    // This format is compatible with the mobile API parser output (createVoto factory function)
    return result;
}