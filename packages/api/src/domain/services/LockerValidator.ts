import { LockerRepository } from '../LockerRepository.js';

export class LockerValidator {
    constructor(private readonly lockerRepo: LockerRepository) {}

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
}
