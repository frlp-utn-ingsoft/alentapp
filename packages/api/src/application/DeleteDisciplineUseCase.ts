import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';

export class DeleteDisciplineUseCase {
    constructor(
        private readonly disciplineRepository: DisciplineRepository,
        private readonly disciplineValidator: DisciplineValidator,
    ) {}

    async execute(id: string): Promise<void> {
        this.disciplineValidator.validateIdFormat(id);

        const existingDiscipline = await this.disciplineRepository.findById(id);

        if (!existingDiscipline) {
            throw new Error('La sanción no existe');
        }

        if (existingDiscipline.deleted_at !== null) {
            throw new Error('La sanción ya fue eliminada');
        }

        await this.disciplineRepository.softDelete(id);
    }
}