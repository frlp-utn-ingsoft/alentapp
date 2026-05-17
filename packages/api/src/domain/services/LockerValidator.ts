import { CreateLockerRequest } from '@alentapp/shared';
import { LockerRepository } from '../LockerRepository.js';

export class LockerValidator {
    constructor(private readonly repo: LockerRepository) {}

    validateRequiredFields(data: CreateLockerRequest): void {
        if (
            data.number === undefined ||
            data.number === null ||
            data.location === undefined ||
            data.location === null
        ) {
            throw new Error('Todos los campos son requeridos');
        }
    }

    validateNumber(number: number): void {
        if (!Number.isInteger(number)) {
            throw new Error('El número de locker debe ser un entero válido');
        }

        if (number <= 0) {
            throw new Error('El número de locker debe ser mayor a cero');
        }
    }

    validateLocation(location: string): void {
        const valid = ['MALE', 'FEMALE', 'CHILDREN'];

        if (!valid.includes(location)) {
            throw new Error('La ubicación seleccionada no es válida');
        }
    }

    async validateUniqueNumber(number: number): Promise<void> {
        const exists = await this.repo.findByNumber(number);

        if (exists) {
            throw new Error('Ya existe un locker con ese número');
        }
    }
}