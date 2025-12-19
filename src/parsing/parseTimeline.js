import { convertLookup } from "@/utils";

/**
 * Parsea i dati della timeline in una struttura più comoda
 * @param {Object} rawData - Dati grezzi della timeline presi dall'API di Axios
 * @returns {Object} Oggetto contenente tutte le informazioni riguardanti gli eventi successi nella data specificata
 */
export default function parseTimeline(rawData) {

    // Mapping per i tipi principali di eventi
    const tipoLett = ['C', 'L', 'M', 'N', 'A', 'V'];
    const tipoStr = ['Comunicazione', 'Argomento', 'Compito', 'Nota', 'Assenza', 'Voto'];

    // Mapping per i sotto-tipi di assenze
    const sottoTipoAssenzaLett = ['T', 'A', 'U', 'R', 'E'];
    const sottoTipoAssenzaStr = ['Tutte', 'Assenza', 'Uscita anticipata', 'Ritardo', 'Rientri'];

    // Mapping per i sotto-tipi di voti
    const sottoTipoVotoLett = ['T', 'S', 'G', 'O', 'P', 'A'];
    const sottoTipoVotoStr = ['Tutti', 'Scritto', 'Grafico', 'Orale', 'Pratico', 'Unico'];

    // Mapping per i sotto-tipi di note
    const sottoTipoNotaLett = ['C', 'S'];
    const sottoTipoNotaStr = ['Classe', 'Studente'];

    const result = [];

    // Itera su tutti gli eventi di oggi
    for (const item of rawData.today) {

        let sottoTipo = '';
        let descrizione = item.desc.notes;

        // Determina il sotto-tipo in base al tipo di evento
        switch (item.type) {
            case 'A': // Assenza
                sottoTipo = convertLookup(item.subType, sottoTipoAssenzaLett, sottoTipoAssenzaStr);
                break;
        
            case 'V': // Voto
                sottoTipo = convertLookup(item.subType, sottoTipoVotoLett, sottoTipoVotoStr);
                break;

            case 'N': // Nota
                sottoTipo = convertLookup(item.subType, sottoTipoNotaLett, sottoTipoNotaStr);
                break;
                            
            case 'M': // Compito (può essere una verifica)
                const VerificaRegex = /\<b\>Verifica\<\/b\>/;
                const isVerifica = VerificaRegex.test(item.desc.notes);

                // Se è una verifica, imposta il sotto-tipo e rimuove il tag HTML
                sottoTipo = isVerifica ? 'Verifica' : '';
                descrizione = isVerifica ? item.desc.notes.replace(VerificaRegex, '').trim() : item.desc.notes;
                break;
        }

        // Costruisce l'oggetto evento con tutti i dati
        const currEvento = {
            data: item.data,
            tipo: convertLookup(item.type, tipoLett, tipoStr),
            subTipo: sottoTipo,
            id: item.id,
            ora: [
                item.oralez, // Ora della lezione
                item.ora // Orario
            ],
            titolo: item.type == 'N' ? new RegExp("<b>(.*?)<\/b>", "gm").exec(item.desc.subtitle)[1] : item.desc.title, // In caso di nota estrae il tipo di nota, prende il testo tra <b> e </b> cioè il gruppo matchato dal regex
            sottoTitolo: item.type == 'N' ? item.desc.subtitle.split('</span>&nbsp;')[1].trim() : item.desc.subtitle, // In caso di nota estrae la nota, prende il testo dopo </span>&nbsp; e toglie gli spazi iniziali e finali
            descrizione: descrizione,
        };

        result.push(currEvento);
    }

    return {
        oggi: result, // Array di eventi di oggi
        dati: { // Statistiche generali
            media: rawData.media_a, // Media voti
            assenzeTot: rawData.totali.assenze_totali,
            assenzeDaGiust: rawData.totali.assenze_da_giust,
            ritardiTot: rawData.totali.ritardi_totali,
            ritardiDaGiust: rawData.totali.ritardi_da_giust,
            usciteTot: rawData.totali.uscite_totali,
            usciteDaGiust: rawData.totali.uscite_da_giust
        }
    };
}