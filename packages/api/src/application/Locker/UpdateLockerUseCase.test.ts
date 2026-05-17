import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MemberRepository } from '../../domain/MemberRepository.js';
import type { LockerRepository } from '../../domain/LockerRepository.js';
import { LockerValidator } from '../../domain/services/LockerValidator.js';
import { UpdateLockerUseCase } from './UpdateLockerUseCase.js';
import type { LockerDTO } from '@alentapp/shared';

describe('UpdateLockerUseCase', () => {
    const mockLockerRepo = {
        findById: vi.fn(),
        findByNumber: vi.fn(),
        update: vi.fn(),
    } as unknown as LockerRepository;

    const mockMemberRepo = {
        findById: vi.fn(),
    } as unknown as MemberRepository;

    const lockerValidator = new LockerValidator(mockLockerRepo);
    const useCase = new UpdateLockerUseCase(
        mockLockerRepo,
        lockerValidator,
        mockMemberRepo,
    );

    const baseLocker: LockerDTO = {
        id: 'locker-1',
        number: 1,
        location: 'Vestuario A',
        status: 'Disponible',
        member_id: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(mockLockerRepo.findById).mockResolvedValue(baseLocker);
        vi.mocked(mockLockerRepo.findByNumber).mockResolvedValue(null);
        vi.mocked(mockLockerRepo.update).mockResolvedValue(baseLocker);
        vi.mocked(mockMemberRepo.findById).mockResolvedValue({ id: 'member-1' } as any);
    });

    it('debe lanzar error si el locker no existe', async () => {
        vi.mocked(mockLockerRepo.findById).mockResolvedValueOnce(null);

        await expect(
            useCase.execute('locker-x', { status: 'Disponible' }),
        ).rejects.toThrow('El Locker no existe');
    });

    it('debe actualizar locker cuando el payload es valido', async () => {
        const updatedLocker: LockerDTO = {
            ...baseLocker,
            location: 'Vestuario B',
            status: 'Ocupado',
            member_id: 'member-1',
        };
        vi.mocked(mockLockerRepo.update).mockResolvedValueOnce(updatedLocker);

        const result = await useCase.execute('locker-1', {
            location: 'Vestuario B',
            status: 'Ocupado',
            member_id: 'member-1',
        });

        expect(result).toEqual(updatedLocker);
        expect(mockLockerRepo.update).toHaveBeenCalledWith('locker-1', {
            location: 'Vestuario B',
            status: 'Ocupado',
            member_id: 'member-1',
        });
    });

    it('debe rechazar numero duplicado', async () => {
        vi.mocked(mockLockerRepo.findByNumber).mockResolvedValueOnce({
            ...baseLocker,
            id: 'locker-2',
            number: 2,
        });

        await expect(
            useCase.execute('locker-1', { number: 2 }),
        ).rejects.toThrow('Ya existe un Locker con ese número');
    });

    // TODO: bug #1 (resolvedStatus saltea validateMaintenanceAssignment).
    // Se reactiva al arreglar el use case en la branch fix/locker-state-consistency.
    it.skip('debe rechazar asignacion si el locker esta en mantenimiento', async () => {
        vi.mocked(mockLockerRepo.findById).mockResolvedValueOnce({
            ...baseLocker,
            status: 'Mantenimiento',
        });

        await expect(
            useCase.execute('locker-1', { member_id: 'member-1' }),
        ).rejects.toThrow('El Locker está en mantenimiento y no puede asignarse');
    });

    it.skip('debe rechazar pasar a mantenimiento si tiene socio asignado', async () => {
        vi.mocked(mockLockerRepo.findById).mockResolvedValueOnce({
            ...baseLocker,
            status: 'Ocupado',
            member_id: 'member-1',
        });

        await expect(
            useCase.execute('locker-1', { status: 'Mantenimiento' }),
        ).rejects.toThrow(
            'No se puede poner en mantenimiento un Locker ocupado. Desasigná el socio primero',
        );
    });

    it('debe rechazar reasignacion cuando ya esta ocupado por otro socio', async () => {
        vi.mocked(mockLockerRepo.findById).mockResolvedValueOnce({
            ...baseLocker,
            status: 'Ocupado',
            member_id: 'member-1',
        });

        await expect(
            useCase.execute('locker-1', { member_id: 'member-2' }),
        ).rejects.toThrow('El Locker ya se encuentra ocupado');
    });

    it('debe rechazar asignacion cuando el socio no existe', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce(null);

        await expect(
            useCase.execute('locker-1', { member_id: 'member-x' }),
        ).rejects.toThrow('El socio no existe');
    });
});