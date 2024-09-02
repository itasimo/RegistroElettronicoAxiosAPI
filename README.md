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

Se si preferisce usare l'API della versione web del registro rispetto alla versione dell'APP si può convertire il parametro `usersession` nel cookie `SessionId` che andrà alla fine dell'endpoint della richiesta ([Guarda il documento rispettivo](./RegistroElettronicoAxiosAPI/docs/toSessionID.md)).

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
Dopo questa piccola intro su come funziona l'API nativa che spero non dovrete mai toccare è il momento di parlare sul come fare le richieste usando questa riscrittura. Siccome l'API ha 2 versioni: Node per applicazioni locali e ES6 per applicazioni web; il modo in cui si fanno le richieste cambia anche se di poco.

#### Node
In `index.js`
```js
const api = require('./RegistroElettronicoAxiosAPI/node/axiosAPI');
```

#### ES6
In `index.mjs`
```js
import * as api from './RegistroElettronicoAxiosAPI/ES6/axiosAPI.mjs';
```

La prima richiesta da fare è quella del login che avrà come valore di ritorno il parametro `usersession` necessario per le richieste a venire.

```js
(async() => {

    // Login
    const usersession = await api.RE_AxiosAPI_Login('CodiceFiscale', 'username', 'Password');

})()
```
Per fare qualsiasi tipo di richiesta `GET` all'API è usata sempre la stessa funzione di base che viene modificata in caso di dati addizionali.

```js
(async() => {

    // Login
    const usersession = await api.RE_AxiosAPI_Login('CodiceFiscale', 'username', 'Password');

    // Get
    const data = await api.RE_AxiosAPI_Get(usersession, 'Azione');

})()
```

Nel caso della richiesta `Timeline` c'è una modifica alla funzione poiché la richiesta chiede anche di specificare una data che sarà la data in cui si sono svolti gli eventi.

```js
(async() => {

    // Login
    const usersession = await api.RE_AxiosAPI_Login('CodiceFiscale', 'username', 'Password');

    // Get Timeline
    const data = await api.RE_AxiosAPI_Get_Timeline(usersession, 'gg/mm/aaaa');

})()
```

### Azioni Supportate

* [X] Argomenti
* [X] Assenze
* [X] Compiti
* [X] Comunicazioni (Corrente)
* [ ] Comunicazioni (Tutte)
* [X] Curriculum
* [ ] Materiale
* [X] Note
* [X] Orario
* [X] Pagella
* [X] Permessi
* [ ] Sportelli
* [X] Timeline
* [X] Verifiche
* [X] Voti
* [ ] WEB


## Risposte
Le risposte dell'API di axios sono abbastanza confusionarie dal punto di vista di: nomi (che appaiono non coerenti tra di loro), ripetizioni (dati ripetuti più volte) e dati che appaiono solo in casi specifici.
Abbiamo quindi riformattato la struttura delle risposte.
### Argomenti
```json
[
    [
        {
            "materia": "ITALIANO",
            "argomento": "Analisi del periodo",
            "ore": [
                "1",
                "2"
            ],
            "giorno": "11/09/2023",
            "pubblicato": [
                "11/09/2023",
                "17:55:23"
            ]
        },
        ...
    ],
    ...
]
```
La struttura è divisa in 2 array il primo più interno contiene tutti gli argomenti svolti lo stesso giorno, mentre l'array più esterno contiene la raccolta di tutti i gruppi


### Assenze

```json
[
    {
        "quadrimestre": "PRIMO QUADRIMESTRE",
        "assenze": [
            {
                "id": "18384670",
                "data": "19/01/2024",
                "tipo": "Uscita anticipata",
                "ora": "5",
                "orario": "12:20",
                "motivo": "",
                "calcolata": false,
                "giustificabile": false,
                "giustificata": true,
                "giustificataDa": "Docente",
                "giustficataData": "19/01/2024"
            },
            ...
        ]
    },
    {
        "quadrimestre": "SCRUTINIO FINALE",
        "assenze": [
            {
                "data": "06/06/2024",
                "tipo": "Uscita anticipata",
                "ora": "5",
                "orario": "12:20",
                "motivo": "",
                "calcolata": false,
                "giustificabile": true,
                "giustificata": true,
                "giustificataDa": "Docente",
                "giustficataData": "06/06/2024"
            },
            ...
        ]
    }
]
```
Le assenze possono essere di vari tipi:
* Tutte
* Assenza
* Uscita anticipata
* Ritardo
* Rientri

### Compiti

```json
[
    {
        "id": "35272312",
        "materia": "FISICA",
        "compito": "Studiare da pag. 269 a 274",
        "perGiorno": "01/02/2024",
        "pubblicato": [
            "25/01/2024",
            "12:38:03"
        ]
    },
    ...
]
```

### Comunicazioni

Restituisce solo la comunicazioni del quadrimestre corrente (come nell'APP), versioni future di questa API permetteranno l'opzione di richiedere circolari passate attraverso l'implementazione dell'API WEB di Axios

```json
[
    {
        "id": "",
        "data": "31/01/2024",
        "titolo": "Circolare n. 240 Assemblea di Istituto",
        "testo": "Si allega la circolare n. 240",
        "id": "275924",
        "idAlunno":"{{IdAlunno}}",
        "tipo": "Scuola/famiglia",
        "letta": true,
        "allegati": [
            {
                "nome": "Circ.n.240-AssembleadeirappresentantideglistudentinelConsigliodiIstituto.pdf",
                "desc": "",
                "downloadLink": "https://vsa-0000000e-it-momit-01.zadarazios.com:443/v1/AUTH_228b1e25c8cc4b6d955eb1a4a488f15d/axios/YOUR_CODICE_FISCALE_HERE/SD/BACHECHE/1/SD%7c3%7c987%7c6735274d-291f-40a9-bc82-de0cd9d181c1.pdf?temp_url_sig=d6d9f1bdfb5f02a8f547479d9e57c2d34350ff42&temp_url_expires=1718472601&filename=Circ.n.240-AssembleadeirappresentantideglistudentinelConsigliodiIstituto.pdf"
            },
            ...
        ],
        "prevedeRisposta": false,
        "opzioniRisposta": [
            ""
        ]
    },
    ...
]
```
Il link per il download del/degli allegati è one-time. Le comunicazioni posso essere di tipo:
* Circolare
* Scuola/Famiglia
* Comunicazione
> **Disclaimer**: La richiesta per la risposta a una circolare è supportata dall'API nativa di Axios ma non da questa riscrittura.

In caso la circolare preveda una risposta l'array `opzioniRisposta` si popolerà con le opzioni. Per inviare la risposta bisogna fare una richiesta POST all'endpoint:

```http
POST https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/ExecuteCommand
```
Il body della richiesta sarà:
```json
{
  "JsonRequest": "..."
}
```
All'interno del parametro `JsonRequest` ci dovrà essere un json criptato contenente la seguenti informazioni:
```json
{
    "sCodiceFiscale":"{{CodiceFiscale}}",
    "sSessionGuid":"{{usersession}}",
    "sCommandJSON":{
        "sApplication":"FAM",
        "sService":"APP_PROCESS_QUEUE",
        "sModule":"COMUNICAZIONI_RISPOSTA",
        "data":{
            "comunicazioneId":"{{IdComunicazione}}",
            "alunnoId":"{{IdAlunno}}",
            "scelta":"{{Scelta}}"
            }
    },
    "sVendorToken":"{{vendorAlu}}"
}
```
Il parametro `scelta` sarà la posizione nell'array dell'opzione che si vuole selezionare.

Per segnare una circolare letta `JsonRequest` sarà:
```json
{
    "sCodiceFiscale":"{{CodiceFiscale}}",
    "sSessionGuid":"{{usersession}}",
    "sCommandJSON":{
        "sApplication":"FAM",
        "sService":"APP_PROCESS_QUEUE",
        "sModule":"COMUNICAZIONI_READ",
        "data":{
            "comunicazioneId":"{{IdComunicazione}}",
            "alunnoId":"5392160"
        }
    },
    "sVendorToken":"{{vendorAlu}}"
}
```

### Curriculum
```json
[
    {
        "codiceMeccanografico": "CRAA123456Z",
        "scuola": "CRAA123456Z - NOME SCUOLA",
        "indirizzo": "LICEO SCIENTIFICO - OPZIONE SCIENZE APPLICATE",
        "annoScolastico": [
            "2023",
            "2024"
        ],
        "classe": "5",
        "sezione": "BLSA",
        "esito": "AMMESSO AGLI ESAMI DI STATO",
        "crediti": 12
    },
    ...
]
```
### Note Disciplinari
```json
[
    {
        "quadrimestre": "PRIMO QUADRIMESTRE",
        "note": [
            {
                "data": "20/09/2023",
                "tipo": "Classe",
                "tipoNota": "Annotazione",
                "docente": "Mario Rossi",
                "nota": "La classe viene ripresa più volte",
                "letta": true,
                "lettaDa": "Francesco Bianchi",
                "lettaIl": [
                    "13/10/2023",
                    "14:25:55"
                ]
            },
            ...
        ]
    },
    {
        "quadrimestre": "SCRUTINIO FINALE",
        "note": [
            ...
        ]
    }
]
```
Le note possono essere di due tipi: `"Classe"` o `"Studente"`
### Orario
```json
[
    {
        "giorno": "Lunedì",
        "orario": [
            {
                "ora": "1",
                "durata": [
                    "08:10",
                    "09:10"
                ],
                "materia": "INGLESE",
                "docente": "Mario Rossi"
            },
            ...
        ]
    },
    {
        "giorno": "Martedì",
        "orario": [
            ...
        ]
    },
    ...
]
```
### Pagella
``` json
[
    {
        "quadrimestre": "PRIMO QUADRIMESTRE",
        "media": 7.09,
        "esito": "",
        "giudizio": "",
        "materie": [
            {
                "materia": "MATEMATICA",
                "voto": 5,
                "debito": {
                    "motivo": "L'alunno conosce in modo frammentario e disorganico i contenuti disciplinari svolti, ha avuto un atteggiamento poco motivato, l'impegno è stato discontinuo, scarsa la partecipazione all'attività didattica.",
                    "argomenti": "Piano cartesiano e retta, radicali.",
                    "modRecupero": "Sportello didattico obbligatorio",
                    "tipoVerifica": "Verifica scritta",
                    "dataVerifica": "28/02/2024",
                    "argVerifica": "Sistemi lineari, piano cartesiano e retta, radicali.",
                    "giudizioVerifica": "La prova è sufficiente in tutti e tre i moduli. Lo studente dimostra di saper operare con le rette, risolve correttamente i sistemi lineari, esegue in modo corretto le operazioni con i radicali numerici e algebrici."
                },
                "giudizio": "L'alunno conosce in modo frammentario e disorganico i contenuti disciplinari svolti, ha avuto un atteggiamento poco motivato, l'impegno è stato discontinuo, scarsa la partecipazione all'attività didattica.",
                "assenze": 6
            },
            ...
        ]
    },
    {
        "quadrimestre": "SCRUTINIO FINALE",
        "media": 7.63,
        "esito": "AMMESSO ALLA CLASSE SUCCESSIVA",
        "giudizio": "L'alunno è stato AMMESSO ALLA CLASSE SUCCESSIVA",
        "materie": [
            {
                "materia": "FISICA",
                "voto": 7,
                "debito": {},
                "giudizio": "",
                "assenze": 2
            },
            ...
        ]
    }
]
```
### Permessi
```json
{
    "richiesteDaAutorizzare": [
        ...
    ],
    "richiesteNonAutorizzate": [
        ...
    ],
    "permessiDaAutorizzare": [
        ...
    ],
    "permessiAutorizzati": [
        {
            "data": [
                "06/06/2024",
                "06/06/2024"
            ],
            "tipo": "Uscita Anticipata",
            "ora": "5",
            "orario": "12:20:00",
            "motivo": "assenza docente",
            "note": "",
            "diClasse": true,
            "calcolata": false,
            "giustificata": true,
            "info": {
                "inseritoDa": "FABIO BIANCHI",
                "rispostoDa": "",
                "rispostoIl": [
                    ""
                ]
            }
        },
        ...
    ]
}
```
La struttura è uguale per tutti e quattro gli array. Il tipo può essere:
* Assenza
* Uscita Anticipata
* Entrata Posticipata
* Uscita Didattica
* DaD (Didattica a distanza)

### Verifiche
```json
[
    {
        "materia": "MATEMATICA",
        "verifica": "Sistemi di disequazioni",
        "perGiorno": "21/05/2024",
        "pubblicato": [
            "24/04/2024",
            "12:55:50"
        ]
    },
    ...
]
```
### Voti
```json
[
    {
        "id": "61006056",
        "materia": "SCIENZE MOTORIE",
        "tipoVoto": "Pratico",
        "voto": "7",
        "peso": "100",
        "data": "21/05/2024",
        "commento": "test resistenza: giro unico marcia",
        "professore": "Francesca Verdi"
    },
    ...
]
```
I voti hanno diversi tipi:
* Tutti
* Scritto
* Grafico
* Orale
* Pratico
* Unico

### Timeline

```json
{
    "oggi": [
        {
            "data": "20/05/2024",
            "tipo": "Argomento",
            "subTipo": "",
            "ora": [
                "1",
                ""
            ],
            "titolo": "",
            "sottoTitolo": "ITALIANO",
            "descrizione": "Promessi sposi cap. 19"
        },
        {
            "data": "20/05/2024",
            "tipo": "Assenza",
            "subTipo": "Uscita anticipata",
            "ora": [
                "5",                        // Ora lezione
                "12:20:00"                  // Ora tempo
            ],
            "titolo": "",
            "sottoTitolo": "",
            "descrizione": ""
        },
        ...
    ],
    "dati": {
        "media": "7,62",
        "assenzeTot": "1",
        "assenzeDaGiust": "0",
        "ritardiTot": "3",
        "ritardiDaGiust": "1",
        "usciteTot": "22",
        "usciteDaGiust": "0"
    }
}
```
Il parametro `tipo` specifica il tipo di evento mentre il parametro `subTipo` è usato solo nei casi in cui l'evento sia `"Assenza"`, `"Voto"` o `"Nota"`, esso serve a specificare rispettivamente il tipo si assenza (guarda i tipi di assenza nella sezione della risposta per le assenze), tipo di voto (guarda i tipi di voto nella sezione della risposta per i voti) e il tipo di nota (guarda i tipi di nota nella sezione della risposta per le note).


## Conclusione
Speriamo di aver fatto risparmiare dei neuroni a chi si voglia usare l'API di axios. Vi ripeto che in caso di domande di non esitate a [contattarmi](mailto:ita.simo013+axiosAPI@gmail.com).
Con ❤ da Marco e Simo

[^1]: GET https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation
