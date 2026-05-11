import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteDisciplineUseCase } from './DeleteDisciplineUseCase.js';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';

describe('DeleteDisciplineUseCase', () => {
    const mockDisciplineRepo = {
        findById: vi.fn(),
        delete: vi.fn(),
    } as unknown as DisciplineRepository;

    const mockDisciplineValidator = {
        validateDisciplineId: vi.fn(),
    } as unknown as DisciplineValidator;

    const useCase = new DeleteDisciplineUseCase(mockDisciplineRepo, mockDisciplineValidator);
    const disciplineId = '22222222-2222-4222-8222-222222222222';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe lanzar error si la sancion no existe', async () => {
        vi.mocked(mockDisciplineRepo.findById).mockResolvedValueOnce(null);

        await expect(useCase.execute(disciplineId)).rejects.toThrow('La sancion no existe');
        expect(mockDisciplineRepo.delete).not.toHaveBeenCalled();
    });

    it('debe eliminar la sancion si existe', async () => {
        vi.mocked(mockDisciplineRepo.findById).mockResolvedValueOnce({ id: disciplineId } as any);

        await useCase.execute(disciplineId);

        expect(mockDisciplineValidator.validateDisciplineId).toHaveBeenCalledWith(disciplineId);
        expect(mockDisciplineRepo.delete).toHaveBeenCalledWith(disciplineId);
    });
});
