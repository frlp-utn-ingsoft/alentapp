import { DisciplineDTO, UpdateDisciplineRequest } from '@alentapp/shared';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';

export class UpdateDisciplineUseCase {
    constructor(
        private readonly disciplineRepo: DisciplineRepository,
        private readonly disciplineValidator: DisciplineValidator,
    ) {}

    async execute(id: string, data: UpdateDisciplineRequest = {}): Promise<DisciplineDTO> {
        this.disciplineValidator.validateDisciplineId(id);
        const updateData = data ?? {};

        const existingDiscipline = await this.disciplineRepo.findById(id);
        if (!existingDiscipline) {
            throw new Error('La sancion no existe');
        }

        const finalReason = updateData.reason !== undefined ? updateData.reason : existingDiscipline.reason;
        const finalStartDate = updateData.startDate !== undefined ? updateData.startDate : existingDiscipline.startDate;
        const finalEndDate = updateData.endDate !== undefined ? updateData.endDate : existingDiscipline.endDate;

        this.disciplineValidator.validateReason(finalReason);
        this.disciplineValidator.validateDates(finalStartDate, finalEndDate);

        if (updateData.isTotalSuspension !== undefined) {
            this.disciplineValidator.validateTotalSuspension(updateData.isTotalSuspension);
        }

        return this.disciplineRepo.update(id, updateData);
    }
}
