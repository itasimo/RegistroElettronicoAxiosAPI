import { htmlParser, querySelector, querySelectorAll } from "../utils";

export default function parseTimeline(htmlString, formattedDate) {

    const root = htmlParser(htmlString);
    const eventsParent = querySelector(root, ".mt-actions");
    const events = querySelectorAll(eventsParent, ".mt-action");

    function getEventType(title) {
        // Check if the title starts with:
        // Verifica, Argomento, Compito, Annotazione, Ritardo, Valutazione, Uscita anticipata, Assente, Nota
        if (title.startsWith("Verifica")) return "Verifica";
        if (title.startsWith("Argomento")) return "Argomento";
        if (title.startsWith("Compito")) return "Compito";
        if (title.startsWith("Annotazione")) return "Annotazione";
        if (title.startsWith("Ritardo")) return "Ritardo";
        if (title.startsWith("Valutazione")) return "Voto";
        if (title.startsWith("Uscita anticipata")) return "Uscita anticipata";
        if (title.startsWith("Assente")) return "Assenza";
        if (title.startsWith("Nota")) return "Nota";
    }

    // Verifica Argomento Compito Annotazione Ritardo Valutazione Uscita anticipata Assente Nota
    // 13:10 [ora 6]

    const result = [];

    events.forEach((event) => {

        const title = querySelector(
            event,
            ".mt-action-author",
        ).textContent.trim() || null;

        const description = querySelector(
            event,
            ".mt-action-desc",
        ).textContent.trim() || null;

        const type = getEventType(title);

        let lessonNumber, time, isDataEvent = false;

        if (type === 'Uscita anticipata' ||  type === 'Ritardo') {
            // 13:10 [ora 6]
            const timeMatch = description.match(/(\d{2}:\d{2}) \[ora (\d+)\]/);
            if (timeMatch) {
                isDataEvent = true;
                time = timeMatch[1]; // "13:10"
                lessonNumber = timeMatch[2]; // "6"
            }
        }
            

        result.push({
            data: formattedDate,
            tipo: type,
            subTipo: null,      // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            id: null,           // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            ora: [              // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE), solo per ritardi e uscite anticipate
                lessonNumber || null, // Ora della lezione
                time || null, // Orario
            ],
            titolo: !isDataEvent ? title : null, // Se la descrizione contiene dati strutturati (es. ora e numero lezione), non mette il titolo, altrimenti mette il titolo
            sottoTitolo: null, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            descrizione: !isDataEvent ? description : null, // Se la descrizione contiene dati strutturati (es. ora e numero lezione), li estrae e non li mette nella descrizione, altrimenti mette tutto nella descrizione
        });
    });

    return {
        eventi: result, // Array di eventi di oggi
        dati: { // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            // Statistiche generali
            media: null,
            assenzeTot: null,
            assenzeDaGiust: null,
            ritardiTot: null,
            ritardiDaGiust: null,
            usciteTot: null,
            usciteDaGiust: null,
        },
    };
}