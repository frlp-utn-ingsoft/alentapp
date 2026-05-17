import { SportDTO, UpdateSportRequest } from '@alentapp/shared';
import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';

export class UpdateSportUseCase {
    constructor(
        private readonly sportRepository: SportRepository,
        private readonly sportValidator: SportValidator,
    ) {}

    async execute(id: string, data: UpdateSportRequest = {}): Promise<SportDTO> {
        const existingSport = await this.sportRepository.findById(id);
        if (!existingSport) {
            throw new Error('El deporte no existe');
        }

        this.sportValidator.validateNameCannotBeModified(data as Record<string, unknown>);

        if (data.max_capacity !== undefined) {
            this.sportValidator.validateMaxCapacity(data.max_capacity);
        }

        const updateData: UpdateSportRequest = {
            ...(data.description !== undefined && { description: data.description }),
            ...(data.max_capacity !== undefined && { max_capacity: data.max_capacity }),
        };

        return this.sportRepository.update(id, updateData);
    }
}
