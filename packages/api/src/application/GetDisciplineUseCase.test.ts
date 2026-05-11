import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDisciplineUseCase } from './GetDisciplineUseCase.js';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';

describe('GetDisciplineUseCase', () => {
    const mockDisciplineRepo = {
        findById: vi.fn(),
    } as unknown as DisciplineRepository;

    const mockDisciplineValidator = {
        validateReportedId: vi.fn(),
    } as unknown as DisciplineValidator;

    const useCase = new GetDisciplineUseCase(mockDisciplineRepo, mockDisciplineValidator);
    const disciplineId = '22222222-2222-4222-8222-222222222222';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe retornar una sancion existente', async () => {
        const mockDiscipline = { id: disciplineId, reason: 'Sancion' };
        vi.mocked(mockDisciplineRepo.findById).mockResolvedValueOnce(mockDiscipline as any);

        const result = await useCase.execute(disciplineId);

        expect(mockDisciplineValidator.validateReportedId).toHaveBeenCalledWith(disciplineId);
        expect(result).toEqual(mockDiscipline);
    });

    it('debe lanzar error si la sancion no existe', async () => {
        vi.mocked(mockDisciplineRepo.findById).mockResolvedValueOnce(null);

        await expect(useCase.execute(disciplineId)).rejects.toThrow('La sancion no existe');
    });
});
