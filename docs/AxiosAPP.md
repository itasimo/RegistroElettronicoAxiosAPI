# Axios API

Abbiamo usato l'API dell'app decopilata.

TODO: rischieste enrcypt
TODO: timestamp

## Login

Per effettuare il login bisogna fare una richiesta GET a questo endpoint.

```http
GET https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/Login2
```

Come parametri vanno inseriti i seguenti:

```json
{
    "sCodiceFiscale":"{{CodiceFiscale}}",
    "sUserName":"{{UserName}}",
    "sPassword":"{{Password}}",
    "sAppName":"ALU_APP",
    "sVendorToken":"{{vendorAlu}}"
}
```

##### Ma perché fare il login in primo luogo?

Oltre a contenere informazioni rilevanti al customer (la scuola) e l'alunno (tra cui il JSON del QR Code) la risposta contiene un parametro chiamato `usersession` che è necessario per tutte le altre richieste, poichè serve ad axios per detereminare lo studente e la classe.

## Richieste POST Login

Per tutte le richieste fatte dopo aver eseguito il login (poichè è necessario fare il login per otterne il parametro `usersession`) l'endpoint[^1] cambia e diventa:

```http
GET https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation
```

D'ora in poi l'API userà sempre questo endpoint.

### Dall'app al sito: `usersession`

Se si preferisce usare l'API della versione web del registro rispetto alla versione dell'APP si può convertire il parametro `usersession` nel parametro `s` che andrà alla fine dell'endpoint della richiesta (Guarda il documento rispettivo).

Uno dei parametri utlizzati nella richiesta è `alunnoId`, questo parametro non viene restituito dal login, ma da qualsiasi altra richiesta, se è necessario fare solo la conversione è consigliabile eseguire una richiesta con i seguenti parametri, se invece si devono fare già altre richieste prima è consigliabile prendere il parametro dal lì.
I parametri necessari per la richiesta delle informazioni dello studente (da cui prenderemo il parametro `idAlunno`) sono:

(endpoint[^1])

```json
{
    "sCodiceFiscale":"{{CodiceFiscale}}",
    "sSessionGuid":"{{usersession}}",
    "sCommandJSON":{
        "sApplication":"FAM",
        "sService":"GET_STUDENTI",
        "data":{
            "appName":"ALU_APP"
        }
    },
    "sVendorToken":"{{vendorAlu}}"
}
```

Dalla risposta prendiamo il parametro `idAlunno` che poi mettermo nella richiesta per la conversione sotto la voce `alunnoId`.

Dunque la richiesta per convertire da `usersession` al parametro `s` deve essere fatta all'endpoint[^1] con i parametri seguenti:

```json
{
    "sCodiceFiscale":"{{CodiceFiscale}}",
    "sSessionGuid":"{{usersession}}",
    "sCommandJSON":{
        "sApplication":"FAM",
        "sService":"GET_URL_WEB",
        "data":{
            "alunnoId":"{{idAlunno}}"
        }
    },
    "sVendorToken":"{{vendorAlu}}"
}
```

Sono poi da estrarre dalla risposta i parametri `action`, `parameters` e `url`.

## Compiti

### ParseCompiti

[^1]: GET https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation
