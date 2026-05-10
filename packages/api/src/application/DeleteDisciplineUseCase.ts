import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';

export class DeleteDisciplineUseCase {
    constructor(
        private readonly disciplineRepo: DisciplineRepository,
        private readonly disciplineValidator: DisciplineValidator,
    ) {}

    async execute(id: string): Promise<void> {
        this.disciplineValidator.validateDisciplineId(id);

        const existingDiscipline = await this.disciplineRepo.findById(id);
        if (!existingDiscipline) {
            throw new Error('La sancion no existe');
        }

        await this.disciplineRepo.delete(id);
    }
}
