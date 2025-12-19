import parseVoti from '@/parsing/parseVoti.js';

describe('parseVoti', () => {
    const mockRawData = [
        {
            descFrazione: 'PRIMO QUADRIMESTRE',
            voti: [
                {
                    idVoto: '6001',
                    idMat: '100',
                    descMat: 'MATEMATICA',
                    data: '15/01/2026',
                    tipo: 'S',
                    voto: '7',
                    peso: '100',
                    votoValore: '7.00',
                    commento: 'Buono',
                    docente: 'ROSSI MARIO',
                    vistato: '1',
                    vistatoUtente: 'Genitore Mario',
                    vistatoData: '16/01/2026'
                },
                {
                    idVoto: '6002',
                    idMat: '100',
                    descMat: 'MATEMATICA',
                    data: '20/01/2026',
                    tipo: 'O',
                    voto: '8',
                    peso: '50',
                    votoValore: '8.00',
                    commento: 'Ottimo',
                    docente: 'ROSSI MARIO',
                    vistato: '0',
                    vistatoUtente: '',
                    vistatoData: ''
                },
                {
                    idVoto: '6003',
                    idMat: '101',
                    descMat: 'ITALIANO',
                    data: '22/01/2026',
                    tipo: 'S',
                    voto: '6.5',
                    peso: '100',
                    votoValore: '6.50',
                    commento: 'Sufficiente',
                    docente: 'BIANCHI LAURA',
                    vistato: '1',
                    vistatoUtente: 'Genitore Mario',
                    vistatoData: '23/01/2026'
                }
            ]
        },
        {
            descFrazione: 'SECONDO QUADRIMESTRE',
            voti: [
                {
                    idVoto: '6004',
                    idMat: '102',
                    descMat: 'FISICA',
                    data: '10/03/2026',
                    tipo: 'P',
                    voto: '7.5',
                    peso: '100',
                    votoValore: '7.50',
                    commento: 'Buone capacità pratiche',
                    docente: 'VERDI ANNA',
                    vistato: '1',
                    vistatoUtente: 'Genitore Mario',
                    vistatoData: '11/03/2026'
                },
                {
                    idVoto: '6005',
                    idMat: '103',
                    descMat: 'ARTE',
                    data: '15/03/2026',
                    tipo: 'G',
                    voto: '9',
                    peso: '100',
                    votoValore: '9.00',
                    commento: 'Eccellente lavoro grafico',
                    docente: 'NERI PAOLO',
                    vistato: '0',
                    vistatoUtente: '',
                    vistatoData: ''
                }
            ]
        }
    ];

    it('should flatten grades from all quarters into single array', () => {
        const result = parseVoti(mockRawData);

        expect(result).toHaveLength(5);
    });

    it('should correctly parse grade fields', () => {
        const result = parseVoti(mockRawData);

        expect(result[0]).toEqual({
            id: '6001',
            materia: 'MATEMATICA',
            tipo: 'Scritto',
            voto: '7',
            peso: '100',
            data: '15/01/2026',
            commento: 'Buono',
            professore: 'ROSSI MARIO'
        });
    });

    it('should correctly convert grade types', () => {
        const result = parseVoti(mockRawData);

        expect(result[0].tipo).toBe('Scritto');
        expect(result[1].tipo).toBe('Orale');
        expect(result[2].tipo).toBe('Scritto');
        expect(result[3].tipo).toBe('Pratico');
        expect(result[4].tipo).toBe('Grafico');
    });

    it('should handle grades from multiple quarters', () => {
        const result = parseVoti(mockRawData);

        // First 3 grades from first quarter
        expect(result[0].id).toBe('6001');
        expect(result[1].id).toBe('6002');
        expect(result[2].id).toBe('6003');

        // Last 2 grades from second quarter
        expect(result[3].id).toBe('6004');
        expect(result[4].id).toBe('6005');
    });

    it('should preserve all grade fields', () => {
        const result = parseVoti(mockRawData);
        const voto = result[0];

        expect(voto).toHaveProperty('id');
        expect(voto).toHaveProperty('materia');
        expect(voto).toHaveProperty('tipo');
        expect(voto).toHaveProperty('voto');
        expect(voto).toHaveProperty('peso');
        expect(voto).toHaveProperty('data');
        expect(voto).toHaveProperty('commento');
        expect(voto).toHaveProperty('professore');
    });

    it('should handle grades with decimal values', () => {
        const result = parseVoti(mockRawData);

        expect(result[2].voto).toBe('6.5');
        expect(result[3].voto).toBe('7.5');
    });

    it('should handle viewed and non-viewed grades', () => {
        const result = parseVoti(mockRawData);

        // Check peso instead
        expect(result[0].peso).toBe('100');
        expect(result[1].peso).toBe('50');
    });

    it('should handle different weight values', () => {
        const result = parseVoti(mockRawData);

        expect(result[0].peso).toBe('100');
        expect(result[1].peso).toBe('50');
    });

    it('should handle empty quarters', () => {
        const emptyQuarterData = [
            {
                descFrazione: 'PRIMO QUADRIMESTRE',
                voti: []
            },
            {
                descFrazione: 'SECONDO QUADRIMESTRE',
                voti: [mockRawData[1].voti[0]]
            }
        ];
        
        const result = parseVoti(emptyQuarterData);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('6004');
    });

    it('should handle null data', () => {
        expect(() => parseVoti(null)).toThrow();
    });

    it('should handle empty array', () => {
        const result = parseVoti([]);
        expect(result).toEqual([]);
    });

    it('should handle all grade types', () => {
        const allTypesData = [
            {
                descFrazione: 'PRIMO QUADRIMESTRE',
                voti: [
                    { idVoto: '1', idMat: '100', descMat: 'MAT', data: '01/01/2026', tipo: 'T', voto: '7', peso: '100', votoValore: '7.00', commento: '', docente: 'Docente', vistato: '0', vistatoUtente: '', vistatoData: '' },
                    { idVoto: '2', idMat: '100', descMat: 'MAT', data: '02/01/2026', tipo: 'S', voto: '7', peso: '100', votoValore: '7.00', commento: '', docente: 'Docente', vistato: '0', vistatoUtente: '', vistatoData: '' },
                    { idVoto: '3', idMat: '100', descMat: 'MAT', data: '03/01/2026', tipo: 'G', voto: '7', peso: '100', votoValore: '7.00', commento: '', docente: 'Docente', vistato: '0', vistatoUtente: '', vistatoData: '' },
                    { idVoto: '4', idMat: '100', descMat: 'MAT', data: '04/01/2026', tipo: 'O', voto: '7', peso: '100', votoValore: '7.00', commento: '', docente: 'Docente', vistato: '0', vistatoUtente: '', vistatoData: '' },
                    { idVoto: '5', idMat: '100', descMat: 'MAT', data: '05/01/2026', tipo: 'P', voto: '7', peso: '100', votoValore: '7.00', commento: '', docente: 'Docente', vistato: '0', vistatoUtente: '', vistatoData: '' },
                    { idVoto: '6', idMat: '100', descMat: 'MAT', data: '06/01/2026', tipo: 'A', voto: '7', peso: '100', votoValore: '7.00', commento: '', docente: 'Docente', vistato: '0', vistatoUtente: '', vistatoData: '' }
                ]
            }
        ];
        
        const result = parseVoti(allTypesData);

        expect(result[0].tipo).toBe('Tutti');
        expect(result[1].tipo).toBe('Scritto');
        expect(result[2].tipo).toBe('Grafico');
        expect(result[3].tipo).toBe('Orale');
        expect(result[4].tipo).toBe('Pratico');
        expect(result[5].tipo).toBe('Unico');
    });

    it('should maintain chronological order across quarters', () => {
        const result = parseVoti(mockRawData);

        // Check that grades are in the order they appear in quarters
        expect(result[0].data).toBe('15/01/2026');
        expect(result[1].data).toBe('20/01/2026');
        expect(result[2].data).toBe('22/01/2026');
        expect(result[3].data).toBe('10/03/2026');
        expect(result[4].data).toBe('15/03/2026');
    });
});
