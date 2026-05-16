import { SportRepository } from '../domain/SportRepository.js';
import { SportDTO } from '@alentapp/shared';

export class GetSportsUseCase {
    constructor(private readonly sportRepository: SportRepository) {}

    async execute(): Promise<SportDTO[]> {
        // La condición deleted_at = null se resuelve en el repositorio concreto.
        return this.sportRepository.findAllActive();
    }
}