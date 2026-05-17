import { LockerDTO } from '@alentapp/shared';
import { LockerRepository } from '../LockerRepository.js';

export class LockerValidator {
    constructor(private readonly lockerRepo: LockerRepository) {}

    validateUpdatePayload(data: object): void {
        if (!data || Object.keys(data).length === 0) {
            throw new Error('Debe informar al menos un campo para actualizar');
        }
    }

    validateNumber(number: number): void {
        if (!Number.isInteger(number) || number <= 0) {
            throw new Error('El número de Locker debe ser positivo');
        }
    }

    validateLocation(location: string): void {
        if (!location || location.trim().length === 0) {
            throw new Error('La ubicación es obligatoria');
        }
    }

    async validateNumberIsUnique(number: number): Promise<void> {
        const lockerWithSameNumber = await this.lockerRepo.findByNumber(number);

        if (lockerWithSameNumber) {
            throw new Error('Ya existe un Locker con ese número');
        }
    }

    validateLockerExists(locker: LockerDTO | null): asserts locker is LockerDTO {
        if (!locker) {
            throw new Error('El Locker no existe');
        }
    }

    validateMaintenanceAssignment(
        currentStatus: LockerDTO['status'],
        nextStatus: LockerDTO['status'],
        nextMemberId: string | null,
    ): void {
        if (
            currentStatus === 'Mantenimiento' &&
            nextStatus === 'Mantenimiento' &&
            nextMemberId !== null
        ) {
            throw new Error('El Locker está en mantenimiento y no puede asignarse');
        }

        if (nextStatus === 'Mantenimiento' && nextMemberId !== null) {
            throw new Error(
                'No se puede poner en mantenimiento un Locker ocupado. Desasigná el socio primero',
            );
        }
    }

    validateOccupiedReassignment(
        currentLocker: LockerDTO,
        nextMemberId: string | null,
    ): void {
        if (
            currentLocker.status === 'Ocupado' &&
            currentLocker.member_id !== null &&
            nextMemberId !== null &&
            nextMemberId !== currentLocker.member_id
        ) {
            throw new Error('El Locker ya se encuentra ocupado');
        }
    }
}
