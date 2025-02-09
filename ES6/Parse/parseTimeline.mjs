/**
 * 
 * #### Timeline
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutte le informazioni riguardanti il gli eventi successi nella data specificata
 * 
 */

export default function parseTimeline(rawData) {

    const tipoLett = ['C', 'L', 'M', 'N', 'A', 'V'] 
    const tipoStr = ['Comunicazione', 'Argomento', 'Compito', 'Nota', 'Assenza', 'Voto'];

    const sottoTipoAssenzaLett = ['T', 'A', 'U', 'R', 'E']
    const sottoTipoAssenzaStr = ['Tutte', 'Assenza', 'Uscita anticipata', 'Ritardo', 'Rientri']

    const sottoTipoVotoLett = ['T', 'S', 'G', 'O', 'P', 'A']                              
    const sottoTipoVotoStr = ['Tutti', 'Scritto', 'Grafico', 'Orale', 'Pratico', 'Unico']

    const sottoTipoNotaLett = ['C', 'S']
    const sottoTipoNotaStr = ['Classe', 'Studente']

    let result = []

    let defPath = rawData.today

    for (let i = 0; i < defPath.length; i++) {

        let sottoTipo = ''

        switch (defPath[i].type) {
            case 'A':
                sottoTipo = sottoTipoAssenzaStr[ sottoTipoAssenzaLett.indexOf( defPath[i].subType ) ]
                break;
        
            case 'V':
                sottoTipo = sottoTipoVotoStr[ sottoTipoVotoLett.indexOf( defPath[i].subType ) ]
                break;

            case 'N':
                sottoTipo = sottoTipoNotaStr[ sottoTipoNotaLett.indexOf( defPath[i].subType ) ]
                break;
                
            case 'M':
                const VerificaRegex = /\<b\>Verifica\<\/b\>/gm
                const isVerifica = VerificaRegex.test(defPath[i].desc.notes)

                sottoTipo = isVerifica ? 'Verifica' : ''
                defPath[i].desc.notes = isVerifica ? defPath[i].desc.notes.replace(VerificaRegex, '').trim() : defPath[i].desc.notes
        }

        const currEvento = {
            data: defPath[i].data,
            tipo: tipoStr[ tipoLett.indexOf( defPath[i].type ) ],
            subTipo: sottoTipo,
            id: defPath[i].id,
            ora: [
                defPath[i].oralez,
                defPath[i].ora
            ],
            titolo: defPath[i].type == 'N' ? new RegExp("<b>(.*?)<\/b>", "gm").exec(defPath[i].desc.subtitle)[1] : defPath[i].desc.title,   // In caso di nota estrae il tipo di nota, prende il testo tra <b> e </b> cioè il gruppo matchato dal regex
            sottoTitolo: defPath[i].type == 'N' ? defPath[i].desc.subtitle.split('</span>&nbsp;')[1].trim() : defPath[i].desc.subtitle,     // In caso di nota estrae la nota, prende il testo dopo </span>&nbsp; e toglie gli spazi iniziali e finali
            descrizione: defPath[i].desc.notes,
        }

        result.push(currEvento)
    }

    return {
        oggi: result,
        dati: {
            media: rawData.media_a,
            assenzeTot: rawData.totali.assenze_totali,
            assenzeDaGiust: rawData.totali.assenze_da_giust,
            ritardiTot: rawData.totali.ritardi_totali,
            ritardiDaGiust: rawData.totali.ritardi_da_giust,
            usciteTot: rawData.totali.uscite_totali,
            usciteDaGiust: rawData.totali.uscite_da_giust
        }
    };
}