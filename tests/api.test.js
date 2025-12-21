import AxiosAPI from '../dist/index.js';

const CODICE_FISCALE = 'CODICE_FISCALE';
const CODICE_UTENTE = 'CODICE_UTENTE';
const PASSWORD = 'PASSWORD';


describe('AxiosAPI', () => {
    describe('Initial State', () => {
        test('empty login state', () => {
            const api = new AxiosAPI();
            expect(api.isLoggedIn).toBe(false);
            expect(api.getCodiceFiscale).toBeNull();
            expect(api.getUserSession).toBeNull();
            expect(typeof api.getVendorToken).toBe('string');
            expect(api.getVendorToken.length).toBeGreaterThan(0);
        });
        test('apiVersion is set from package.json', () => {
            const api = new AxiosAPI();
            expect(typeof api.apiVersion).toBe('string');
            expect(api.apiVersion.length).toBeGreaterThan(0);
        });
        test('client is an instance of AxiosClient', () => {
            const api = new AxiosAPI();
            expect(typeof api.client).toBe('object');
            expect(typeof api.client.baseURL).toBe('string');
            expect(typeof api.client.vendorToken).toBe('string');
        });
        test('getters return correct values', () => {
            const api = new AxiosAPI();
            expect(api.getBaseURL).toBe(api.client.baseURL);
            expect(api.getVendorToken).toBe(api.client.vendorToken);
            expect(api.getAPIVersion).toBe(api.apiVersion);
            expect(api.getClientInstance).toBe(api.client);
            expect(api.getAPIInstance).toBe(api);
        });
    });
    describe('Login State', () => {
        test('logged in with codiceFiscale, codiceUtente, and password', async () => {
            const api = new AxiosAPI();
            await api.login(CODICE_FISCALE, CODICE_UTENTE, PASSWORD);
            console.log(api.getUserSession);
            expect(api.isLoggedIn).toBe(true);
            expect(api.getCodiceFiscale).toBe(CODICE_FISCALE);
            expect(api.getUserSession).not.toBeNull();
        });
        test('login with invalid credentials throws error', async () => {
            const api = new AxiosAPI();
            await expect(api.login('invalidCodiceFiscale', 'invalidCodiceUtente', 'invalidPassword'))
                .rejects
                .toThrow('Axios ha risposto con un errore');
        });
    });
    describe('Response Handling', () => {
        const api = new AxiosAPI();
        beforeAll(async () => {
            return await api.login(CODICE_FISCALE, CODICE_UTENTE, PASSWORD);
        });
        test('argomenti endpoint returns expected data structure', async () => {
            const response = await api.get('argomenti');
            console.log(response);
            expect(Array.isArray(response)).toBe(true);
        });
        test('assenze endpoint returns expected data structure', async () => {
            const response = await api.get('assenze');
            console.log(response);
            expect(Array.isArray(response)).toBe(true);
        });
        test('compiti endpoint returns expected data structure', async () => {
            const response = await api.get('compiti');
            console.log(response);
            expect(Array.isArray(response)).toBe(true);
        });
        test('comunicazioni endpoint returns expected data structure', async () => {
            const response = await api.get('comunicazioni');
            console.log(response);
            expect(Array.isArray(response)).toBe(true);
        });
        test('curriculum endpoint returns expected data structure', async () => {
            const response = await api.get('curriculum');
            console.log(response);
            expect(Array.isArray(response)).toBe(true);
        });
        test('note endpoint returns expected data structure', async () => {
            const response = await api.get('note');
            console.log(response);
            expect(Array.isArray(response)).toBe(true);
        });
        test('orario endpoint returns expected data structure', async () => {
            const response = await api.get('orario');
            console.log(response);
            expect(Array.isArray(response)).toBe(true);
        });
        test('pagella endpoint returns expected data structure', async () => {
            const response = await api.get('pagella');
            console.log(response);
            expect(Array.isArray(response)).toBe(true);
        });
        test('permessi endpoint returns expected data structure', async () => {
            const response = await api.get('permessi');
            console.log(response);
            expect(typeof response).toBe('object');
        });
        test('studente endpoint returns expected data structure', async () => {
            const response = await api.get('studente');
            console.log(response);
            expect(typeof response).toBe('object');
        });
        test('verifiche endpoint returns expected data structure', async () => {
            const response = await api.get('verifiche');
            console.log(response);
            expect(Array.isArray(response)).toBe(true);
        });
        test('voti endpoint returns expected data structure', async () => {
            const response = await api.get('voti');
            console.log(response);
            expect(Array.isArray(response)).toBe(true);
        });
    });
});