import parsePermessi from '@/parsing/parsePermessi.js';

describe('parsePermessi', () => {
    const mockRawData = {
        richiesteDaAutorizzare: [
            {
                id: '5001',
                tipo: 'U',
                dataInizio: '15/01/2026',
                dataFine: '',
                ora: '5',
                orario: '12:15:00',
                motivo: 'Visita medica',
                note: 'Certificato allegato',
                calcolo: 'True',
                giustificato: '0',
                classe: '0',
                utenteInserimento: 'Genitore Mario',
                dataInserimento: '14/01/2026 18:30:00',
                utenteAutorizzazione: '',
                dataAutorizzazione: ''
            }
        ],
        richiesteNonAutorizzate: [
            {
                id: '5002',
                tipo: 'A',
                dataInizio: '10/01/2026',
                dataFine: '',
                ora: '',
                orario: '',
                motivo: 'Malattia',
                note: 'Febbre alta',
                calcolo: 'True',
                giustificato: '0',
                classe: '0',
                utenteInserimento: 'Genitore Mario',
                dataInserimento: '09/01/2026 20:00:00',
                utenteAutorizzazione: 'Coordinatore Prof. Rossi',
                dataAutorizzazione: '10/01/2026 08:00:00',
                rispostoIl: '10/01/2026 08:00:00'
            }
        ],
        permessiDaAutorizzare: [],
        permessiAutorizzati: [
            {
                id: '5003',
                tipo: 'E',
                dataInizio: '20/01/2026',
                dataFine: '',
                ora: '1',
                orario: '08:30:00',
                motivo: 'Ritardo trasporti',
                note: '',
                calcolo: 'True',
                giustificato: 'True',
                classe: '0',
                utenteInserimento: 'Coordinatore Prof. Rossi',
                dataInserimento: '19/01/2026 15:00:00',
                utenteAutorizzazione: 'Dirigente Scolastico',
                dataAutorizzazione: '19/01/2026 16:00:00',
                rispostoIl: '19/01/2026 16:00:00'
            },
            {
                id: '5004',
                tipo: 'G',
                dataInizio: '25/01/2026',
                dataFine: '25/01/2026',
                ora: '',
                orario: '',
                motivo: 'Uscita didattica museo',
                note: 'Classe completa',
                calcolo: '0',
                giustificato: 'True',
                classe: 'True',
                utenteInserimento: 'Prof. Bianchi',
                dataInserimento: '15/01/2026 10:00:00',
                utenteAutorizzazione: 'Dirigente Scolastico',
                dataAutorizzazione: '16/01/2026 09:00:00',
                rispostoIl: '16/01/2026 09:00:00'
            }
        ]
    };

    it('should correctly parse all four permission categories', () => {
        const result = parsePermessi(mockRawData);

        expect(result).toHaveProperty('richiesteDaAutorizzare');
        expect(result).toHaveProperty('richiesteNonAutorizzate');
        expect(result).toHaveProperty('permessiDaAutorizzare');
        expect(result).toHaveProperty('permessiAutorizzati');
    });

    it('should parse richiesteDaAutorizzare correctly', () => {
        const result = parsePermessi(mockRawData);

        expect(result.richiesteDaAutorizzare).toHaveLength(1);
        expect(result.richiesteDaAutorizzare[0]).toEqual({
            id: '5001',
            data: ['15/01/2026', ''],
            tipo: 'Uscita Anticipata',
            ora: '5',
            orario: '12:15',
            motivo: 'Visita medica',
            note: 'Certificato allegato',
            diClasse: false,
            calcolata: true,
            giustificata: false,
            info: {
                inseritoDa: 'Genitore Mario',
                rispostoDa: '',
                rispostoIl: ['']
            }
        });
    });

    it('should parse richiesteNonAutorizzate correctly', () => {
        const result = parsePermessi(mockRawData);

        expect(result.richiesteNonAutorizzate).toHaveLength(1);
        const richiesta = result.richiesteNonAutorizzate[0];
        
        expect(richiesta.tipo).toBe('Assenza');
        expect(richiesta.data).toEqual(['10/01/2026', '']);
        expect(richiesta.info.inseritoDa).toBe('Genitore Mario');
        expect(richiesta.info.rispostoDa).toBe('Coordinatore Prof. Rossi');
        expect(richiesta.info.rispostoIl).toEqual(['10/01/2026', '08:00:00']);
    });

    it('should parse permessiAutorizzati correctly', () => {
        const result = parsePermessi(mockRawData);

        expect(result.permessiAutorizzati).toHaveLength(2);
        
        const permesso1 = result.permessiAutorizzati[0];
        expect(permesso1.tipo).toBe('Entrata Posticipata');
        expect(permesso1.giustificata).toBe(true);
        expect(permesso1.info.inseritoDa).toBe('Coordinatore Prof. Rossi');
        expect(permesso1.info.rispostoDa).toBe('Dirigente Scolastico');
        expect(permesso1.info.rispostoIl).toEqual(['19/01/2026', '16:00:00']);
        
        const permesso2 = result.permessiAutorizzati[1];
        expect(permesso2.tipo).toBe('Uscita Didattica');
        expect(permesso2.diClasse).toBe(true);
    });

    it('should correctly convert permission types', () => {
        const result = parsePermessi(mockRawData);

        expect(result.richiesteDaAutorizzare[0].tipo).toBe('Uscita Anticipata');
        expect(result.richiesteNonAutorizzate[0].tipo).toBe('Assenza');
        expect(result.permessiAutorizzati[0].tipo).toBe('Entrata Posticipata');
        expect(result.permessiAutorizzati[1].tipo).toBe('Uscita Didattica');
    });

    it('should correctly convert boolean fields', () => {
        const result = parsePermessi(mockRawData);

        const richiesta = result.richiesteDaAutorizzare[0];
        expect(richiesta.calcolata).toBe(true);
        expect(richiesta.giustificata).toBe(false);
        expect(richiesta.diClasse).toBe(false);

        const permesso = result.permessiAutorizzati[1];
        expect(permesso.calcolata).toBe(false);
        expect(permesso.giustificata).toBe(true);
        expect(permesso.diClasse).toBe(true);
    });

    it('should split dataInizio and dataFine into data array', () => {
        const result = parsePermessi(mockRawData);

        expect(result.richiesteDaAutorizzare[0].data).toEqual(['15/01/2026', '']);
        expect(result.permessiAutorizzati[1].data).toEqual(['25/01/2026', '25/01/2026']);
    });

    it('should remove seconds from orario', () => {
        const result = parsePermessi(mockRawData);

        expect(result.richiesteDaAutorizzare[0].orario).toBe('12:15');
        expect(result.permessiAutorizzati[0].orario).toBe('08:30');
    });

    it('should store user info in nested info object', () => {
        const result = parsePermessi(mockRawData);

        expect(result.richiesteNonAutorizzate[0].info.rispostoIl).toEqual(['10/01/2026', '08:00:00']);
        expect(result.permessiAutorizzati[0].info.rispostoIl).toEqual(['19/01/2026', '16:00:00']);
        expect(result.richiesteDaAutorizzare[0].info.rispostoIl).toEqual(['']);
    });

    it('should handle empty arrays', () => {
        const emptyData = {
            richiesteDaAutorizzare: [],
            richiesteNonAutorizzate: [],
            permessiDaAutorizzare: [],
            permessiAutorizzati: []
        };
        
        const result = parsePermessi(emptyData);
        
        expect(result.richiesteDaAutorizzare).toEqual([]);
        expect(result.richiesteNonAutorizzate).toEqual([]);
        expect(result.permessiDaAutorizzare).toEqual([]);
        expect(result.permessiAutorizzati).toEqual([]);
    });

    it('should handle null data', () => {
        expect(() => parsePermessi(null)).toThrow();
    });

    it('should handle empty data', () => {
        const emptyData = {
            richiesteDaAutorizzare: [],
            richiesteNonAutorizzate: [],
            permessiDaAutorizzare: [],
            permessiAutorizzati: []
        };
        const result = parsePermessi(emptyData);
        
        expect(result.richiesteDaAutorizzare).toEqual([]);
        expect(result.richiesteNonAutorizzate).toEqual([]);
        expect(result.permessiDaAutorizzare).toEqual([]);
        expect(result.permessiAutorizzati).toEqual([]);
    });

    it('should include all required fields for requests', () => {
        const result = parsePermessi(mockRawData);
        const richiesta = result.richiesteDaAutorizzare[0];

        expect(richiesta).toHaveProperty('id');
        expect(richiesta).toHaveProperty('tipo');
        expect(richiesta).toHaveProperty('data');
        expect(richiesta).toHaveProperty('ora');
        expect(richiesta).toHaveProperty('orario');
        expect(richiesta).toHaveProperty('motivo');
        expect(richiesta).toHaveProperty('note');
        expect(richiesta).toHaveProperty('calcolata');
        expect(richiesta).toHaveProperty('giustificata');
        expect(richiesta).toHaveProperty('diClasse');
        expect(richiesta.info).toHaveProperty('inseritoDa');
    });

    it('should include authorization fields for authorized permissions', () => {
        const result = parsePermessi(mockRawData);
        const permesso = result.permessiAutorizzati[0];

        expect(permesso.info).toHaveProperty('inseritoDa');
        expect(permesso.info).toHaveProperty('rispostoDa');
        expect(permesso.info).toHaveProperty('rispostoIl');
    });
});
