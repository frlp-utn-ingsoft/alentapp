import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { SportDTO } from '@alentapp/shared';

export class CreateSportUseCase {
    constructor(
        private readonly sportRepository: SportRepository,
        private readonly sportValidator: SportValidator
    ) {}

    async execute(data: Omit<SportDTO, 'id'>): Promise<SportDTO> {
        // 1. Validaciones de negocio (centralizadas)
        this.sportValidator.validateMaxCapacity(data.max_capacity);
        await this.sportValidator.validateNameIsUnique(data.name);

        // 2. Persistencia a través de la interfaz (sin saber qué DB es)
        const nuevoDeporte = await this.sportRepository.create(data);

        return nuevoDeporte;
    }
}