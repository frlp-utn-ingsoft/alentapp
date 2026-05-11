import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateDisciplineUseCase } from './UpdateDisciplineUseCase.js';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';
import { DisciplineDTO, UpdateDisciplineRequest } from '@alentapp/shared';

describe('UpdateDisciplineUseCase', () => {
    const mockDisciplineRepo = {
        findById: vi.fn(),
        update: vi.fn(),
    } as unknown as DisciplineRepository;

    const mockDisciplineValidator = {
        validateDisciplineId: vi.fn(),
        validateReason: vi.fn(),
        validateDates: vi.fn(),
        validateTotalSuspension: vi.fn(),
    } as unknown as DisciplineValidator;

    const useCase = new UpdateDisciplineUseCase(mockDisciplineRepo, mockDisciplineValidator);

    const disciplineId = '22222222-2222-4222-8222-222222222222';
    const existingDiscipline: DisciplineDTO = {
        id: disciplineId,
        reason: 'Original',
        startDate: '2026-05-01T00:00:00.000Z',
        endDate: '2026-06-01T00:00:00.000Z',
        isTotalSuspension: true,
        memberId: '11111111-1111-4111-8111-111111111111',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(mockDisciplineRepo.findById).mockResolvedValue(existingDiscipline);
    });

    it('debe lanzar error si la sancion no existe', async () => {
        vi.mocked(mockDisciplineRepo.findById).mockResolvedValueOnce(null);

        await expect(useCase.execute(disciplineId, {})).rejects.toThrow('La sancion no existe');
        expect(mockDisciplineRepo.update).not.toHaveBeenCalled();
    });

    it('debe validar la sancion resultante y actualizar los datos enviados', async () => {
        const updateData: UpdateDisciplineRequest = {
            reason: 'Actualizada',
            endDate: '2026-07-01T00:00:00.000Z',
            isTotalSuspension: false,
        };
        vi.mocked(mockDisciplineRepo.update).mockResolvedValueOnce({ ...existingDiscipline, ...updateData });

        const result = await useCase.execute(disciplineId, updateData);

        expect(mockDisciplineValidator.validateDisciplineId).toHaveBeenCalledWith(disciplineId);
        expect(mockDisciplineValidator.validateReason).toHaveBeenCalledWith('Actualizada');
        expect(mockDisciplineValidator.validateDates).toHaveBeenCalledWith(
            existingDiscipline.startDate,
            '2026-07-01T00:00:00.000Z',
        );
        expect(mockDisciplineValidator.validateTotalSuspension).toHaveBeenCalledWith(false);
        expect(mockDisciplineRepo.update).toHaveBeenCalledWith(disciplineId, updateData);
        expect(result.reason).toBe('Actualizada');
    });
});
