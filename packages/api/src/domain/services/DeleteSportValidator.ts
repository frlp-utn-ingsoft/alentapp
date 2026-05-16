import { SportRepository } from '../SportRepository.js';

export class DeleteSportValidator {
    constructor(private readonly sportRepo: SportRepository) {}

    async validateNoActiveEnrollments(sportId: string): Promise<void> {
        const hasActiveEnrollments = await this.sportRepo.hasActiveEnrollments(sportId);
        if (hasActiveEnrollments) {
            throw new Error('No se puede eliminar un deporte con inscripciones activas');
        }
    }
}
