
# Conversione `usersession -> SessionID`
La conversione dal parametro `usersession` (mobile) al cookie `SessionID` (WEB) è possibile grazie alla funzionalità dell'app denominata `Versione WEB`. Per usufruire di questa funzionalità senza chiedere una seconda volta di fare il login Axios fa una serie di richieste con lo scopo di convertire il parametro `usersession` (utilizzato dall'app per identificare l'utente durante la sessione) nel cookie `SessionID` (utilizzato dalla versione WEB per identificare l'utente durante la sessione).
## Parametri (registroelettronico)
La prima richiesta che axios fa è all' endpoint, i parametri della richiesta sono uguali a quelli di una richiesta normale e la risposta sarà un JSON contenente `parameters`, `action` e `url`.
```json
```
## SessionID (registroelettronico)
Il parametro `url` ricavato dalla prima richiesta è utilizzato come endpoint della seconda richiesta. i parametri per questa richiesta sono `parameters` e `action` (SSO).
```https
```
La risposta di questa richiesta è un `302` che contiene della html con tenente il parametro `?s=` visto alla fine degli URL per il registro web, però a noi non ci interessa e ci interessa solamente il cookie che restituisce la richiesta.  Pur chiamandosi omonimamente `SessionID` questo cookie non è quello finale poiché a noi interessa quello proveniente da `scuoladigitale.axioscloud.it`

## Parametri per scuoladigitale
Prima di fare la richiesta per il cookie finale (`scuoladigitale.axioscloud.it`) bisogna fare una richiesta per prendere i parametri. 
```https
```
Il formato della risposta di questa richiesta sarà simile alla risposta della prima richiesta contenente sempre `parameters`, `action` e `url`. A differenza però della risposta della prima richiesta questa risposta non è criptata.

## SessionID (scuoladigitale)
Come prima bisogna usare il parametro `url` come endpoint questa richiesta darà come risposta un file HTML, a noi però interessa solamente il cookie che è utilizzeremo per fare le altre richieste all'API per il sito WEB.