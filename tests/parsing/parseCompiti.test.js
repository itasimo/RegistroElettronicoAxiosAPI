import parseCompiti from '@/parsing/parseCompiti.js';

describe('parseCompiti', () => {
    const mockRawData = [
        {
            idCompito: '2001',
            tipo_nota: '3',
            data: '20/01/2026 00:00:00',
            idMat: '100',
            descMat: 'MATEMATICA',
            descCompiti: 'Esercizi pag. 150-152',
            data_pubblicazione: '18/01/2026 14:30:00'
        },
        {
            idCompito: '2002',
            tipo_nota: '3',
            data: '22/01/2026 00:00:00',
            idMat: '101',
            descMat: 'ITALIANO',
            descCompiti: 'Leggere capitoli 5-7',
            data_pubblicazione: '19/01/2026 10:00:00'
        },
        {
            idCompito: '2003',
            tipo_nota: '6',
            data: '25/01/2026 00:00:00',
            idMat: '100',
            descMat: 'MATEMATICA',
            descCompiti: '<b>Verifica</b> sulle derivate',
            data_pubblicazione: '20/01/2026 09:00:00'
        },
        {
            idCompito: '2004',
            tipo_nota: '6',
            data: '27/01/2026 00:00:00',
            idMat: '102',
            descMat: 'INGLESE',
            descCompiti: '<b>Verifica</b> past simple',
            data_pubblicazione: '21/01/2026 11:00:00'
        }
    ];

    it('should return empty array when rawData is null', () => {
        expect(() => parseCompiti(null)).toThrow();
    });

    it('should return empty array when rawData is empty', () => {
        const result = parseCompiti([]);
        expect(result).toEqual([]);
    });

    it('should extract only homework (tipo_nota 3) before first test', () => {
        const result = parseCompiti(mockRawData);

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('2001');
        expect(result[1].id).toBe('2002');
    });

    it('should correctly parse homework fields', () => {
        const result = parseCompiti(mockRawData);

        expect(result[0]).toEqual({
            id: '2001',
            materia: 'MATEMATICA',
            compito: 'Esercizi pag. 150-152',
            perGiorno: '20/01/2026',
            pubblicato: ['18/01/2026', '14:30:00']
        });
    });

    it('should split date and time correctly', () => {
        const result = parseCompiti(mockRawData);

        expect(result[0].perGiorno).toBe('20/01/2026');
        expect(result[0].pubblicato).toEqual(['18/01/2026', '14:30:00']);
    });

    it('should handle data with no tests (all tipo_nota 3)', () => {
        const onlyHomework = mockRawData.filter(item => item.tipo_nota === '3');
        const result = parseCompiti(onlyHomework);

        expect(result).toHaveLength(2);
        expect(result.every(item => item.compito.includes('Esercizi') || item.compito.includes('Leggere'))).toBe(true);
    });

    it('should handle data with only tests (all tipo_nota 6)', () => {
        const onlyTests = mockRawData.filter(item => item.tipo_nota === '6');
        const result = parseCompiti(onlyTests);

        expect(result).toEqual([]);
    });

    it('should handle single homework item', () => {
        const singleItem = [mockRawData[0]];
        const result = parseCompiti(singleItem);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2001');
    });

    it('should stop at first occurrence of tipo_nota 6', () => {
        const result = parseCompiti(mockRawData);

        // Should include items at index 0 and 1
        expect(result).toHaveLength(2);
        
        // Should not include items at index 2 and 3 (tipo_nota 6)
        expect(result.some(item => item.compito.includes('Verifica'))).toBe(false);
    });
});
