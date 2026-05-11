import { describe, it, expect } from 'vitest';
import { DisciplineValidator } from './DisciplineValidator.js';

describe('DisciplineValidator', () => {
    const validator = new DisciplineValidator();

    it('debe validar que el motivo no este vacio', () => {
        expect(() => validator.validateReason('')).toThrow('El motivo de la sancion es obligatorio');
        expect(() => validator.validateReason('   ')).toThrow('El motivo de la sancion es obligatorio');
    });

    it('debe validar que los campos requeridos existan', () => {
        expect(() => validator.validateRequiredFields(undefined)).toThrow('Faltan campos requeridos');
        expect(() => validator.validateRequiredFields({ reason: 'Sancion' })).toThrow('Faltan campos requeridos');
        expect(() => validator.validateRequiredFields({
            reason: 'Sancion',
            startDate: '2026-05-01',
            endDate: '2026-06-01',
            isTotalSuspension: undefined,
            memberId: '11111111-1111-4111-8111-111111111111',
        })).toThrow('Faltan campos requeridos');
    });

    it('debe dejar que el motivo vacio sea validado por la regla de motivo', () => {
        expect(() => validator.validateRequiredFields({
            reason: '',
            startDate: '2026-05-01',
            endDate: '2026-06-01',
            isTotalSuspension: false,
            memberId: '11111111-1111-4111-8111-111111111111',
        })).not.toThrow();
    });

    it('debe validar que las fechas sean validas y consistentes', () => {
        expect(() => validator.validateDates('fecha', '2026-06-01')).toThrow('Las fechas ingresadas no son validas');
        expect(() => validator.validateDates('2026-02-31', '2026-06-01')).toThrow(
            'Las fechas ingresadas no son validas',
        );
        expect(() => validator.validateDates('2026-06-01', '2026-06-01')).toThrow(
            'La fecha de fin debe ser posterior a la de inicio',
        );
    });

    it('debe validar ids uuid de sancion', () => {
        expect(() => validator.validateDisciplineId('no-valido')).toThrow('El id de la sancion no es valido');
    });

    it('debe validar que suspension total sea booleana', () => {
        expect(() => validator.validateTotalSuspension(false)).not.toThrow();
        expect(() => validator.validateTotalSuspension(null)).toThrow('Faltan campos requeridos');
    });
});
