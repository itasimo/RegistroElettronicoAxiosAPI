import parseComunicazioni from '@/parsing/parseComunicazioni.js';

describe('parseComunicazioni', () => {
    const alunnoID = '1234567';

    const mockRawData = [
        {
            id: '3001',
            data: '10/01/2026 08:30:00',
            titolo: 'Riunione genitori',
            ownerName: 'Scuola',
            desc: '<p>Si comunica che il giorno <b>15/01/2026</b> si terrà la riunione con i genitori.</p>',
            tipo: '4',
            allegati: [
                {
                    sourceName: 'Calendario.pdf',
                    desc: 'Calendario delle attività',
                    URL: 'https://example.com/files/calendario.pdf'
                }
            ],
            letta: 'S',
            opzioni: 'Presa visione|Firma per accettazione',
            tipo_risposta: '1'
        },
        {
            id: '3002',
            data: '12/01/2026 10:00:00',
            titolo: 'Circolare 15',
            ownerName: 'Dirigente',
            desc: 'Nuove disposizioni per la sicurezza.',
            tipo: '1',
            allegati: [],
            letta: 'N',
            opzioni: '',
            tipo_risposta: '0'
        },
        {
            id: '3003',
            data: '15/01/2026 14:00:00',
            titolo: 'Comunicazione importante',
            ownerName: 'Segreteria',
            desc: '<p>Si ricorda di portare il documento <i>firmato</i>.</p>',
            tipo: '5',
            allegati: [
                {
                    nome: 'Modulo1.pdf',
                    desc: 'Modulo autorizzazione',
                    downloadLink: 'https://example.com/files/modulo1.pdf'
                },
                {
                    nome: 'Modulo2.pdf',
                    desc: 'Modulo privacy',
                    downloadLink: 'https://example.com/files/modulo2.pdf'
                }
            ],
            letta: 'S',
            opzioni: 'Firma|Accettazione',
            tipo_risposta: '1'
        }
    ];

    it('should correctly parse communications', () => {
        const result = parseComunicazioni(mockRawData, alunnoID);

        expect(result).toHaveLength(3);
        expect(result[0].id).toBe('3001');
        expect(result[1].id).toBe('3002');
        expect(result[2].id).toBe('3003');
    });

    it('should correctly map communication types', () => {
        const result = parseComunicazioni(mockRawData, alunnoID);

        expect(result[0].tipo).toBe('Scuola/Famiglia');
        expect(result[1].tipo).toBe('Circolare');
        expect(result[2].tipo).toBe('Comunicazione');
    });

    it('should remove HTML tags from description', () => {
        const result = parseComunicazioni(mockRawData, alunnoID);

        expect(result[0].testo).toBe('Si comunica che il giorno 15/01/2026 si terrà la riunione con i genitori.');
        expect(result[2].testo).toBe('Si ricorda di portare il documento firmato.');
    });

    it('should correctly parse attachments', () => {
        const result = parseComunicazioni(mockRawData, alunnoID);

        expect(result[0].allegati).toHaveLength(1);
        expect(result[0].allegati[0]).toEqual({
            nome: 'Calendario.pdf',
            desc: 'Calendario delle attività',
            downloadLink: 'https://example.com/files/calendario.pdf'
        });

        expect(result[1].allegati).toHaveLength(0);

        expect(result[2].allegati).toHaveLength(2);
    });

    it('should correctly parse read status', () => {
        const result = parseComunicazioni(mockRawData, alunnoID);

        expect(result[0].letta).toBe(true);
        expect(result[1].letta).toBe(false);
        expect(result[2].letta).toBe(true);
    });

    it('should correctly parse options', () => {
        const result = parseComunicazioni(mockRawData, alunnoID);

        expect(result[0].opzioniRisposta).toEqual(['Presa visione', 'Firma per accettazione']);
        expect(result[1].opzioniRisposta).toEqual(['']);
        expect(result[2].opzioniRisposta).toEqual(['Firma', 'Accettazione']);
    });

    it('should include alunnoID in each communication', () => {
        const result = parseComunicazioni(mockRawData, alunnoID);

        expect(result[0].idAlunno).toBe('1234567');
        expect(result[1].idAlunno).toBe('1234567');
        expect(result[2].idAlunno).toBe('1234567');
    });

    it('should include all required fields', () => {
        const result = parseComunicazioni(mockRawData, alunnoID);
        const comunicazione = result[0];

        expect(comunicazione).toHaveProperty('id');
        expect(comunicazione).toHaveProperty('data');
        expect(comunicazione).toHaveProperty('titolo');
        expect(comunicazione).toHaveProperty('testo');
        expect(comunicazione).toHaveProperty('tipo');
        expect(comunicazione).toHaveProperty('allegati');
        expect(comunicazione).toHaveProperty('letta');
        expect(comunicazione).toHaveProperty('opzioniRisposta');
        expect(comunicazione).toHaveProperty('idAlunno');
        expect(comunicazione).toHaveProperty('prevedeRisposta');
    });

    it('should handle empty data', () => {
        const result = parseComunicazioni([], alunnoID);
        expect(result).toEqual([]);
    });

    it('should handle null data', () => {
        expect(() => parseComunicazioni(null, '1234567')).toThrow();
    });
});
