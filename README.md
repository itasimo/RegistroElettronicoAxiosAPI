# Axios API

Parto dicendo che questa è un wrapper dell'API nativa di Axios con lo scopo di facilitare la richiesta di informazioni.
Per portare a termine questo progetto abbiamo dovuto decompilare le applicazioni Axios, [intercettare le richieste](https://github.com/httptoolkit) e perdere tanti neuroni nel processo. Quindi spero di riassumere tutto in questo documento, in caso di domande non esitate a [contattarmi](mailto:ita.simo013+axiosAPI@gmail.com)

## Python

È disponiblie un [implementazione in Python dell'API](https://github.com/Invy55/AxiosStAPI) fatta dal mio teammate [Invy55](https://github.com/Invy55)


## Crittografia Axios

La crittografia di Axios è poco sicura, essa consiste infatti da una cifratura RC4 una criptazione a Base64 e una cifratura URL.
Quindi per l'encoding il grafico sarà in questo modo
```
RC4 -> Base64 -> URL encoding
````
L'unico caso in cui l'encoding cambia è nel login dove per offuscare le credenziali nel modo più sicuro possibile hanno deciso di ripetere la cifratura url la bellezza di 2 volte complicando il grafico di molto:
```
RC4 -> Base64 -> URL encoding -> URL encoding
````
Se non si fosse capito sono ironico essendo che questo metodo è molto inefficiente basandosi sulla cifratura RC4 che è un algoritmo noto per le sue vulnerabilità.
Il codice per l'encoding è il seguente:
```js
function AxiosEncode(json, num = 1) {

    let encoded = rc4(rc4key, JSON.stringify(json));

    encoded = btoa(encoded);

    for (let i = 0; i < num; i++) {
        encoded = encodeURIComponent(encoded)
    }

    return encoded;
}

// Funzioni normali
AxiosEncode(requestJSON)

// Funzione di Login
AxiosEncode(requestJSON, 2)
```

Per decodificare bisogna solo riscriverei passaggi all'inverso

```js
function AxiosDecode(value, jsdec = true) {

    value = jsdec ? JSON.parse(value) : value;
    let newresp;

    // URL decode la risposta finché non è più possibile
    while (true) {
        newresp = decodeURIComponent(value);
        if (newresp == value) {
            break;
        } else {
            value = newresp;
        }
    }

    let decoded = rc4(rc4key, atob(value));

    decoded = JSON.parse(decoded);

    return decoded;
}
```
Abbiamo anche messo un loop che decodifica la cifratura URL finché non è più possibile in modo da non doverlo specificare nei parametri.

### Sito
Nel caso servisse abbiamo creato un sito per criptare e decriptare seguendo questi parametri ( [**sito**](https://invy55.win/axios/roba.html) )


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

Oltre a contenere informazioni rilevanti al customer (la scuola) e l'alunno (tra cui il JSON del QR Code) la risposta contiene un parametro chiamato `usersession` che è necessario per tutte le altre richieste, poiché serve ad axios per determinare lo studente e la classe.

## Richieste POST Login

Per tutte le richieste fatte dopo aver eseguito il login (poiché è necessario fare il login per ottenre il parametro `usersession`) l'endpoint[^1] cambia e diventa:

```http
GET https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation
```

D'ora in poi l'API userà sempre questo endpoint.

### Dall'app al sito: `usersession`

Se si preferisce usare l'API della versione web del registro rispetto alla versione dell'APP si può convertire il parametro `usersession` nel cookie `SessionId` che andrà alla fine dell'endpoint della richiesta ([Guarda il documento rispettivo](./docs/WEB Conversion.md)).

Dunque la richiesta per convertire da `usersession` al cookie `SessionId` deve essere fatta all'endpoint[^1] con i parametri seguenti:

```json
{
    "sCodiceFiscale":"{{CodiceFiscale}}",
    "sSessionGuid":"{{usersession}}",
    "sCommandJSON":{
        "sApplication":"FAM",
        "sService":"GET_URL_WEB"
    },
    "sVendorToken":"{{vendorAlu}}"
}

```

Sono poi da estrarre dalla risposta i parametri `action`, `parameters` e `url`.

## Richieste
Dopo questa piccola intro su come funziona l'API nativa che spero non dovrete mai toccare è il momento di parlare sul come fare le richieste usando questa riscrittura.


In `index.js`
```js
import AxiosAPI from './index.js';

const api = new AxiosAPI();
```


La prima richiesta da fare è quella del login che avrà come valore di ritorno il parametro `usersession` necessario per le richieste a venire.

```js
const api = new AxiosAPI();
const loginResult = await api.login('CodiceFiscale', 'username', 'Password');
```

### Richieste generiche
```js
const compiti = await api.get('compiti');
const voti = await api.get('voti');
const orario = await api.get('orario');
```

### Timeline
```js
const timeline = await api.getTimeline('01/02/2024');
```

> L'istanza `api` conserva le informazioni della sessione internamente dopo il login, quindi non è necessario passare `codiceFiscale` e `usersession` a ogni chiamata.

### Azioni Supportate

Mobile (tramite `api.get`):
- [X] Argomenti
- [X] Assenze
- [X] Compiti
- [X] Comunicazioni
- [X] Curriculum
- [X] Note
- [X] Orario
- [X] Pagella
- [X] Permessi
- [X] Studente
- [X] Timeline
- [X] Verifiche
- [X] Voti

Web (tramite `api.web` - richiede `await api.web.toWEBSession()`):
- [X] Comunicazioni (⚠️ tempo di esecuzione ~0.32s per comunicazione)
- [X] Anagrafico
- [X] Curriculum
- [X] Documenti
- [X] Orario
- [X] Assenze
- [X] Argomenti
- [X] Compiti
- [X] Verifiche
- [X] Note
- [X] Voti
- [X] Pagella
- [X] Pagoscuola
- [X] Libri

Non supportate / disabilitate (WEB):
- [ ] Deleghe
- [ ] Permessi (parser incompleto)
- [ ] Colloqui
- [ ] Collabora
- [ ] Sportello Digitale / Sportello Didattico
- [ ] Corsi e Laboratori
- [ ] ComUnica

## Conclusione
Speriamo di aver fatto risparmiare dei neuroni a chi si voglia usare l'API di axios. Vi ripeto che in caso di domande di non esitate a [contattarmi](mailto:ita.simo013+axiosAPI@gmail.com).
Con ❤ da Marco e Simo

[^1]: GET https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation