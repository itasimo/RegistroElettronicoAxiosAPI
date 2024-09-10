/**
 * 
 * #### Argomenti
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti gli argomenti ragguppati per giorno
 * 
 */

export default function parseArgomenti(rawData) {

    let result = []

    let lastData = rawData[0].data.split(' ')[0];
    let group = [];



    for (let i = 0; i < rawData.length; i++) {

        // Prendo solo la data senza l'orario e lo metto in una variabile in modo da non dover ripetere la stessa operazione più volte
        let currData = rawData[i].data.split(' ')[0];

        let struct = {
            id: rawData[i].idArgomento,
            materia: rawData[i].descMat,
            argomento: rawData[i].descArgomenti,
            ore: rawData[i].oreLezione.split('-'),
            giorno: currData,
            pubblicato: [
                rawData[i].data_pubblicazione.split(' ')[0],
                rawData[i].data_pubblicazione.split(' ')[1]
            ],
        }


        // Siccome axios ritorna i dati di merda (uno dopo l'altro senza raggruppamento) devo fare un controllo per vedere se la data è cambiata in modo da raggruppare gli argomenti per giorno
    
        if(currData == lastData){

            group.push(struct) // Aggiungo l'argomento al gruppo

        } else {

            lastData = currData // Aggiorno la data
            result.push(group); // Aggiungo il gruppo che contiene tutti gli argomenti di quel giorno al risultato
            group = []; // Svuoto il gruppo
            group.push(struct) // Aggiungo il primo argomento del nuovo giorno

        }

    }

    return result;
}