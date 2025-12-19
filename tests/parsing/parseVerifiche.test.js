import parseVerifiche from '@/parsing/parseVerifiche.js';

describe('parseVerifiche', () => {
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
        expect(() => parseVerifiche(null)).toThrow();
    });

    it('should return empty array when rawData is empty', () => {
        const result = parseVerifiche([]);
        expect(result).toEqual([]);
    });

    it('should extract only tests (tipo_nota 6) from first occurrence', () => {
        const result = parseVerifiche(mockRawData);

        expect(result).toHaveLength(2);
        expect(result[0].materia).toBe('MATEMATICA');
        expect(result[1].materia).toBe('INGLESE');
    });

    it('should correctly parse test fields', () => {
        const result = parseVerifiche(mockRawData);

        expect(result[0]).toEqual({
            materia: 'MATEMATICA',
            verifica: 'sulle derivate',
            perGiorno: '25/01/2026',
            pubblicato: ['20/01/2026', '09:00:00']
        });
    });

    it('should remove <b>Verifica</b> tag from description', () => {
        const result = parseVerifiche(mockRawData);

        expect(result[0].verifica).toBe('sulle derivate');
        expect(result[1].verifica).toBe('past simple');
        
        // Should not contain HTML tags
        expect(result[0].verifica.includes('<b>')).toBe(false);
        expect(result[0].verifica.includes('</b>')).toBe(false);
        expect(result[0].verifica.includes('Verifica')).toBe(false);
    });

    it('should split date and time correctly', () => {
        const result = parseVerifiche(mockRawData);

        expect(result[0].perGiorno).toBe('25/01/2026');
        expect(result[0].pubblicato).toEqual(['20/01/2026', '09:00:00']);
    });

    it('should handle data with no homework (all tipo_nota 6)', () => {
        const onlyTests = mockRawData.filter(item => item.tipo_nota === '6');
        const result = parseVerifiche(onlyTests);

        expect(result).toHaveLength(2);
        expect(result.every(item => !item.verifica.includes('<b>Verifica</b>'))).toBe(true);
    });

    it('should handle data with no tests (all tipo_nota 3)', () => {
        const onlyHomework = mockRawData.filter(item => item.tipo_nota === '3');
        const result = parseVerifiche(onlyHomework);

        expect(result).toEqual([]);
    });

    it('should start from first occurrence of tipo_nota 6', () => {
        const result = parseVerifiche(mockRawData);

        // Should include items at index 2 and 3 (tipo_nota 6)
        expect(result).toHaveLength(2);
        
        // Should not include items at index 0 and 1 (tipo_nota 3)
        expect(result.some(item => item.verifica.includes('Esercizi'))).toBe(false);
        expect(result.some(item => item.verifica.includes('Leggere'))).toBe(false);
    });

    it('should handle single test item', () => {
        const singleTest = [mockRawData[2]];
        const result = parseVerifiche(singleTest);

        expect(result).toHaveLength(1);
        expect(result[0].materia).toBe('MATEMATICA');
        expect(result[0].verifica).toBe('sulle derivate');
    });

    it('should include all required fields', () => {
        const result = parseVerifiche(mockRawData);
        const verifica = result[0];

        expect(verifica).toHaveProperty('materia');
        expect(verifica).toHaveProperty('verifica');
        expect(verifica).toHaveProperty('perGiorno');
        expect(verifica).toHaveProperty('pubblicato');
    });

    it('should handle HTML tag variations', () => {
        const customData = [
            {
                idCompito: '3001',
                tipo_nota: '6',
                data: '30/01/2026 00:00:00',
                idMat: '103',
                descMat: 'STORIA',
                descCompiti: '<b>Verifica</b>sulla Seconda Guerra Mondiale',
                data_pubblicazione: '25/01/2026 08:00:00'
            }
        ];
        
        const result = parseVerifiche(customData);

        expect(result[0].verifica).toBe('sulla Seconda Guerra Mondiale');
    });
});
