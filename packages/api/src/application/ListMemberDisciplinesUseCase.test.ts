import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListMemberDisciplinesUseCase } from './ListMemberDisciplinesUseCase.js';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';

describe('ListMemberDisciplinesUseCase', () => {
    const mockDisciplineRepo = {
        findByMemberId: vi.fn(),
    } as unknown as DisciplineRepository;

    const mockMemberRepo = {
        findById: vi.fn(),
    } as unknown as MemberRepository;

    const useCase = new ListMemberDisciplinesUseCase(mockDisciplineRepo, mockMemberRepo);
    const memberId = '11111111-1111-4111-8111-111111111111';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe listar las sanciones de un socio existente', async () => {
        const mockDisciplines = [{ id: '22222222-2222-4222-8222-222222222222', reason: 'Sancion' }];
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({ id: memberId } as any);
        vi.mocked(mockDisciplineRepo.findByMemberId).mockResolvedValueOnce(mockDisciplines as any);

        const result = await useCase.execute(memberId);

        expect(result).toEqual(mockDisciplines);
        expect(mockDisciplineRepo.findByMemberId).toHaveBeenCalledWith(memberId);
    });

    it('debe lanzar error si el socio no existe', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce(null);

        await expect(useCase.execute(memberId)).rejects.toThrow('El socio especificado no existe');
    });
});
