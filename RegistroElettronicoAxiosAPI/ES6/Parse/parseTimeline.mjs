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
    const tipoStr = ['Comunicazione', 'Argomento', 'Compito', 'Nota Disciplinare', 'Assenza', 'Voto'];

    const sottoTipoAssenzaLett = ['T', 'A', 'U', 'R', 'E']
    const sottoTipoAssenzaStr = ['Tutte', 'Assenza', 'Uscita anticipata', 'Ritardo', 'Rientri']

    const sottoTipoVotoLett = ['T', 'S', 'G', 'O', 'P', 'A']                              
    const sottoTipoVotoStr = ['Tutti', 'Scritto', 'Grafico', 'Orale', 'Pratico', 'Unico']

    let result = []

    let defPath = rawData.today

    for (let i = 0; i < defPath.length; i++) {

        let sottoTipo = ''
        if (defPath[i].type == 'A') {
            sottoTipo = sottoTipoAssenzaStr[ sottoTipoAssenzaLett.indexOf( defPath[i].subType ) ]
        } else if (defPath[i].type == 'V') {
            sottoTipo = sottoTipoVotoStr[ sottoTipoVotoLett.indexOf( defPath[i].subType ) ]
        }

        const currEvento = {
            data: defPath[i].data,
            tipo: tipoStr[ tipoLett.indexOf( defPath[i].type ) ],
            subTipo: sottoTipo,
            ora: defPath[i].ora,
            oraLezione: defPath[i].oralez,
            titolo: defPath[i].desc.title,
            sottoTitolo: defPath[i].desc.subtitle,
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