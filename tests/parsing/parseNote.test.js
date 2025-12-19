import parseNote from '@/parsing/parseNote.js';

describe('parseNote', () => {
    const mockRawData = [
        {
            descFrazione: 'PRIMO QUADRIMESTRE',
            note: [
                {
                    id: '4001',
                    data: '15/01/2026',
                    tipo: 'C',
                    descNota: '<b>Disciplinare</b></span>&nbsp;Comportamento scorretto durante la lezione',
                    descDoc: 'Prof. Rossi',
                    isLetta: 'True',
                    vistatoUtente: 'Genitore Mario',
                    vistatoData: '16/01/2026 08:30:00',
                    letta: '1',
                    lettaData: '16/01/2026 08:30:00'
                },
                {
                    id: '4002',
                    data: '20/01/2026',
                    tipo: 'S',
                    descNota: '<b>Positiva</b></span>&nbsp;Ottima partecipazione alle attività',
                    descDoc: 'Prof. Bianchi',
                    isLetta: 'True',
                    vistatoUtente: 'Genitore Mario',
                    vistatoData: '20/01/2026 14:00:00'
                }
            ]
        },
        {
            descFrazione: 'SECONDO QUADRIMESTRE',
            note: [
                {
                    id: '4003',
                    data: '10/03/2026',
                    tipo: 'S',
                    descNota: '<b>Ammonizione</b></span>&nbsp;Ritardo ripetuto',
                    descDoc: 'Prof. Verdi',
                    isLetta: 'False',
                    vistatoUtente: '',
                    vistatoData: ''
                }
            ]
        }
    ];

    it('should correctly parse notes for multiple quarters', () => {
        const result = parseNote(mockRawData);

        expect(result).toHaveLength(2);
        expect(result[0].quadrimestre).toBe('PRIMO QUADRIMESTRE');
        expect(result[0].note).toHaveLength(2);
        expect(result[1].quadrimestre).toBe('SECONDO QUADRIMESTRE');
        expect(result[1].note).toHaveLength(1);
    });

    it('should correctly map note types', () => {
        const result = parseNote(mockRawData);

        expect(result[0].note[0].tipo).toBe('Classe');
        expect(result[0].note[1].tipo).toBe('Studente');
        expect(result[1].note[0].tipo).toBe('Studente');
    });

    it('should extract note type from HTML', () => {
        const result = parseNote(mockRawData);

        expect(result[0].note[0].tipoNota).toBe('Disciplinare');
        expect(result[0].note[1].tipoNota).toBe('Positiva');
        expect(result[1].note[0].tipoNota).toBe('Ammonizione');
    });

    it('should extract note text without HTML', () => {
        const result = parseNote(mockRawData);

        expect(result[0].note[0].nota).toBe('Comportamento scorretto durante la lezione');
        expect(result[0].note[1].nota).toBe('Ottima partecipazione alle attività');
        expect(result[1].note[0].nota).toBe('Ritardo ripetuto');
    });

    it('should correctly convert read status', () => {
        const result = parseNote(mockRawData);

        expect(result[0].note[0].letta).toBe(true);
        expect(result[0].note[1].letta).toBe(true);
        expect(result[1].note[0].letta).toBe(false);
    });

    it('should correctly split read date', () => {
        const result = parseNote(mockRawData);

        expect(result[0].note[0].lettaIl).toEqual(['16/01/2026', '08:30:00']);
        expect(result[0].note[1].lettaIl).toEqual(['20/01/2026', '14:00:00']);
        expect(result[1].note[0].lettaIl).toEqual(['']);
    });

    it('should include all required fields', () => {
        const result = parseNote(mockRawData);
        const note = result[0].note[0];

        expect(note).toHaveProperty('data');
        expect(note).toHaveProperty('tipo');
        expect(note).toHaveProperty('tipoNota');
        expect(note).toHaveProperty('docente');
        expect(note).toHaveProperty('nota');
        expect(note).toHaveProperty('letta');
        expect(note).toHaveProperty('lettaDa');
        expect(note).toHaveProperty('lettaIl');
    });

    it('should handle empty quarters', () => {
        const emptyData = [
            {
                descFrazione: 'PRIMO QUADRIMESTRE',
                note: []
            }
        ];
        const result = parseNote(emptyData);

        expect(result).toHaveLength(1);
        expect(result[0].note).toHaveLength(0);
    });

    it('should handle null data', () => {
        expect(() => parseNote(null)).toThrow();
    });

    it('should handle empty array', () => {
        const result = parseNote([]);
        expect(result).toEqual([]);
    });
});
