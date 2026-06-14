## Conversione della sessione Axios Mobile→Web

## Panoramica
Questo documento spiega il processo per convertire una `usersession` generata dall'app mobile **Axios Italia** (`com.axiositalia.re.students`) in una sessione web valida e autenticata per il portale **Registro Elettronico Famiglie**. La conversione è necessaria perché l'app mobile usa uno schema di autenticazione proprietario, mentre il portale web si basa su cookie di sessione ASP.NET standard. Il processo agisce come un ponte di Single Sign-On (SSO), trasformando il token di sessione mobile in un `ASP.NET_SessionId` compatibile con il web.

Problema principale: l'app mobile e il portale web sono sistemi separati. L'app mobile si autentica tramite una REST API (`wsalu.axioscloud.it`) e riceve un GUID di sessione. Per accedere ai contenuti web questa sessione mobile deve essere convertita in una sessione ASP.NET con stato sul dominio `registrofamiglie.axioscloud.it`.

## Componenti chiave

| Componente | Descrizione | Esempio/Formato |
| :--- | :--- | :--- |
| **`sSessionGuid`** | Identificatore di sessione restituito dal login dell'app mobile. | `5b2c5b21-4562-4fe9-8f33-36c3717cb41d` (UUID) |
| **`sVendorToken`** | Token statico specifico dell'app usato per autenticare il client mobile alla REST API. | `5ed95c58-fbc2-4db8-92cb-7e1e73ba2065` |
| **`ASP.NET_SessionId`** | Cookie di sessione ASP.NET standard: obiettivo della conversione. | `fvo0n0rmy2dkiiiuicgp4xd1` (24 caratteri) |
| **`_AXToken` / `RVT`** | Token anti-forgery: stringa Base64 incorporata nell'HTML e inviata come header `RVT` nelle chiamate AJAX per validare il contesto di sessione. | `NEJFNDk3MEQzNTZDOTFCMTM1RTY1NzUyQUI2MkExQjc=` |
| **Parametro `s`** | Parametro di query passato durante il redirect verso la dashboard | `r%2byBg%2bdk1UbyUVL32lecR7xbpDKrsI7NWv7cLvagkqs%3d` |

## Flusso e analisi delle richieste 

La conversione completa richiede una precisa sequenza di richieste HTTP. Saltare o riorganizzare i passaggi può generare una sessione che esiste ma è internamente marcata come non valida.

### Step 1: Ottenere i parametri SSO dalla Mobile API
**Scopo**: Ottenere il blob SSO monouso e l'URL target dal backend mobile.
**Endpoint**: `GET https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation`
**Parametri critici**:
```json
{
  "sCodiceFiscale": "80127350157",
  "sSessionGuid": "5b2c5b21-4562-4fe9-8f33-36c3717cb41d",
  "sCommandJSON": {"sApplication": "FAM", "sService": "GET_URL_WEB"},
  "sVendorToken": "5ed95c58-fbc2-4db8-92cb-7e1e73ba2065"
}
```
**Risposta**: un oggetto JSON che contiene `action` ("SSO"), `target` ("_self"), `url` (pagina di login web) e un lungo campo `parameters` codificato in Base64.

### Step 2: Scambiare il blob SSO per una sessione ASP.NET
**Scopo**: Inviare il blob SSO all'applicazione web per creare un contenitore di sessione.
**Endpoint**: `POST https://registrofamiglie.axioscloud.it/Pages/SD/SD_Login.aspx`
**Body**: `application/x-www-form-urlencoded`
```
parameters=<LONG_BASE64_BLOB>&action=SSO
```
**Header di risposta critici**:
- `Status: 302 Found`
- `Location: /Pages/SD/SD_Dashboard.aspx?s=...` (URL di redirect con parametro `s`)
- **`Set-Cookie: ASP.NET_SessionId=...` (HEADER DUPLICATI)**

**Il mistero dei cookie duplicati**:
Il server invia *due* header `Set-Cookie` per `ASP.NET_SessionId` probabilmente un artefatto di configurazione IIS fatta coi piedi.
```http
Set-Cookie: ASP.NET_SessionId=g2o3dmovvfkef5romcc4sjbr; path=/; secure; HttpOnly; SameSite=Lax
Set-Cookie: ASP.NET_SessionId=fvo0n0rmy2dkiiiuicgp4xd1; path=/; secure; HttpOnly; SameSite=Lax
```
**Solo il secondo cookie è valido per le richieste autenticate.** Il primo sembra essere un contenitore di sessione obsoleto o non valido.

### Step 3: Caricare la Dashboard ed estrarre l'AXToken
**Scopo**: Seguire il redirect per stabilire la sessione nel contesto del browser ed estrarre il token anti-forgery (`_AXToken`).
**Endpoint**: `GET https://registrofamiglie.axioscloud.it/Pages/SD/SD_Dashboard.aspx?s=...`
**Azione chiave**: Il server risponde con l'HTML completo della dashboard. Al suo interno è presente un campo nascosto con `_AXToken`.

**Snippet HTML dalla risposta**:
```html
<input type='hidden' id='_AXToken' value='NEJFNDk3MEQzNTZDOTFCMTM1RTY1NzUyQUI2MkExQjc=' />
```
Questo token **deve essere estratto** e inviato nell'header `RVT` in tutte le chiamate AJAX successive.

### Step 4: Inizializzare lo stato della sessione (passo critico)
**Scopo**: Prima che qualsiasi chiamata alle API di dati abbia successo, la sessione deve essere trasformata da "contenitore nuovo" a "stato autenticato". Questo avviene chiamando l'endpoint **DashboardLoad**.
**Endpoint**: `GET https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=DashboardLoad`
**Header richiesti**:
- `Cookie: ASP.NET_SessionId=<VALID_SESSION_ID>`
- `RVT: <AXToken_VALUE>`
- `X-Requested-With: XMLHttpRequest`

**Insight**: Sebbene l'app esegua varie chiamate iniziali (`sidebartoggler`, `marketread`, `HeaderLoad`, `FooterLoad`), i test hanno dimostrato che **solo `DashboardLoad` è essenziale**. Questa singola richiesta scrive l'identità dell'utente, i permessi e il contesto della scuola nello store di sessione server-side. Saltarla genera una sessione "vuota" che risponde con `400 Bad Request` alle chiamate dati.

### Step 5: Eseguire richieste dati autenticate
**Scopo**: Dopo l'inizializzazione, la sessione può essere utilizzata per recuperare i dati dell'applicazione.
**Esempio Endpoint**: `GET https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=FAMILY_REGISTRO_CLASSE`
**Header richiesti**: gli stessi del Step 4 (cookie di sessione e token RVT).

## Implementazione

### Funzione principale di conversione
```javascript
export default async function toSessionID(codiceFiscale, usersession) {
    // 1. Ottenere i parametri SSO dal backend mobile
    const authParams = await getRegistroFamiglieParameters(codiceFiscale, usersession);
    
    // 2. Scambiare per il cookie di sessione ASP.NET
    const [sessionCookie, redirectUrl] = await convertToRegistroFamiglieCookie(authParams);
    
    // 3. Caricare la dashboard ed estrarre AXToken
    const axToken = await fetchAxToken(sessionCookie, redirectUrl);
    
    // 4. CRITICO: inizializzare lo stato della sessione tramite DashboardLoad
    await fetchDashboardLoad(sessionCookie, redirectUrl, axToken);
    
    // 5. La sessione è ora pronta all'uso
    return sessionCookie;
}
```

### Helper critico: inizializzazione sessione (`fetchDashboardLoad`)
```javascript
async function fetchDashboardLoad(sessionCookie, redirectUrl, axToken) {
    const url = `https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=DashboardLoad&_=${Date.now()}`;
    
    const headers = new Headers({
        'host': 'registrofamiglie.axioscloud.it',
        'cookie': `ASP.NET_SessionId=${sessionCookie}`,
        'rvt': axToken, // L'AXToken inviato come header RVT
        'x-requested-with': 'XMLHttpRequest',
        'referer': `https://registrofamiglie.axioscloud.it${redirectUrl}`,
        // ... altri header per emulare il browser
    });
    
    const response = await fetch(url, { method: 'GET', headers });
    // Uno status 200 conferma l'inizializzazione della sessione
    console.log('DashboardLoad status:', response.status); 
    return response.text();
}
```

## Errori comuni e debug

| Sintomo | Causa probabile | Soluzione |
| :--- | :--- | :--- |
| **400 Bad Request** alla prima chiamata API | Stato di sessione non inizializzato. `DashboardLoad` saltato. | Assicurarsi che `fetchDashboardLoad` sia eseguita e completata prima delle chiamate dati. |
| **"L'oggetto SDU non esiste"** | Uso del *primo* `ASP.NET_SessionId` dall'header duplicato. | Estrarre e utilizzare sempre il **secondo** `ASP.NET_SessionId` dall'header `Set-Cookie`. |
| **La sessione funziona brevemente poi fallisce** | La sessione lato server è scaduta (timeout). | Rieseguire il flusso di conversione per ottenere nuova sessione e token. |
| **Dashboard carica, ma le API falliscono** | Mancanza o valore errato dell'header `RVT`. | Verificare che `_AXToken` venga estratto correttamente e inviato come `RVT`. |

## Sequenza minimale (HAR)

Di seguito la **sequenza minima** estratta dal log HTTP:

```http
# 1. Ottenere parametri SSO
GET /webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation?... 

# 2. POST SSO Blob -> ottenere cookie di sessione
POST /Pages/SD/SD_Login.aspx
Body: parameters=...&action=SSO
Response: 302 con Set-Cookie: ASP.NET_SessionId=...

# 3. Caricare Dashboard -> ottenere AXToken
GET /Pages/SD/SD_Dashboard.aspx?s=...
Response: 200 con <input id='_AXToken' value='...' />

# 4. INIZIALIZZARE LA SESSIONE (Obbligatorio)
GET /Pages/APP/APP_Ajax_Get.aspx?Action=DashboardLoad&_=...
Headers: Cookie: ASP.NET_SessionId=...; RVT: ...; X-Requested-With: XMLHttpRequest

# 5. Fare richiesta dati (ora funziona)
GET /Pages/APP/APP_Ajax_Get.aspx?Action=FAMILY_REGISTRO_CLASSE&_=...
Headers: Cookie: ASP.NET_SessionId=...; RVT: ...; X-Requested-With: XMLHttpRequest
Response: 200 con dati JSON/HTML
```

## Conclusione

Alla fine è un modo, non un buon modo ma assolutamente *un modo*, per far interagire due sistemi che non centrano nulla tra loro. E data la complessità della trasformazion, con token nascosti e cookie duplicati, ha probabilmente (anche se non intenzionalmente) anche una funzione di sicurezza, più nel senso che ti viene da cavarti gli occhi, perché bucabile è bucabile. Esperienza 0/10 can't recommend.