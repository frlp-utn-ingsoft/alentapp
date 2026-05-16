import { SportRepository } from '../../domain/SportRepository.js';
import { SportValidator } from '../../domain/services/SportValidator.js';
import { SportDTO, UpdateSportRequest } from '@alentapp/shared';

export class UpdateSportUseCase {
    constructor(
        private readonly sportRepository: SportRepository,
        private readonly sportValidator: SportValidator
    ) {}

    async execute(id: string, data: UpdateSportRequest): Promise<SportDTO> {
        // 1. Verificar que el deporte existe
        const sport = await this.sportRepository.findById(id);
        if (!sport) {
            throw new Error('El deporte indicado no se encuentra registrado');
        }

        // 2. Validaciones de negocio
        if (data.max_capacity !== undefined) {
            this.sportValidator.validateMaxCapacity(data.max_capacity);
        }

        // 3. Persistencia
        return this.sportRepository.update(id, data);
    }
}