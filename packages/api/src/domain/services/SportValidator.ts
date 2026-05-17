import { SportRepository } from '../SportRepository.js';

export class SportValidator {
    constructor(private readonly sportRepository: SportRepository) {}

    validateMaxCapacity(maxCapacity: number): void {
        if (maxCapacity <= 0) {
            throw new Error('La capacidad debe ser mayor a cero');
        }
    }

    validateNameCannotBeModified(data: Record<string, unknown> | null | undefined): void {
        if (data && Object.prototype.hasOwnProperty.call(data, 'name')) {
            throw new Error('El nombre del deporte no puede modificarse');
        }
    }

    async validateNameIsUnique(name: string): Promise<void> {
        const sportWithSameName = await this.sportRepository.findByName(name);
        if (sportWithSameName) {
            throw new Error('Ya existe un deporte con ese nombre');
        }
    }
}
