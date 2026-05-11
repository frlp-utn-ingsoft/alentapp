import { DisciplineDTO } from '@alentapp/shared';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';

export class GetDisciplineUseCase {
    constructor(
        private readonly disciplineRepo: DisciplineRepository,
        private readonly disciplineValidator: DisciplineValidator,
    ) {}

    async execute(id: string): Promise<DisciplineDTO> {
        this.disciplineValidator.validateReportedId(id);

        const discipline = await this.disciplineRepo.findById(id);
        if (!discipline) {
            throw new Error('La sancion no existe');
        }

        return discipline;
    }
}
