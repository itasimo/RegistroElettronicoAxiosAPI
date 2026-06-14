import AxiosAPI from "../dist/index.js";

const CODICE_FISCALE = "80127350157";
const CODICE_UTENTE = "0001114483";
const PASSWORD = "SimoScuolaAxios08!";

// API version will be read from the instance at runtime

describe("AxiosAPI", () => {
    describe("Initial State", () => {
        test("empty login state", () => {
            const api = new AxiosAPI();
            expect(api.isLoggedIn).toBe(false);
            expect(api.getCodiceFiscale).toBeNull();
            expect(api.getUserSession).toBeNull();
            expect(typeof api.getVendorToken).toBe("string");
            expect(api.getVendorToken.length).toBeGreaterThan(0);
        });
        test("apiVersion is set from package.json", () => {
            const api = new AxiosAPI();
            expect(typeof api.apiVersion).toBe("string");
            expect(api.apiVersion.length).toBeGreaterThan(0);
        });
        test("client is an instance of AxiosClient", () => {
            const api = new AxiosAPI();
            expect(typeof api.client).toBe("object");
            expect(typeof api.client.baseURL).toBe("string");
            expect(typeof api.client.vendorToken).toBe("string");
        });
        test("getters return correct values", () => {
            const api = new AxiosAPI();
            expect(api.getBaseURL).toBe(api.client.baseURL);
            expect(api.getVendorToken).toBe(api.client.vendorToken);
            expect(api.getAPIVersion).toBe(api.apiVersion);
            expect(api.getClientInstance).toBe(api.client);
            expect(api.getAPIInstance).toBe(api);
        });
    });
    describe("Logged-in State", () => {
        const api = new AxiosAPI();
        beforeAll(async () => {
            return await api.login(CODICE_FISCALE, CODICE_UTENTE, PASSWORD);
        });
        test("logged in with codiceFiscale, codiceUtente, and password", () => {
            console.log(api.getUserSession);
            expect(api.isLoggedIn).toBe(true);
            expect(api.getCodiceFiscale).toBe(CODICE_FISCALE);
            expect(api.getUserSession).not.toBeNull();
        });
        describe("Getters", () => {
            test("isLoggedIn returns true", () => {
                expect(typeof api.isLoggedIn).toBe("boolean");
                expect(api.isLoggedIn).toBe(true);
            });
            test("getCodiceFiscale returns correct codiceFiscale", () => {
                expect(typeof api.getCodiceFiscale).toBe("string");
                expect(api.getCodiceFiscale).toBe(CODICE_FISCALE);
            });
            test("getUserSession returns a non-empty string", () => {
                expect(typeof api.getUserSession).toBe("string");
                expect(api.getUserSession.length).toBeGreaterThan(0);
            });
            test("getVendorToken returns a non-empty string", () => {
                expect(typeof api.getVendorToken).toBe("string");
                expect(api.getVendorToken.length).toBeGreaterThan(0);
            });
            test("getPIN returns an object containg 2 keys with each 2 strings of 8 charaters", () => {
                const pin = api.getPIN;
                expect(typeof pin).toBe("object");
                expect(Object.keys(pin).length).toBe(2);
                expect(typeof Object.values(pin)[0]).toBe("string");
                expect(typeof Object.values(pin)[1]).toBe("string");
                expect(Object.values(pin)[0].length).toBe(8);
                expect(Object.values(pin)[1].length).toBe(8);
            });
            test("getIsAccountActive returns a boolean", () => {
                const isActive = api.getIsAccountActive;
                expect(typeof isActive).toBe("boolean");
            });
            test("getStudentInfo returns an object containing student information", () => {
                const studentInfo = api.getStudentInfo;
                expect(typeof studentInfo).toBe("object");
                expect(studentInfo).toHaveProperty("nome");
                expect(studentInfo).toHaveProperty("cognome");
                expect(studentInfo).toHaveProperty("dataNascita");
                expect(studentInfo).toHaveProperty("QRCode");
                expect(studentInfo).toHaveProperty("idAlunno");
                expect(studentInfo).toHaveProperty("pin");
            });
            test("getBaseURL returns the client's baseURL", () => {
                expect(api.getBaseURL).toBe(api.client.baseURL);
            });
            test("getAPIVersion returns the apiVersion", () => {
                expect(api.getAPIVersion).toBe(api.apiVersion);
            });
            test("getClientInstance returns the client instance", () => {
                expect(api.getClientInstance).toBe(api.client);
            });
            test("getAPIInstance returns the API instance", () => {
                expect(api.getAPIInstance).toBe(api);
            });
            test("getWebInstance returns the web instance", () => {
                expect(api.getWebInstance).toBe(api.web);
            });
        });
        describe("Response Handling", () => {
            test("argomenti endpoint returns expected data structure", async () => {
                const response = await api.get("argomenti");
                // console.log(response);
                expect(Array.isArray(response)).toBe(true);
            });
            test("assenze endpoint returns expected data structure", async () => {
                const response = await api.get("assenze");
                console.log(response);
                expect(Array.isArray(response)).toBe(true);
            });
            test("compiti endpoint returns expected data structure", async () => {
                const response = await api.get("compiti");
                // console.log(response);
                expect(Array.isArray(response)).toBe(true);
            });
            test("comunicazioni endpoint returns expected data structure", async () => {
                const response = await api.get("comunicazioni");
                console.log(response);
                expect(Array.isArray(response)).toBe(true);
            });
            test("curriculum endpoint returns expected data structure", async () => {
                const response = await api.get("curriculum");
                // console.log(response);
                expect(Array.isArray(response)).toBe(true);
            });
            test("note endpoint returns expected data structure", async () => {
                const response = await api.get("note");
                console.log(response);
                expect(Array.isArray(response)).toBe(true);
            });
            test("orario endpoint returns expected data structure", async () => {
                const response = await api.get("orario");
                // console.log(response);
                expect(Array.isArray(response)).toBe(true);
            });
            test("pagella endpoint returns expected data structure", async () => {
                const response = await api.get("pagella");
                console.log(response);
                expect(Array.isArray(response)).toBe(true);
            });
            test("permessi endpoint returns expected data structure", async () => {
                const response = await api.get("permessi");
                // console.log(response);
                expect(typeof response).toBe("object");
            });
            test("studente endpoint returns expected data structure", async () => {
                const response = await api.get("studente");
                // console.log(response);
                expect(typeof response).toBe("object");
            });
            test("verifiche endpoint returns expected data structure", async () => {
                const response = await api.get("verifiche");
                // console.log(response);
                expect(Array.isArray(response)).toBe(true);
            });
            test("voti endpoint returns expected data structure", async () => {
                const response = await api.get("voti");
                // console.log(response);
                expect(Array.isArray(response)).toBe(true);
            });
        });
        describe("WEB Version", () => {
            let sessionID;
            beforeAll(async () => {
                sessionID = await api.web.toSessionID();
            });
            test("get SessionID", () => {
                console.log(sessionID);
                expect(sessionID).not.toBeNull();
            });
            describe("Getters", () => {
                test("getSessionID returns the session ID", () => {
                    const requestedSessionID = api.getSessionID;
                    expect(typeof requestedSessionID).toBe("string");
                    expect(requestedSessionID.length).toBeGreaterThan(0);
                    expect(requestedSessionID).toBe(api.web.sessionID);
                });
            });
        });

    });
    describe("Login Errors", () => {
        test("login with invalid credentials throws error", async () => {
            const api = new AxiosAPI();
            await expect(
                api.login(
                    "invalidCodiceFiscale",
                    "invalidCodiceUtente",
                    "invalidPassword"
                )
            ).rejects.toThrow("Axios ha risposto con un errore");
        });
    });
});
