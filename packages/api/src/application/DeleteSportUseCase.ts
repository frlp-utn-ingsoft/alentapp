import { SportRepository } from '../domain/SportRepository.js';

export class DeleteSportUseCase {
    constructor(private readonly sportRepo: SportRepository) {}

    async execute(id: string): Promise<void> {
        // 1. Verificar que el deporte existe y está activo
        const existing = await this.sportRepo.findActiveById(id);
        if (!existing) {
            throw new Error('No existe un deporte con ese ID');
        }

        // 2. Borrado lógico (soft delete)
        await this.sportRepo.softDelete(id);
    }
}
