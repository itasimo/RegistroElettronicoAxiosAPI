import parsePagella from '@/parsing/parsePagella.js';

describe('parsePagella', () => {
    const mockRawData = [
        {
            descFrazione: 'PRIMO QUADRIMESTRE',
            materie: [
                {
                    descMat: 'MATEMATICA',
                    mediaVoti: '7',
                    giudizio: '',
                    assenze: '2',
                    schedaCarenza: null
                },
                {
                    descMat: 'ITALIANO',
                    mediaVoti: '8',
                    giudizio: '',
                    assenze: '1',
                    schedaCarenza: null
                },
                {
                    descMat: 'FISICA',
                    mediaVoti: '5',
                    giudizio: '',
                    assenze: '3',
                    schedaCarenza: {
                        motivo: 'Carenze nella comprensione',
                        rilevate: 'Argomenti del secondo capitolo',
                        modalitaRecupero: 'Corso di recupero',
                        verifica: 'Verifica scritta',
                        dataVerifica: '15/02/2026',
                        verificaArgomenti: 'Capitolo 2',
                        verificaGiudizio: ''
                    }
                }
            ],
            esito: 'Promosso',
            giudizio: '<p>Buon rendimento <b>generale</b>.</p>',
            URL: 'https://example.com/pagella1.pdf',
            letta: 'S',
            visibile: 'true',
            dataVisualizzazione: '31/01/2026'
        },
        {
            descFrazione: 'SECONDO QUADRIMESTRE',
            materie: [],
            esito: '',
            giudizio: '',
            URL: '',
            letta: 'N',
            visibile: 'false',
            dataVisualizzazione: ''
        }
    ];

    it('should correctly parse report cards for multiple quarters', () => {
        const result = parsePagella(mockRawData);

        expect(result).toHaveLength(2);
        expect(result[0].quadrimestre).toBe('PRIMO QUADRIMESTRE');
        expect(result[1].quadrimestre).toBe('SECONDO QUADRIMESTRE');
    });

    it('should correctly parse subjects with grades', () => {
        const result = parsePagella(mockRawData);

        expect(result[0].materie).toHaveLength(3);
        expect(result[0].materie[0]).toEqual({
            materia: 'MATEMATICA',
            voto: '7',
            debito: {},
            giudizio: '',
            assenze: 2
        });
        expect(result[0].materie[1]).toEqual({
            materia: 'ITALIANO',
            voto: '8',
            debito: {},
            giudizio: '',
            assenze: 1
        });
    });

    it('should correctly handle schedaCarenza (debt)', () => {
        const result = parsePagella(mockRawData);
        const fisica = result[0].materie[2];

        expect(fisica.debito).not.toBeNull();
        expect(fisica.debito).toEqual({
            motivo: 'Carenze nella comprensione',
            argomenti: 'Argomenti del secondo capitolo',
            modRecupero: 'Corso di recupero',
            tipoVerifica: 'Verifica scritta',
            dataVerifica: '15/02/2026',
            argVerifica: 'Capitolo 2',
            giudizioVerifica: ''
        });
    });

    it('should remove HTML tags from giudizio', () => {
        const result = parsePagella(mockRawData);

        expect(result[0].giudizio).toBe('Buon rendimento generale.');
    });

    it('should calculate media correctly', () => {
        const result = parsePagella(mockRawData);

        // (7 + 8 + 5) / 3 = 6.666...
        expect(result[0].media).toBeCloseTo(6.67, 1);
    });

    it('should handle quarters with no grades', () => {
        const result = parsePagella(mockRawData);

        expect(result[1].materie).toEqual([]);
        expect(isNaN(result[1].media)).toBe(true);
    });

    it('should correctly convert boolean fields', () => {
        const result = parsePagella(mockRawData);

        expect(result[0].letta).toBe(true);
        expect(result[0].visibile).toBe(true);
        expect(result[1].letta).toBe(false);
        expect(result[1].visibile).toBe(false);
    });

    it('should include all required fields', () => {
        const result = parsePagella(mockRawData);
        const pagella = result[0];

        expect(pagella).toHaveProperty('quadrimestre');
        expect(pagella).toHaveProperty('materie');
        expect(pagella).toHaveProperty('media');
        expect(pagella).toHaveProperty('esito');
        expect(pagella).toHaveProperty('giudizio');
        expect(pagella).toHaveProperty('URL');
        expect(pagella).toHaveProperty('letta');
        expect(pagella).toHaveProperty('visibile');
        expect(pagella).toHaveProperty('dataVisualizzazione');
    });

    it('should handle null data', () => {
        expect(() => parsePagella(null)).toThrow();
    });

    it('should handle empty array', () => {
        const result = parsePagella([]);
        expect(result).toEqual([]);
    });

    it('should preserve URL and dates', () => {
        const result = parsePagella(mockRawData);

        expect(result[0].URL).toBe('https://example.com/pagella1.pdf');
        expect(result[0].dataVisualizzazione).toBe('31/01/2026');
        expect(result[1].URL).toBe('');
        expect(result[1].dataVisualizzazione).toBe('');
    });

    it('should handle media calculation with decimal grades', () => {
        const customData = [{
            descFrazione: 'PRIMO QUADRIMESTRE',
            materie: [
                { descMat: 'MAT', mediaVoti: '7.5', giudizio: '', assenze: '0', schedaCarenza: null },
                { descMat: 'ITA', mediaVoti: '8.5', giudizio: '', assenze: '0', schedaCarenza: null }
            ],
            esito: '', giudizio: '', URL: '', letta: 'N', visibile: 'false', dataVisualizzazione: ''
        }];
        
        const result = parsePagella(customData);
        expect(result[0].media).toBeCloseTo(8, 2);
    });
});
