import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteSportUseCase } from './DeleteSportUseCase.js';
import { SportRepository } from '../domain/SportRepository.js';

describe('DeleteSportUseCase', () => {
    const mockSportRepo = {
        findActiveById: vi.fn(),
        softDelete: vi.fn(),
    } as unknown as SportRepository;

    const useCase = new DeleteSportUseCase(mockSportRepo);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe realizar borrado lógico exitosamente', async () => {
        vi.mocked(mockSportRepo.findActiveById).mockResolvedValueOnce({
            id: 'uuid-1',
            name: 'Fútbol 11',
            description: null,
            max_capacity: 22,
            additional_price: 0,
            requires_medical_certificate: false,
            deleted_at: null,
        });

        await useCase.execute('uuid-1');

        expect(mockSportRepo.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('debe rechazar si el deporte no existe o ya fue eliminado', async () => {
        vi.mocked(mockSportRepo.findActiveById).mockResolvedValueOnce(null);

        await expect(useCase.execute('uuid-inexistente')).rejects.toThrow(
            'No existe un deporte con ese ID'
        );

        expect(mockSportRepo.softDelete).not.toHaveBeenCalled();
    });
});
