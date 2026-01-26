# Axios Mobile-to-Web Session Conversion: Technical Deep Dive

## 📋 Overview & Core Concept

This document details the process of converting a user session from the **Axios Italia mobile application** (`com.axiositalia.re.students`) into a valid, authenticated web session for the **Registro Elettronico Famiglie** portal. This conversion is necessary because the mobile app uses a proprietary authentication scheme, while the web portal relies on standard ASP.NET session cookies. The process acts as a **Single Sign-On (SSO) bridge**, transforming a mobile session token into a web-compatible `ASP.NET_SessionId`.

**Core Problem**: The mobile app and web portal are separate systems. The mobile app authenticates via a REST API (`wsalu.axioscloud.it`) and receives a session GUID. To access web content (e.g., class registers, grades), this mobile session must be converted into a stateful ASP.NET web session on a different domain (`registrofamiglie.axioscloud.it`).

## 🧩 Key Components & Terminology

| Component | Description | Example/Format |
| :--- | :--- | :--- |
| **`sSessionGuid`** | The primary session identifier returned by the mobile app's login. | `5b2c5b21-4562-4fe9-8f33-36c3717cb41d` (UUID) |
| **`sVendorToken`** | A static, app-specific token used to authenticate the mobile client to the REST API. | `5ed95c58-fbc2-4db8-92cb-7e1e73ba2065` |
| **`ASP.NET_SessionId`** | The standard ASP.NET session cookie. The target of the conversion. | `fvo0n0rmy2dkiiiuicgp4xd1` (24-char, a-z0-5) |
| **`_AXToken` / `RVT`** | An **Anti-Forgery Token**. A Base64-encoded string embedded in the web page and sent as the `RVT` header in subsequent AJAX calls to validate the session context. | `NEJFNDk3MEQzNTZDOTFCMTM1RTY1NzUyQUI2MkExQjc=` |
| **`s` Parameter** | A signed, encoded query string parameter passed during the initial dashboard redirect. Likely contains a signed assertion of the successful SSO. | `r%2byBg%2bdk1UbyUVL32lecR7xbpDKrsI7NWv7cLvagkqs%3d` |

## 🔄 Detailed Request Flow & Analysis

The complete conversion involves a precise sequence of HTTP requests. Skipping or reordering steps results in a session that exists but is internally marked as invalid.

### Step 1: Request SSO Parameters from Mobile API
**Purpose**: Obtain the one-time-use SSO blob and target URL from the mobile backend.
**Endpoint**: `GET https://wsalu.axioscloud.it/webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation`
**Critical Parameters**:
```json
{
  "sCodiceFiscale": "80127350157",
  "sSessionGuid": "5b2c5b21-4562-4fe9-8f33-36c3717cb41d",
  "sCommandJSON": {"sApplication": "FAM", "sService": "GET_URL_WEB"},
  "sVendorToken": "5ed95c58-fbc2-4db8-92cb-7e1e73ba2065"
}
```
**Response**: A JSON object containing an `action` ("SSO"), a `target` ("_self"), a `url` (the web login page), and a long, base64-encoded `parameters` blob.

### Step 2: Exchange SSO Blob for ASP.NET Session
**Purpose**: Submit the SSO blob to the web application to create a session container.
**Endpoint**: `POST https://registrofamiglie.axioscloud.it/Pages/SD/SD_Login.aspx`
**Body**: `application/x-www-form-urlencoded`
```
parameters=<LONG_BASE64_BLOB>&action=SSO
```
**Critical Response Headers**:
- `Status: 302 Found`
- `Location: /Pages/SD/SD_Dashboard.aspx?s=...` (Redirect URL with `s` parameter)
- **`Set-Cookie: ASP.NET_SessionId=...` (DUPLICATE HEADERS)**

**The Duplicate Cookie Mystery**:
The server sends *two* `Set-Cookie` headers for `ASP.NET_SessionId`. Analysis shows this is likely an IIS configuration artifact or related to HSTS/SameSite cookie handling.
```http
Set-Cookie: ASP.NET_SessionId=g2o3dmovvfkef5romcc4sjbr; path=/; secure; HttpOnly; SameSite=Lax
Set-Cookie: ASP.NET_SessionId=fvo0n0rmy2dkiiiuicgp4xd1; path=/; secure; HttpOnly; SameSite=Lax
```
**Only the second cookie is valid for authenticated requests.** The first appears to be a stale or invalidated session container.

### Step 3: Load Dashboard & Extract AXToken
**Purpose**: Follow the redirect to establish the session in the browser context and extract the anti-forgery token (`_AXToken`).
**Endpoint**: `GET https://registrofamiglie.axioscloud.it/Pages/SD/SD_Dashboard.aspx?s=...`
**Key Action**: The server responds with the full dashboard HTML. Embedded within a hidden input field is the critical `_AXToken`.

**HTML Snippet from Response**:
```html
<input type='hidden' id='_AXToken' value='NEJFNDk3MEQzNTZDOTFCMTM1RTY1NzUyQUI2MkExQjc=' />
```
This token **must be extracted** (via regex) and used as the `RVT` header in all subsequent AJAX calls.

### Step 4: Initialize Session State (The Critical Step)
**Purpose**: Before any data API calls succeed, the session must be transitioned from a "new container" to an "authenticated state." This is done by calling the **DashboardLoad** endpoint.
**Endpoint**: `GET https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=DashboardLoad`
**Required Headers**:
- `Cookie: ASP.NET_SessionId=<VALID_SESSION_ID>`
- `RVT: <AXToken_VALUE>`
- `X-Requested-With: XMLHttpRequest`

**Insight**: While the app makes several initial calls (`sidebartoggler`, `marketread`, `HeaderLoad`, `FooterLoad`), testing proved that **only `DashboardLoad` is essential**. This single request writes the user's identity, permissions, and school context into the server-side session store. Skipping it results in a "hollow" session that returns `400 Bad Request` on data API calls.

### Step 5: Make Authenticated Data Requests
**Purpose**: After successful initialization, the session can be used to fetch application data.
**Endpoint Example**: `GET https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=FAMILY_REGISTRO_CLASSE`
**Required Headers**: Same as Step 4—the session cookie and RVT token.

## 💻 Implementation Code (Core Functions)

### Main Conversion Function
```javascript
export default async function toSessionID(codiceFiscale, usersession) {
    // 1. Get SSO parameters from mobile backend
    const authParams = await getRegistroFamiglieParameters(codiceFiscale, usersession);
    
    // 2. Exchange for ASP.NET session cookie
    const [sessionCookie, redirectUrl] = await convertToRegistroFamiglieCookie(authParams);
    
    // 3. Load dashboard and extract AXToken
    const axToken = await fetchAxToken(sessionCookie, redirectUrl);
    
    // 4. CRITICAL: Initialize session state via DashboardLoad
    await fetchDashboardLoad(sessionCookie, redirectUrl, axToken);
    
    // 5. Session is now ready for use
    return sessionCookie;
}
```

### Critical Helper: Session Initialization (`fetchDashboardLoad`)
```javascript
async function fetchDashboardLoad(sessionCookie, redirectUrl, axToken) {
    const url = `https://registrofamiglie.axioscloud.it/Pages/APP/APP_Ajax_Get.aspx?Action=DashboardLoad&_=${Date.now()}`;
    
    const headers = new Headers({
        'host': 'registrofamiglie.axioscloud.it',
        'cookie': `ASP.NET_SessionId=${sessionCookie}`,
        'rvt': axToken, // The AXToken used as RVT header
        'x-requested-with': 'XMLHttpRequest',
        'referer': `https://registrofamiglie.axioscloud.it${redirectUrl}`,
        // ... other browser-matching headers
    });
    
    const response = await fetch(url, { method: 'GET', headers });
    // A 200 status confirms session initialization
    console.log('DashboardLoad status:', response.status); 
    return response.text();
}
```

## 🔐 Security & Token Analysis

### RVT / AXToken Lifecycle & Purpose
The `RVT` (Request Verification Token) is **static for the session lifetime**. It is not a CSRF token in the traditional sense but rather a **session context identifier**.

1.  **Generation**: Created server-side during the SSO handshake and embedded in the dashboard HTML.
2.  **Usage**: Must be sent as the `RVT` HTTP header in every AJAX request to `APP_Ajax_Get.aspx`.
3.  **Validation**: The server matches the incoming `RVT` value against the context stored in the server-side session. If missing or mismatched, requests are rejected.
4.  **Persistence**: Remains valid until the `ASP.NET_SessionId` expires (due to inactivity or logout).

### ASP.NET Session Fixation Protection
The observed flow suggests the server implements countermeasures:
- Issuing a new `ASP.NET_SessionId` after successful SSO login (the second cookie).
- Requiring an explicit session initialization step (`DashboardLoad`) before marking the session as fully authenticated. This prevents a pre-generated session ID from being used maliciously.

## 🐛 Common Failure Modes & Debugging

| Symptom | Likely Cause | Solution |
| :--- | :--- | :--- |
| **400 Bad Request** on first API call | Session state not initialized. `DashboardLoad` was skipped. | Ensure `fetchDashboardLoad` is called and completes successfully before any data requests. |
| **"L'oggetto SDU non esiste"** | Using the *first* `ASP.NET_SessionId` cookie from the duplicate set. | Always extract and use the **second** `ASP.NET_SessionId` from the `Set-Cookie` header. |
| **Session works briefly then fails** | The server-side session has expired (timeout). | Re-run the entire conversion flow to obtain a new session and token. |
| **Dashboard loads, but API calls fail** | Missing or incorrect `RVT` header. | Verify the `_AXToken` is correctly extracted from the dashboard HTML and sent as the `RVT` header. |

## 📊 Appendix: Full HAR File Request Sequence

The following is the **minimal successful sequence** extracted from the HTTP log:

```http
# 1. Get SSO Parameters
GET /webservice/AxiosCloud_Ws_Rest.svc/RetrieveDataInformation?... 

# 2. POST SSO Blob -> Get Session Cookie
POST /Pages/SD/SD_Login.aspx
Body: parameters=...&action=SSO
Response: 302 with Set-Cookie: ASP.NET_SessionId=...

# 3. Load Dashboard -> Get AXToken
GET /Pages/SD/SD_Dashboard.aspx?s=...
Response: 200 with <input id='_AXToken' value='...' />

# 4. INITIALIZE SESSION (Mandatory)
GET /Pages/APP/APP_Ajax_Get.aspx?Action=DashboardLoad&_=...
Headers: Cookie: ASP.NET_SessionId=...; RVT: ...; X-Requested-With: XMLHttpRequest

# 5. Make Data Request (Now succeeds)
GET /Pages/APP/APP_Ajax_Get.aspx?Action=FAMILY_REGISTRO_CLASSE&_=...
Headers: Cookie: ASP.NET_SessionId=...; RVT: ...; X-Requested-With: XMLHttpRequest
Response: 200 with JSON/HTML data
```

## 🎯 Conclusion

The Axios session conversion is a **stateful, multi-step handshake**:
1.  **Mobile Token** → **SSO Blob** (via mobile API)
2.  **SSO Blob** → **ASP.NET Session Container** (via web login page)
3.  **Session Container** → **Authenticated Session** (via `DashboardLoad` + `RVT`)

The key insight is that creating a session cookie (`ASP.NET_SessionId`) is **not enough**. The session must be explicitly initialized by loading the user's context, a step enforced by the `RVT` token mechanism. This design provides security against session fixation while enabling a seamless cross-platform login experience.