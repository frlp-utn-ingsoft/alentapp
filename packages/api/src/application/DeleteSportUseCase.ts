import { SportDTO } from '@alentapp/shared';
import { SportRepository } from '../domain/SportRepository.js';

export class DeleteSportUseCase {
    constructor(private readonly sportRepo: SportRepository) {}

    async execute(id: string): Promise<SportDTO> {
        // Delega la baja lógica al repositorio
        return this.sportRepo.softDelete(id);
    }
}