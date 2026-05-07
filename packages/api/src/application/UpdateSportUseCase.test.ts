import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateSportUseCase } from './UpdateSportUseCase.js';
import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';

describe('UpdateSportUseCase', () => {
    const mockSportRepo = {
        findActiveById: vi.fn(),
        update: vi.fn(),
    } as unknown as SportRepository;

    const mockSportValidator = {
        validateNameNotInPayload: vi.fn(),
        validateMaxCapacity: vi.fn(),
        validateAdditionalPrice: vi.fn(),
    } as unknown as SportValidator;

    const useCase = new UpdateSportUseCase(mockSportRepo, mockSportValidator);

    const existingSport = {
        id: 'uuid-1',
        name: 'Fútbol 11',
        description: 'Fútbol de cancha grande',
        max_capacity: 22,
        additional_price: 1500,
        requires_medical_certificate: true,
        deleted_at: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe actualizar un deporte exitosamente sin cambiar el nombre', async () => {
        vi.mocked(mockSportRepo.findActiveById).mockResolvedValueOnce(existingSport);
        vi.mocked(mockSportRepo.update).mockResolvedValueOnce({
            ...existingSport,
            max_capacity: 30,
            description: 'Descripción actualizada',
        });

        const result = await useCase.execute('uuid-1', { max_capacity: 30, description: 'Descripción actualizada' });

        expect(mockSportValidator.validateNameNotInPayload).toHaveBeenCalled();
        expect(mockSportValidator.validateMaxCapacity).toHaveBeenCalledWith(30);
        expect(result.max_capacity).toBe(30);
    });

    it('debe rechazar si intentan modificar el nombre', async () => {
        vi.mocked(mockSportRepo.findActiveById).mockResolvedValueOnce(existingSport);
        vi.mocked(mockSportValidator.validateNameNotInPayload).mockImplementation(() => {
            throw new Error('El nombre del deporte no puede modificarse');
        });

        await expect(useCase.execute('uuid-1', { name: 'Otro', max_capacity: 30 } as any)).rejects.toThrow(
            'El nombre del deporte no puede modificarse'
        );
    });

    it('debe rechazar si el deporte no existe', async () => {
        vi.mocked(mockSportRepo.findActiveById).mockResolvedValueOnce(null);

        await expect(useCase.execute('uuid-inexistente', { max_capacity: 30 })).rejects.toThrow(
            'No existe un deporte con ese ID'
        );
    });

    it('debe rechazar si no hay campos para actualizar', async () => {
        vi.mocked(mockSportRepo.findActiveById).mockResolvedValueOnce(existingSport);
        vi.mocked(mockSportValidator.validateNameNotInPayload).mockImplementation(() => {
            // {} no contiene 'name', así que no lanza error
        });

        await expect(useCase.execute('uuid-1', {} as any)).rejects.toThrow(
            'No hay datos para actualizar'
        );
    });
});
