/**
 * 
 * #### Studente
 * 
 * @param {String} rawData - JSON preso dalla chiamata all'API di Axios
 * @returns {JSON} JSON contente tutti le informazioni dello studente
 * 
 */

module.exports = function parseStudente(rawData) {
    return {
        idAlunno: rawData.idAlunno,
        id: rawData.userId,
        cognome: rawData.cognome,
        nome: rawData.nome,
        sesso: rawData.sesso,
        dataNascita: rawData.dataNascita,
        avatar: rawData.avatar,
        idPlesso: rawData.idPlesso,
        security: rawData.security,
        flagGiustifica: rawData.flagGiustifica === 'S' ? true : false,
        flagInvalsi: rawData.flagInvalsi === 'S' ? true : false,
        flagDocumenti: rawData.flagDocumenti === 'S' ? true : false,
        flagPagoScuola: rawData.flagPagoScuola === 'S' ? true : false,
        flagConsiglioOrientamento: rawData.flagConsiglioOrientamento === 'S' ? true : false
    }

}