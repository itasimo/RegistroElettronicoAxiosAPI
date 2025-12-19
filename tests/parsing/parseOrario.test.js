import parseOrario from '@/parsing/parseOrario.js';

describe('parseOrario', () => {
    const mockRawData = [
        {
            giorno: 'G1',
            materie: []
        },
        {
            giorno: 'G2',
            materie: [
                {
                    ora: '1',
                    da: '08:00',
                    a: '09:00',
                    descMat: 'MATEMATICA',
                    descDoc: 'ROSSI MARIO'
                },
                {
                    ora: '2',
                    da: '09:00',
                    a: '10:00',
                    descMat: 'ITALIANO',
                    descDoc: 'BIANCHI LAURA'
                }
            ]
        },
        {
            giorno: 'G3',
            materie: [
                {
                    ora: '3',
                    da: '10:15',
                    a: '11:15',
                    descMat: 'FISICA',
                    descDoc: 'VERDI ANNA'
                }
            ]
        },
        {
            giorno: 'G4',
            materie: []
        },
        {
            giorno: 'G5',
            materie: [
                {
                    ora: '1',
                    da: '08:00',
                    a: '09:00',
                    descMat: 'INGLESE',
                    descDoc: 'NERI PAOLO'
                }
            ]
        },
        {
            giorno: 'G6',
            materie: []
        }
    ];

    it('should correctly convert day codes to names', () => {
        const result = parseOrario(mockRawData);

        expect(result[0].giorno).toBe('Lunedì');
        expect(result[1].giorno).toBe('Martedì');
        expect(result[2].giorno).toBe('Mercoledì');
        expect(result[3].giorno).toBe('Giovedì');
        expect(result[4].giorno).toBe('Venerdì');
        expect(result[5].giorno).toBe('Sabato');
    });

    it('should correctly parse lessons for each day', () => {
        const result = parseOrario(mockRawData);

        expect(result[0].orario).toHaveLength(0);
        expect(result[1].orario).toHaveLength(2);
        expect(result[2].orario).toHaveLength(1);
        expect(result[3].orario).toHaveLength(0);
        expect(result[4].orario).toHaveLength(1);
        expect(result[5].orario).toHaveLength(0);
    });

    it('should correctly parse lesson details', () => {
        const result = parseOrario(mockRawData);
        const lesson = result[1].orario[0];

        expect(lesson).toEqual({
            ora: '1',
            durata: ['08:00', '09:00'],
            materia: 'MATEMATICA',
            docente: 'ROSSI MARIO'
        });
    });

    it('should create durata array from da and a', () => {
        const result = parseOrario(mockRawData);

        expect(result[1].orario[0].durata).toEqual(['08:00', '09:00']);
        expect(result[1].orario[1].durata).toEqual(['09:00', '10:00']);
        expect(result[2].orario[0].durata).toEqual(['10:15', '11:15']);
    });

    it('should include all required fields for lessons', () => {
        const result = parseOrario(mockRawData);
        const lesson = result[1].orario[0];

        expect(lesson).toHaveProperty('ora');
        expect(lesson).toHaveProperty('durata');
        expect(lesson).toHaveProperty('materia');
        expect(lesson).toHaveProperty('docente');
    });

    it('should handle days with no lessons', () => {
        const result = parseOrario(mockRawData);

        expect(result[0].orario).toEqual([]);
        expect(result[3].orario).toEqual([]);
        expect(result[5].orario).toEqual([]);
    });

    it('should maintain all days even if empty', () => {
        const result = parseOrario(mockRawData);

        expect(result).toHaveLength(6);
        expect(result.map(d => d.giorno)).toEqual([
            'Lunedì',
            'Martedì',
            'Mercoledì',
            'Giovedì',
            'Venerdì',
            'Sabato'
        ]);
    });

    it('should handle null data', () => {
        expect(() => parseOrario(null)).toThrow();
    });

    it('should handle empty array', () => {
        const result = parseOrario([]);
        expect(result).toEqual([]);
    });

    it('should handle multiple lessons in same day', () => {
        const result = parseOrario(mockRawData);
        const tuesday = result[1];

        expect(tuesday.orario).toHaveLength(2);
        expect(tuesday.orario[0].materia).toBe('MATEMATICA');
        expect(tuesday.orario[1].materia).toBe('ITALIANO');
    });
});
