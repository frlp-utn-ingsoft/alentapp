import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetMemberDisciplineStatusUseCase } from './GetMemberDisciplineStatusUseCase.js';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';

describe('GetMemberDisciplineStatusUseCase', () => {
    const mockDisciplineRepo = {
        findActiveTotalSuspensionByMemberId: vi.fn(),
    } as unknown as DisciplineRepository;

    const mockMemberRepo = {
        findById: vi.fn(),
    } as unknown as MemberRepository;

    const useCase = new GetMemberDisciplineStatusUseCase(mockDisciplineRepo, mockMemberRepo);
    const memberId = '11111111-1111-4111-8111-111111111111';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe retornar isSuspended false si no hay suspension activa', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({ id: memberId } as any);
        vi.mocked(mockDisciplineRepo.findActiveTotalSuspensionByMemberId).mockResolvedValueOnce(null);

        const result = await useCase.execute(memberId);

        expect(result).toEqual({ memberId, isSuspended: false });
        expect(mockDisciplineRepo.findActiveTotalSuspensionByMemberId).toHaveBeenCalledWith(memberId, expect.any(Date));
    });

    it('debe retornar la suspension activa si existe', async () => {
        const activeTotalSuspension = { id: '22222222-2222-4222-8222-222222222222', memberId };
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({ id: memberId } as any);
        vi.mocked(mockDisciplineRepo.findActiveTotalSuspensionByMemberId)
            .mockResolvedValueOnce(activeTotalSuspension as any);

        const result = await useCase.execute(memberId);

        expect(result).toEqual({ memberId, isSuspended: true, activeTotalSuspension });
    });

    it('debe lanzar error si el socio no existe', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce(null);

        await expect(useCase.execute(memberId)).rejects.toThrow('El socio especificado no existe');
    });
});
