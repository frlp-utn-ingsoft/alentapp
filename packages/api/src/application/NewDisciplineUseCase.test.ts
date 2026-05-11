import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateDisciplineUseCase } from './NewDisciplineUseCase.js';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';
import { CreateDisciplineRequest } from '@alentapp/shared';

describe('CreateDisciplineUseCase', () => {
    const mockDisciplineRepo = {
        create: vi.fn(),
    } as unknown as DisciplineRepository;

    const mockMemberRepo = {
        findById: vi.fn(),
    } as unknown as MemberRepository;

    const mockDisciplineValidator = {
        validateRequiredFields: vi.fn(),
        validateReason: vi.fn(),
        validateDates: vi.fn(),
    } as unknown as DisciplineValidator;

    const useCase = new CreateDisciplineUseCase(mockDisciplineRepo, mockMemberRepo, mockDisciplineValidator);

    const mockRequest: CreateDisciplineRequest = {
        reason: 'Conducta antideportiva',
        startDate: '2026-05-01T00:00:00.000Z',
        endDate: '2026-06-01T00:00:00.000Z',
        isTotalSuspension: true,
        memberId: '11111111-1111-4111-8111-111111111111',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe crear una sancion si los datos son validos y el socio existe', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({ id: mockRequest.memberId } as any);
        vi.mocked(mockDisciplineRepo.create).mockResolvedValueOnce({
            id: '22222222-2222-4222-8222-222222222222',
            ...mockRequest,
        });

        const result = await useCase.execute(mockRequest);

        expect(mockDisciplineValidator.validateRequiredFields).toHaveBeenCalledWith(mockRequest);
        expect(mockDisciplineValidator.validateReason).toHaveBeenCalledWith(mockRequest.reason);
        expect(mockDisciplineValidator.validateDates).toHaveBeenCalledWith(mockRequest.startDate, mockRequest.endDate);
        expect(mockMemberRepo.findById).toHaveBeenCalledWith(mockRequest.memberId);
        expect(mockDisciplineRepo.create).toHaveBeenCalledWith(mockRequest);
        expect(result.reason).toBe('Conducta antideportiva');
    });

    it('debe lanzar error si el socio no existe', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce(null);

        await expect(useCase.execute(mockRequest)).rejects.toThrow('El socio especificado no existe');
        expect(mockDisciplineRepo.create).not.toHaveBeenCalled();
    });
});
