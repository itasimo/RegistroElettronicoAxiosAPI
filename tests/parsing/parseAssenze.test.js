import parseAssenze from '@/parsing/parseAssenze.js';

describe('parseAssenze', () => {
    const mockRawData = [
        {
            descFrazione: 'PRIMO QUADRIMESTRE',
            assenze: [
                {
                    id: '1001',
                    data: '15/01/2026',
                    tipo: 'A',
                    oralez: '',
                    ora: '',
                    motivo: 'Influenza',
                    calcolata: '1',
                    giustificabile: '1',
                    tipogiust: '1',
                    datagiust: '16/01/2026'
                },
                {
                    id: '1002',
                    data: '16/01/2026',
                    tipo: 'R',
                    oralez: '1',
                    ora: '08:15:00',
                    motivo: 'Trasporti',
                    calcolata: '1',
                    giustificabile: '1',
                    tipogiust: '2',
                    datagiust: '17/01/2026'
                },
                {
                    id: '1003',
                    data: '17/01/2026',
                    tipo: 'U',
                    oralez: '5',
                    ora: '12:15:00',
                    motivo: 'Visita medica',
                    calcolata: '0',
                    giustificabile: '1',
                    tipogiust: '1',
                    datagiust: '18/01/2026'
                }
            ]
        },
        {
            descFrazione: 'SECONDO QUADRIMESTRE',
            assenze: [
                {
                    id: '1004',
                    data: '10/03/2026',
                    tipo: 'A',
                    oralez: '',
                    ora: '',
                    motivo: 'Malattia',
                    calcolata: '1',
                    giustificabile: '1',
                    tipogiust: '0',
                    datagiust: ''
                }
            ]
        }
    ];

    it('should correctly parse absences for multiple quarters', () => {
        const result = parseAssenze(mockRawData);

        expect(result).toHaveLength(2);
        expect(result[0].quadrimestre).toBe('PRIMO QUADRIMESTRE');
        expect(result[0].assenze).toHaveLength(3);
        expect(result[1].quadrimestre).toBe('SECONDO QUADRIMESTRE');
        expect(result[1].assenze).toHaveLength(1);
    });

    it('should correctly map absence types', () => {
        const result = parseAssenze(mockRawData);

        expect(result[0].assenze[0].tipo).toBe('Assenza');
        expect(result[0].assenze[1].tipo).toBe('Ritardo');
        expect(result[0].assenze[2].tipo).toBe('Uscita anticipata');
    });

    it('should correctly convert boolean fields', () => {
        const result = parseAssenze(mockRawData);

        expect(result[0].assenze[0].calcolata).toBe(true);
        expect(result[0].assenze[0].giustificabile).toBe(true);
        expect(result[0].assenze[0].giustificata).toBe(true);
        expect(result[1].assenze[0].giustificata).toBe(false);
    });

    it('should correctly map justification types', () => {
        const result = parseAssenze(mockRawData);

        expect(result[0].assenze[0].giustificataDa).toBe('Genitore/Tutore');
        expect(result[0].assenze[1].giustificataDa).toBe('Docente');
        expect(result[1].assenze[0].giustificataDa).toBe('0');
    });

    it('should correctly handle lesson hour and time for delays and early exits', () => {
        const result = parseAssenze(mockRawData);

        // Absence - no hour info
        expect(result[0].assenze[0].ora).toBe('');
        expect(result[0].assenze[0].orario).toBe('');

        // Delay - has hour info
        expect(result[0].assenze[1].ora).toBe('1');
        expect(result[0].assenze[1].orario).toBe('08:15');

        // Early exit - has hour info
        expect(result[0].assenze[2].ora).toBe('5');
        expect(result[0].assenze[2].orario).toBe('12:15');
    });

    it('should include all required fields', () => {
        const result = parseAssenze(mockRawData);
        const absence = result[0].assenze[0];

        expect(absence).toHaveProperty('id');
        expect(absence).toHaveProperty('data');
        expect(absence).toHaveProperty('tipo');
        expect(absence).toHaveProperty('ora');
        expect(absence).toHaveProperty('orario');
        expect(absence).toHaveProperty('motivo');
        expect(absence).toHaveProperty('calcolata');
        expect(absence).toHaveProperty('giustificabile');
        expect(absence).toHaveProperty('giustificata');
        expect(absence).toHaveProperty('giustificataDa');
        expect(absence).toHaveProperty('giustficataData');
    });
});
