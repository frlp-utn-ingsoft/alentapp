import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PaymentValidator } from './PaymentValidator.js';
import { MemberRepository } from '../MemberRepository.js';

describe('PaymentValidator', () => {
    const mockMemberRepo = {
        findById: vi.fn(),
    } as unknown as MemberRepository;

    const validator = new PaymentValidator(mockMemberRepo);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe validar exitosamente cuando todos los datos son válidos', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({
            id: 'member-123',
            dni: '12345678',
            name: 'John Doe',
            email: 'john@example.com',
            birthdate: '1990-01-01',
            category: 'Pleno',
            status: 'Activo',
            created_at: new Date().toISOString(),
        });

        await expect(validator.validateAll({
            member_id: 'member-123',
            amount: 5000,
            month: 5,
            year: 2026
        })).resolves.not.toThrow();
    });

    it('debe rechazar un socio inexistente', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce(null);

        await expect(validator.validateMemberExists('member-nonexistent')).rejects.toThrow(
            'Error: El socio especificado no existe'
        );
    });

    it('debe rechazar un monto menor o igual a cero', () => {
        expect(() => validator.validateAmount(0)).toThrow('Error: El monto debe ser mayor a cero');
        expect(() => validator.validateAmount(-150)).toThrow('Error: El monto debe ser mayor a cero');
    });

    it('debe rechazar un mes inválido', () => {
        expect(() => validator.validateMonth(0)).toThrow('Error: Mes inválido. Debe estar entre 1 y 12');
        expect(() => validator.validateMonth(13)).toThrow('Error: Mes inválido. Debe estar entre 1 y 12');
    });

    it('debe rechazar un año inválido', () => {
        expect(() => validator.validateYear(1899)).toThrow('Error: Año inválido. Debe estar entre 1900 y 2100');
        expect(() => validator.validateYear(2101)).toThrow('Error: Año inválido. Debe estar entre 1900 y 2100');
    });
});
