import { SportRepository } from '../SportRepository.js';

export class SportValidator {
  constructor(private readonly sportRepo: SportRepository) {}

  validateNameIsRequired(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre del deporte es obligatorio');
    }
  }

  async validateNameIsUnique(name: string): Promise<void> {
    const sportWithSameName = await this.sportRepo.findByName(name.trim());
    if (sportWithSameName) {
      throw new Error('Ya existe un deporte con ese nombre');
    }
  }

  validateMaxCapacity(maxCapacity: number): void {
    if (!Number.isInteger(maxCapacity) || maxCapacity <= 0) {
      throw new Error('El cupo máximo debe ser mayor a cero');
    }
  }

  validateNameIsImmutable(data: Record<string, unknown>): void {
    if ('name' in data) {
      throw new Error('El nombre del deporte no puede modificarse');
    }
  }
}
