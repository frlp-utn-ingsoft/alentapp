import { DisciplineRepository } from "../domain/DisciplineRepository.js";
import { DisciplineValidator } from "../domain/services/DisciplineValidator.js";
import { DisciplineDTO, CreateDisciplineRequest } from '@alentapp/shared';

export class CreateDisciplineUseCase {
    constructor(
        private disciplineRepository: DisciplineRepository,
        private disciplineValidator: DisciplineValidator
    ) {}

    async execute(data: CreateDisciplineRequest): Promise<DisciplineDTO> {
        // 1. Validaciones de negocio (centralizadas)
        this.disciplineValidator.validateRequiredFields(data);
        this.disciplineValidator.validateReason(data.reason);
        this.disciplineValidator.validateIsTotalSuspension(data.is_total_suspension);
        this.disciplineValidator.validateDateFormat(data.start_date);
        this.disciplineValidator.validateDateFormat(data.end_date);
        this.disciplineValidator.validateEndDateAfterStartDate(data.start_date, data.end_date);
        await this.disciplineValidator.validateMemberExists(data.member_id);

        // 2. Persistencia a traves de la interfaz (sin saber que DB es)

        const newDiscipline = await this.disciplineRepository.create({
            ...data,
            deleted_at: null
        });

        return newDiscipline;
    }
}