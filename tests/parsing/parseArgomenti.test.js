import parseArgomenti from '@/parsing/parseArgomenti.js';

describe('parseArgomenti', () => {
    const mockRawData = [
        {
            idAlunno: '1234567',
            idArgomento: '1001',
            data: '10/01/2026 00:00:00',
            idMat: '100',
            descMat: 'MATEMATICA',
            descArgomenti: 'Introduzione alle derivate',
            oreLezione: '1',
            data_pubblicazione: '10/01/2026 08:30:00',
            docente_nome: 'ROSSI MARIO',
            docente_nome_alias: 'ROSSI MARIO',
            fsTipoNota: 'Argomento',
            fsTestoNota: 'Introduzione alle derivate'
        },
        {
            idAlunno: '1234567',
            idArgomento: '1002',
            data: '10/01/2026 00:00:00',
            idMat: '101',
            descMat: 'FISICA',
            descArgomenti: 'Le leggi di Newton',
            oreLezione: '2-3',
            data_pubblicazione: '10/01/2026 09:15:00',
            docente_nome: 'BIANCHI LAURA',
            docente_nome_alias: 'BIANCHI LAURA',
            fsTipoNota: 'Argomento',
            fsTestoNota: 'Le leggi di Newton'
        },
        {
            idAlunno: '1234567',
            idArgomento: '1003',
            data: '11/01/2026 00:00:00',
            idMat: '102',
            descMat: 'ITALIANO',
            descArgomenti: 'Dante Alighieri: vita e opere',
            oreLezione: '1',
            data_pubblicazione: '11/01/2026 08:00:00',
            docente_nome: 'VERDI ANNA',
            docente_nome_alias: 'VERDI ANNA',
            fsTipoNota: 'Argomento',
            fsTestoNota: 'Dante Alighieri: vita e opere'
        }
    ];

    it('should return empty array when rawData is null', () => {
        const result = parseArgomenti(null);
        expect(result).toEqual([]);
    });

    it('should return empty array when rawData is empty', () => {
        const result = parseArgomenti([]);
        expect(result).toEqual([]);
    });

    it('should correctly parse and group arguments by date', () => {
        const result = parseArgomenti(mockRawData);

        expect(result).toHaveLength(2);
        
        // First group (10/01/2026)
        expect(result[0]).toHaveLength(2);
        expect(result[0][0]).toEqual({
            id: '1001',
            materia: 'MATEMATICA',
            argomento: 'Introduzione alle derivate',
            ore: ['1'],
            giorno: '10/01/2026',
            pubblicato: ['10/01/2026', '08:30:00']
        });
        expect(result[0][1]).toEqual({
            id: '1002',
            materia: 'FISICA',
            argomento: 'Le leggi di Newton',
            ore: ['2', '3'],
            giorno: '10/01/2026',
            pubblicato: ['10/01/2026', '09:15:00']
        });

        // Second group (11/01/2026)
        expect(result[1]).toHaveLength(1);
        expect(result[1][0]).toEqual({
            id: '1003',
            materia: 'ITALIANO',
            argomento: 'Dante Alighieri: vita e opere',
            ore: ['1'],
            giorno: '11/01/2026',
            pubblicato: ['11/01/2026', '08:00:00']
        });
    });

    it('should split lesson hours correctly', () => {
        const result = parseArgomenti(mockRawData);
        
        // Check single hour
        expect(result[0][0].ore).toEqual(['1']);
        
        // Check multiple hours
        expect(result[0][1].ore).toEqual(['2', '3']);
    });

    it('should extract date without time', () => {
        const result = parseArgomenti(mockRawData);
        
        expect(result[0][0].giorno).toBe('10/01/2026');
        expect(result[0][0].pubblicato[0]).toBe('10/01/2026');
        expect(result[0][0].pubblicato[1]).toBe('08:30:00');
    });

    it('should handle single item correctly', () => {
        const singleItem = [mockRawData[0]];
        const result = parseArgomenti(singleItem);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveLength(1);
        expect(result[0][0].id).toBe('1001');
    });
});
