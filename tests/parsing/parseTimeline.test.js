import parseTimeline from '@/parsing/parseTimeline.js';

describe('parseTimeline', () => {
    const mockRawData = {
        today: [
            {
                id: '3001',
                type: 'C',
                data: '20/01/2026',
                subType: '',
                ora: '',
                oralez: '',
                desc: {
                    title: 'Riunione genitori',
                    subtitle: '',
                    notes: 'Si comunica che...'
                }
            },
            {
                id: '1001',
                type: 'A',
                data: '20/01/2026',
                subType: 'A',
                ora: '',
                oralez: '',
                desc: {
                    title: '',
                    subtitle: '',
                    notes: 'Malattia'
                }
            },
            {
                id: '6001',
                type: 'V',
                data: '20/01/2026',
                subType: 'S',
                ora: '',
                oralez: '',
                desc: {
                    title: 'MATEMATICA',
                    subtitle: '',
                    notes: '7'
                }
            },
            {
                id: '2001',
                type: 'M',
                data: '22/01/2026',
                subType: '',
                ora: '',
                oralez: '',
                desc: {
                    title: 'ITALIANO',
                    subtitle: '',
                    notes: 'Leggere capitoli 5-7'
                }
            },
            {
                id: '2003',
                type: 'M',
                data: '25/01/2026',
                subType: '',
                ora: '',
                oralez: '',
                desc: {
                    title: 'FISICA',
                    subtitle: '',
                    notes: '<b>Verifica</b> sulle onde'
                }
            },
            {
                id: '4001',
                type: 'N',
                data: '20/01/2026',
                subType: 'S',
                ora: '',
                oralez: '',
                desc: {
                    title: '',
                    subtitle: '<b>Positiva</b></span>&nbsp;Ottima partecipazione',
                    notes: ''
                }
            }
        ],
        totali: {
            assenze_totali: '8',
            assenze_da_giust: '0',
            ritardi_totali: '2',
            ritardi_da_giust: '0',
            uscite_totali: '5',
            uscite_da_giust: '0'
        },
        media_a: '7.85'
    };

    it('should correctly parse timeline data', () => {
        const result = parseTimeline(mockRawData);

        expect(result).toHaveProperty('oggi');
        expect(result).toHaveProperty('dati');
        expect(result.oggi).toHaveLength(6);
    });

    it('should correctly map event types', () => {
        const result = parseTimeline(mockRawData);

        expect(result.oggi[0].tipo).toBe('Comunicazione');
        expect(result.oggi[1].tipo).toBe('Assenza');
        expect(result.oggi[2].tipo).toBe('Voto');
        expect(result.oggi[3].tipo).toBe('Compito');
        expect(result.oggi[4].tipo).toBe('Compito');
        expect(result.oggi[5].tipo).toBe('Nota');
    });

    it('should correctly determine subtypes for absences', () => {
        const result = parseTimeline(mockRawData);

        expect(result.oggi[1].subTipo).toBe('Assenza');
    });

    it('should correctly determine subtypes for grades', () => {
        const result = parseTimeline(mockRawData);

        expect(result.oggi[2].subTipo).toBe('Scritto');
    });

    it('should correctly determine subtype for verifiche', () => {
        const result = parseTimeline(mockRawData);
        
        // Find the event with Verifica in description
        const verificaEvent = result.oggi.find(e => e.tipo === 'Compito' && e.subTipo === 'Verifica');
        expect(verificaEvent).toBeDefined();
        expect(verificaEvent.subTipo).toBe('Verifica');
        expect(verificaEvent.descrizione).toBe('sulle onde'); // Should have HTML tag removed
        
        // Regular compito without Verifica should have empty subTipo
        const normalEvent = result.oggi.find(e => e.tipo === 'Compito' && e.descrizione.includes('capitoli'));
        expect(normalEvent.subTipo).toBe('');
    });

    it('should correctly determine subtypes for notes', () => {
        const result = parseTimeline(mockRawData);

        expect(result.oggi[5].subTipo).toBe('Studente');
    });

    it('should extract note type from HTML for notes', () => {
        const result = parseTimeline(mockRawData);
        const nota = result.oggi[5];

        expect(nota.titolo).toBe('Positiva');
        expect(nota.sottoTitolo).toBe('Ottima partecipazione');
    });

    it('should preserve all event fields', () => {
        const result = parseTimeline(mockRawData);
        const event = result.oggi[0];

        expect(event).toHaveProperty('data');
        expect(event).toHaveProperty('tipo');
        expect(event).toHaveProperty('subTipo');
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('ora');
        expect(event).toHaveProperty('titolo');
        expect(event).toHaveProperty('sottoTitolo');
        expect(event).toHaveProperty('descrizione');
    });

    it('should correctly parse statistics', () => {
        const result = parseTimeline(mockRawData);

        expect(result.dati).toEqual({
            media: '7.85',
            assenzeTot: '8',
            assenzeDaGiust: '0',
            ritardiTot: '2',
            ritardiDaGiust: '0',
            usciteTot: '5',
            usciteDaGiust: '0'
        });
    });

    it('should preserve statistics as strings from API', () => {
        const result = parseTimeline(mockRawData);

        expect(typeof result.dati.assenzeTot).toBe('string');
        expect(typeof result.dati.ritardiTot).toBe('string');
        expect(typeof result.dati.usciteTot).toBe('string');
        expect(typeof result.dati.media).toBe('string');
    });

    it('should handle empty oggi array', () => {
        const emptyData = {
            today: [],
            totali: {
                assenze_totali: '0',
                assenze_da_giust: '0',
                ritardi_totali: '0',
                ritardi_da_giust: '0',
                uscite_totali: '0',
                uscite_da_giust: '0'
            },
            media_a: '0'
        };
        
        const result = parseTimeline(emptyData);
        expect(result.oggi).toEqual([]);
    });
});
