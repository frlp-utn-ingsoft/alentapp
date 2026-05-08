import { SportRepository } from '../SportRepository.js';

export class SportValidator {
    constructor(private readonly sportRepo: SportRepository) {}

    validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('El nombre del deporte es obligatorio');
        }
    }

    validateMaxCapacity(maxCapacity: number): void {
        if (!Number.isInteger(maxCapacity) || maxCapacity <= 0) {
            throw new Error('El cupo máximo debe ser mayor a cero');
        }
    }

    validateAdditionalPrice(price: number): void {
        if (typeof price !== 'number' || price < 0) {
            throw new Error('El precio adicional no puede ser negativo');
        }
    }

    async validateNameIsUnique(name: string): Promise<void> {
        const existing = await this.sportRepo.findActiveByName(name.trim());
        if (existing) {
            throw new Error('Ya existe un deporte con ese nombre');
        }
    }

    validateNameNotInPayload(data: Record<string, unknown>): void {
        if ('name' in data) {
            throw new Error('El nombre del deporte no puede modificarse');
        }
    }
}
