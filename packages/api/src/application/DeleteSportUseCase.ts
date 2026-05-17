import { SportRepository } from '../domain/SportRepository.js';
import { DeleteSportValidator } from '../domain/services/DeleteSportValidator.js';

export class DeleteSportUseCase {
    constructor(
        private readonly sportRepository: SportRepository,
        private readonly deleteSportValidator: DeleteSportValidator,
    ) {}

    async execute(id: string): Promise<void> {
        const sport = await this.sportRepository.findById(id);
        if (!sport) {
            throw new Error('El deporte no existe');
        }

        await this.deleteSportValidator.validateNoActiveEnrollments(id);

        await this.sportRepository.delete(id);
    }
}
