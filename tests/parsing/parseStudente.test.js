import parseStudente from '@/parsing/parseStudente.js';

describe('parseStudente', () => {
    const mockRawData = {
        idAlunno: '1234567',
        userId: '7654321',
        cognome: 'ROSSI',
        nome: 'MARCO',
        sesso: 'M',
        dataNascita: '15/05/2010',
        avatar: 'https://example.com/avatars/marco_rossi.jpg',
        idPlesso: '101',
        security: 'ABC123XYZ',
        flagGiustifica: 'S',
        flagInvalsi: 'N',
        flagDocumenti: 'S',
        flagPagoScuola: 'N',
        flagConsiglioOrientamento: 'S'
    };

    it('should correctly parse student data', () => {
        const result = parseStudente(mockRawData);

        expect(result).toEqual({
            idAlunno: '1234567',
            id: '7654321',
            cognome: 'ROSSI',
            nome: 'MARCO',
            sesso: 'M',
            dataNascita: '15/05/2010',
            avatar: 'https://example.com/avatars/marco_rossi.jpg',
            idPlesso: '101',
            security: 'ABC123XYZ',
            flagGiustifica: true,
            flagInvalsi: false,
            flagDocumenti: true,
            flagPagoScuola: false,
            flagConsiglioOrientamento: true
        });
    });

    it('should convert flag fields to boolean', () => {
        const result = parseStudente(mockRawData);

        expect(result.flagGiustifica).toBe(true);
        expect(result.flagInvalsi).toBe(false);
        expect(result.flagDocumenti).toBe(true);
        expect(result.flagPagoScuola).toBe(false);
        expect(result.flagConsiglioOrientamento).toBe(true);
    });

    it('should preserve all non-flag fields', () => {
        const result = parseStudente(mockRawData);

        expect(result.idAlunno).toBe('1234567');
        expect(result.id).toBe('7654321');
        expect(result.cognome).toBe('ROSSI');
        expect(result.nome).toBe('MARCO');
        expect(result.sesso).toBe('M');
        expect(result.dataNascita).toBe('15/05/2010');
        expect(result.avatar).toBe('https://example.com/avatars/marco_rossi.jpg');
        expect(result.idPlesso).toBe('101');
        expect(result.security).toBe('ABC123XYZ');
    });

    it('should handle all flags as S (true)', () => {
        const allTrueData = {
            ...mockRawData,
            flagGiustifica: 'S',
            flagInvalsi: 'S',
            flagDocumenti: 'S',
            flagPagoScuola: 'S',
            flagConsiglioOrientamento: 'S'
        };
        
        const result = parseStudente(allTrueData);

        expect(result.flagGiustifica).toBe(true);
        expect(result.flagInvalsi).toBe(true);
        expect(result.flagDocumenti).toBe(true);
        expect(result.flagPagoScuola).toBe(true);
        expect(result.flagConsiglioOrientamento).toBe(true);
    });

    it('should handle all flags as N (false)', () => {
        const allFalseData = {
            ...mockRawData,
            flagGiustifica: 'N',
            flagInvalsi: 'N',
            flagDocumenti: 'N',
            flagPagoScuola: 'N',
            flagConsiglioOrientamento: 'N'
        };
        
        const result = parseStudente(allFalseData);

        expect(result.flagGiustifica).toBe(false);
        expect(result.flagInvalsi).toBe(false);
        expect(result.flagDocumenti).toBe(false);
        expect(result.flagPagoScuola).toBe(false);
        expect(result.flagConsiglioOrientamento).toBe(false);
    });

    it('should include all required fields', () => {
        const result = parseStudente(mockRawData);

        expect(result).toHaveProperty('idAlunno');
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('cognome');
        expect(result).toHaveProperty('nome');
        expect(result).toHaveProperty('sesso');
        expect(result).toHaveProperty('dataNascita');
        expect(result).toHaveProperty('avatar');
        expect(result).toHaveProperty('idPlesso');
        expect(result).toHaveProperty('security');
        expect(result).toHaveProperty('flagGiustifica');
        expect(result).toHaveProperty('flagInvalsi');
        expect(result).toHaveProperty('flagDocumenti');
        expect(result).toHaveProperty('flagPagoScuola');
        expect(result).toHaveProperty('flagConsiglioOrientamento');
    });

    it('should handle female student', () => {
        const femaleData = {
            ...mockRawData,
            cognome: 'BIANCHI',
            nome: 'LAURA',
            sesso: 'F'
        };
        
        const result = parseStudente(femaleData);

        expect(result.cognome).toBe('BIANCHI');
        expect(result.nome).toBe('LAURA');
        expect(result.sesso).toBe('F');
    });

    it('should handle empty avatar', () => {
        const noAvatarData = {
            ...mockRawData,
            avatar: ''
        };
        
        const result = parseStudente(noAvatarData);

        expect(result.avatar).toBe('');
    });

    it('should handle null data', () => {
        expect(() => parseStudente(null)).toThrow();
    });
});
