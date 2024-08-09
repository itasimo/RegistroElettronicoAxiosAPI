
# Conversione `usersession -> SessionID`
La conversione dal parametro `usersession` (mobile) al cookie `SessionID` (WEB) è possibile grazie alla funzionalità dell'app denominata `Versione WEB`. Per usufruire di questa funzionalità senza chiedere una seconda volta di fare il login Axios fa una serie di richieste con lo scopo di convertire il parametro `usersession` (utilizzato dall'app per identificare l'utente durante la sessione) nel cookie `SessionID` (utilizzato dalla versione WEB per identificare l'utente durante la sessione).
## Parametri (registroelettronico)
La prima richiesta che Axios fa è all' endpoint, i parametri della richiesta sono uguali a quelli di una richiesta normale.
```http
GET https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation?json={"sCodiceFiscale":"{{sCodiceFiscale}}","sSessionGuid":"{{usersession}}","sCommandJSON":{"sApplication":"FAM","sService":"GET_URL_WEB"},"sVendorToken":"{{vendorAlu}}"} HTTP/1.1 200 OK
```
La risposta sarà un JSON contenente `parameters`, `action` e `url`.
```json
{
    "errorcode":0,
    "errormessage":"",
    "response":{
        "action":"SSO",
        "target":"_self",
        "parameters":"xb3Co..",
        "url":"https://registrofamiglie.axioscloud.it/Pages/SD/SD_Login.aspx"
    }
}
```
## SessionID (registroelettronico)
Il parametro `url` ricavato dalla prima richiesta è utilizzato come endpoint della seconda richiesta. Il corpo di questa richiesta deve contenere `parameters` e `action` (SSO) in formato `application/x-www-form-urlencoded`.
```http
POST https://registrofamiglie.axioscloud.it/Pages/SD/SD_Login.aspx HTTP/1.1 302 Found

parameters=xb3Co..&action=SSO
```
La risposta di questa richiesta è un `302` che contiene della html con tenente il parametro `?s=` visto alla fine degli URL per il registro web, però a noi ci interessa solamente il cookie che restituisce la richiesta.  Pur chiamandosi omonimamente `SessionID` questo cookie non è quello finale poiché a noi interessa quello proveniente da `scuoladigitale.axioscloud.it`

## Parametri per scuoladigitale
Prima di fare la richiesta per il cookie finale (`scuoladigitale.axioscloud.it`) bisogna fare una richiesta per prendere i parametri. Bisogna inserire come cookie di questa richiesta il cookie `SessionID` (`registrofamiglie.axioscloud.it`) preso dalla richiesta precedente.
```http
POST https://registrofamiglie.axioscloud.it/Pages/SD/SD_Ajax_Post.aspx?Action=SSO&Others=undefined&App=SD HTTP/1.1 200 OK
```
Il formato della risposta di questa richiesta sarà simile alla risposta della prima richiesta contenendo sempre `parameters`, `action` e `url`. A differenza però della risposta della prima richiesta questa risposta non è criptata.
```json
{
    "action": "SSO",
    "target": "_self",
    "parameters": "xb3..",
    "url": "https://scuoladigitale.axioscloud.it/Pages/SD/SD_Login.aspx"
}
```

## SessionID (scuoladigitale)
Come prima bisogna usare il parametro `url` come endpoint.
```http
POST https://scuoladigitale.axioscloud.it/Pages/SD/SD_Login.aspx HTTP/1.1 200 OK
```
Questa richiesta darà come risposta un file HTML, a noi però interessa solamente il cookie `ASP.NET_SessionId` che è utilizzeremo per fare le altre richieste all'API per il sito WEB.